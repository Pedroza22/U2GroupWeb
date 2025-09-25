from rest_framework import serializers
from .models import (
    Project, ProjectImage, Blog, BlogImage, BlogLikeFavorite, ProjectLikeFavorite, 
    MarketplaceProduct, MarketplaceProductImage, Cart, CartItem, MarketplaceOrder, MarketplaceOrderItem, ProductFavorite, ContactMessage, SiteConfig
)

class ProjectImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectImage
        fields = ['id', 'image', 'project']

class ProjectSerializer(serializers.ModelSerializer):
    """
    Serializer simple para el modelo Project
    """
    images = ProjectImageSerializer(many=True, read_only=True)
    
    # Hacer los campos opcionales para evitar errores de validación
    category = serializers.CharField(required=False, allow_blank=True)
    type = serializers.CharField(required=False, allow_blank=True)
    location = serializers.CharField(required=False, allow_blank=True)
    year = serializers.CharField(required=False, allow_blank=True)
    
    def validate(self, data):
        """
        Validación personalizada para manejar campos vacíos
        """
        # Si category está vacío, usar un valor por defecto
        if not data.get('category') or data.get('category', '').strip() == '':
            data['category'] = 'General'
        
        # Si type está vacío, usar un valor por defecto
        if not data.get('type') or data.get('type', '').strip() == '':
            data['type'] = 'Proyecto'
        
        # Si location está vacío, usar un valor por defecto
        if not data.get('location') or data.get('location', '').strip() == '':
            data['location'] = 'Ubicación no especificada'
        
        # Si year está vacío, usar un valor por defecto
        if not data.get('year') or data.get('year', '').strip() == '':
            data['year'] = '2024'
        
        return data
    
    class Meta:
        model = Project
        fields = [
            'id', 'title', 'description', 'color', 'category', 'type', 'year',
            'utilization', 'services', 'size', 'location', 'latitude', 'longitude', 'show_on_map', 
            'status', 'featured', 'image', 'created_at', 'updated_at', 'images'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'images']

class BlogImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogImage
        fields = ['id', 'image', 'blog']

class BlogSerializer(serializers.ModelSerializer):
    extra_images = BlogImageSerializer(many=True, read_only=True)
    images = serializers.SerializerMethodField()
    
    def get_images(self, obj):
        """Alias para extra_images para compatibilidad con el frontend"""
        return BlogImageSerializer(obj.extra_images.all(), many=True).data
    
    class Meta:
        model = Blog
        fields = [
            'id', 'title', 'content', 'image', 'date', 'author', 
            'category', 'read_time', 'summary', 'tags',
            'excerpt', 'slug', 'featured', 'like_count', 'favorite_count',
            'extra_images', 'images'
        ]
        read_only_fields = ['id', 'like_count', 'favorite_count', 'extra_images', 'images']

class BlogLikeFavoriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogLikeFavorite
        fields = ['id', 'blog', 'visitor_id', 'liked', 'favorited', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class ProjectLikeFavoriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectLikeFavorite
        fields = ['id', 'project', 'visitor_id', 'liked', 'favorited', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class MarketplaceProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = MarketplaceProductImage
        fields = ['id', 'image', 'created_at']

class MarketplaceProductSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    additional_images = MarketplaceProductImageSerializer(many=True, read_only=True)
    images = serializers.SerializerMethodField()
    
    def get_image(self, obj):
        """Obtener la URL completa de la imagen principal"""
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            else:
                # Usar la URL del servidor configurado
                from django.conf import settings
                base_url = getattr(settings, 'BASE_URL', 'http://localhost:8000')
                return f"{base_url}{obj.image.url}"
        return None
    
    def get_images(self, obj):
        """Obtener las URLs de las imágenes adicionales"""
        from django.conf import settings
        request = self.context.get('request')
        if request:
            return [request.build_absolute_uri(img.image.url) for img in obj.additional_images.all()]
        else:
            # Usar la URL del servidor configurado
            base_url = getattr(settings, 'BASE_URL', 'http://localhost:8000')
            return [f"{base_url}{img.image.url}" for img in obj.additional_images.all()]
    
    class Meta:
        model = MarketplaceProduct
        fields = [
            'id', 'name', 'description', 'category', 'style', 'price',
            'area_m2', 'rooms', 'bathrooms', 'floors', 'image', 'zip_file', 'features',
            'is_featured', 'is_active', 'included_items', 'not_included_items',
            'price_editable_m2', 'price_editable_sqft', 'price_pdf_m2', 'price_pdf_sqft',
            'area_sqft', 'area_unit', 'garage_spaces', 'main_level_images',
            'additional_images', 'images', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'additional_images']

class CartItemSerializer(serializers.ModelSerializer):
    product = MarketplaceProductSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'product_id', 'quantity', 'price', 'subtotal']
        read_only_fields = ['id', 'price', 'subtotal']

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = Cart
        fields = ['id', 'user', 'items', 'total', 'created_at', 'updated_at', 'is_active']
        read_only_fields = ['id', 'user', 'total', 'created_at', 'updated_at']

class MarketplaceOrderItemSerializer(serializers.ModelSerializer):
    product = MarketplaceProductSerializer(read_only=True)
    plan_info = serializers.SerializerMethodField()
    area_info = serializers.SerializerMethodField()

    def get_plan_info(self, obj):
        """Obtener información del plan seleccionado"""
        # Por ahora, inferir el plan basado en el precio
        base_price = float(obj.product.price)
        item_price = float(obj.price)
        
        if abs(item_price - base_price) < 0.01:
            return "PDF"
        elif abs(item_price - (base_price * 1.5)) < 0.01:
            return "Archivo Editable"
        else:
            return f"Personalizado (${item_price})"
    
    def get_area_info(self, obj):
        """Obtener información del área"""
        area_m2 = obj.product.area_m2
        area_sqft = obj.product.area_sqft
        return {
            'm2': area_m2,
            'sqft': area_sqft,
            'unit': obj.product.area_unit or 'm2'
        }

    class Meta:
        model = MarketplaceOrderItem
        fields = ['id', 'product', 'quantity', 'price', 'subtotal', 'zip_sent', 'zip_sent_at', 'plan_info', 'area_info']
        read_only_fields = ['id', 'subtotal', 'zip_sent', 'zip_sent_at', 'plan_info', 'area_info']

class MarketplaceOrderSerializer(serializers.ModelSerializer):
    items = MarketplaceOrderItemSerializer(many=True, read_only=True)
    customer_email = serializers.SerializerMethodField()
    user_email = serializers.SerializerMethodField()

    def get_customer_email(self, obj):
        """Obtener email del cliente desde la orden o del usuario"""
        return obj.customer_email or getattr(obj.user, 'email', 'No especificado')
    
    def get_user_email(self, obj):
        """Obtener email del usuario registrado"""
        return getattr(obj.user, 'email', 'No especificado')

    class Meta:
        model = MarketplaceOrder
        fields = [
            'id', 'user', 'user_email', 'customer_email', 'stripe_payment_intent_id', 'total_amount', 'status',
            'shipping_address', 'billing_address', 'zip_files_sent', 'items',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'stripe_payment_intent_id', 'zip_files_sent', 'created_at', 'updated_at']

class ProductFavoriteSerializer(serializers.ModelSerializer):
    product = MarketplaceProductSerializer(read_only=True)

    class Meta:
        model = ProductFavorite
        fields = ['id', 'user', 'product', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']
        
    def create(self, validated_data):
        # Asegurar que el usuario se establezca correctamente
        validated_data['user'] = self.context['request'].user
        
        # Manejar tanto 'product' como 'product_id' en los datos iniciales
        if 'product' not in validated_data and 'product' in self.initial_data:
            validated_data['product'] = self.initial_data['product']
        elif 'product_id' in self.initial_data:
            validated_data['product'] = self.initial_data['product_id']
            
        return super().create(validated_data) 

class ContactMessageSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"
    
    class Meta:
        model = ContactMessage
        fields = [
            'id', 'first_name', 'last_name', 'full_name', 'email', 'phone', 
            'project_location', 'timeline', 'comments', 'created_at', 'is_read',
            'status', 'status_display', 'admin_notes'
        ]
        read_only_fields = ['id', 'created_at', 'full_name', 'status_display']


class SiteConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteConfig
        fields = ['id', 'key', 'value', 'description', 'category', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at'] 