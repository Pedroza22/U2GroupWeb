from rest_framework import serializers
from django.contrib.auth.models import User as DjangoUser
from .models import (
    CalculatorEntry, Project, Product, ProductImage, 
    UserProfile, Order, OrderItem, User
)

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ('accepted_policies',)

class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(required=True)
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'profile')
        extra_kwargs = {
            'password': {'write_only': True},
        }

    def create(self, validated_data):
        profile_data = validated_data.pop('profile')
        password = validated_data.pop('password')
        
        # Crear el usuario usando el modelo base de Django
        from django.contrib.auth.models import User as DjangoUser
        user = DjangoUser.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=password
        )
        
        # Crear el perfil del usuario
        UserProfile.objects.create(
            user=user,
            accepted_policies=profile_data.get('accepted_policies', False)
        )
        
        return user

class CalculatorEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = CalculatorEntry
        fields = '__all__'

class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = '__all__'

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'order']

class ProductSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    area_sqft = serializers.FloatField(read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'description', 'area_m2', 'area_sqft',
            'bedrooms', 'bathrooms', 'garage', 'price',
            'architectural_style', 'main_image', 'images',
            'created_at', 'updated_at'
        ]

class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_image = serializers.CharField(source='product.main_image.url', read_only=True)
    
    class Meta:
        model = OrderItem
        fields = ('id', 'product', 'product_name', 'product_image', 'price', 'quantity')
        read_only_fields = ('product_name', 'product_image')

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    user = serializers.StringRelatedField(read_only=True)
    status = serializers.SerializerMethodField()
    
    # Campos para crear la orden
    order_items = serializers.ListField(write_only=True, required=False)
    
    class Meta:
        model = Order
        fields = ('id', 'user', 'created_at', 'total_price', 'items', 'status', 'order_items')
        read_only_fields = ('total_price', 'created_at')

    def get_status(self, obj):
        # Por ahora retornamos un estado fijo, pero aquí podrías implementar la lógica real
        return 'completed'
    
    def create(self, validated_data):
        print(f"🔍 OrderSerializer.create() called with validated_data: {validated_data}")
        order_items_data = validated_data.pop('order_items', [])
        print(f"🔍 order_items_data: {order_items_data}")
        user = validated_data.pop('user')  # Extraer user separadamente
        print(f"🔍 user: {user}")
        print(f"🔍 remaining validated_data: {validated_data}")
        
        # Crear la orden sin total_price inicialmente
        order = Order.objects.create(
            user=user,
            total_price=0,  # Se calculará después
            **validated_data
        )
        print(f"🔍 Order created: {order}")
        
        total_price = 0
        
        # Crear los items de la orden
        for item_data in order_items_data:
            product_id = item_data.get('product_id')
            quantity = item_data.get('quantity', 1)
            
            try:
                from .models import Product
                product = Product.objects.get(id=product_id)
                
                order_item = OrderItem.objects.create(
                    order=order,
                    product=product,
                    price=product.price,
                    quantity=quantity
                )
                
                total_price += product.price * quantity
                
            except Product.DoesNotExist:
                # Si el producto no existe, eliminar la orden y lanzar error
                order.delete()
                raise serializers.ValidationError(f"Producto con ID {product_id} no encontrado")
        
        # Actualizar el precio total
        order.total_price = total_price
        order.save()
        
        return order