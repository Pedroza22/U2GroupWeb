from rest_framework import serializers
from .models import Category, Service, GeneralConfig, DesignEntry, FilterConfiguration

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'emoji']

class ServiceSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    category_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = Service
        fields = [
            'id', 'category', 'category_id', 'name_en', 'name_es', 
            'price_min_usd', 'area_max_m2', 'max_units', 'notes', 'image'
        ]

class GeneralConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = GeneralConfig
        fields = ['key', 'value']

class DesignEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = DesignEntry
        fields = [
            'id', 'area_total', 'area_basica', 'area_disponible', 
            'area_usada', 'porcentaje_ocupado', 'opciones', 'precio_total', 
            'correo', 'created_at'
        ]
        read_only_fields = ['created_at']

class FilterConfigurationSerializer(serializers.ModelSerializer):
    class Meta:
        model = FilterConfiguration
        fields = ['id', 'name', 'key', 'options']