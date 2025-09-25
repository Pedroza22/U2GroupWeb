from django.db import models
import uuid

def generate_default_visitor_id():
    return f'legacy_{uuid.uuid4().hex[:8]}'

# Create your models here.

class Project(models.Model):
    """
    Modelo simple para proyectos
    """
    # Campos básicos requeridos
    title = models.CharField(max_length=255, help_text="Título del proyecto")
    description = models.TextField(blank=True, null=True, help_text="Descripción del proyecto")
    color = models.CharField(max_length=20, default="#3B82F6", help_text="Color del proyecto")
    
    # Campos de categorización
    category = models.CharField(max_length=100, help_text="Categoría del proyecto", default="General")
    type = models.CharField(max_length=100, help_text="Tipo de proyecto", default="Proyecto")
    year = models.CharField(max_length=10, help_text="Año del proyecto")
    utilization = models.CharField(max_length=100, help_text="Utilización del proyecto", default="Private House")
    services = models.CharField(max_length=200, help_text="Servicios del proyecto", default="Private House Design")
    size = models.CharField(max_length=50, help_text="Tamaño del proyecto", default="140m2")
    
    # Campos de ubicación
    location = models.CharField(max_length=255, help_text="Ubicación del proyecto", default="Ubicación no especificada")
    latitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True, help_text="Latitud")
    longitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True, help_text="Longitud")
    show_on_map = models.BooleanField(default=False, help_text="Mostrar en el mapa")
    
    # Campos de estado
    status = models.CharField(max_length=50, default="Planning", help_text="Estado del proyecto")
    featured = models.BooleanField(default=False, help_text="Proyecto destacado")
    
    # Imagen
    image = models.ImageField(upload_to='projects/', null=True, blank=True, help_text="Imagen del proyecto")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Proyecto"
        verbose_name_plural = "Proyectos"

    def __str__(self):
        return self.title

class ProjectImage(models.Model):
    """
    Imágenes adicionales para proyectos
    """
    project = models.ForeignKey(Project, related_name='images', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='projects/extra_images/')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Imagen de {self.project.title}"

class Blog(models.Model):
    """
    Modelo para blogs - Ajustado para coincidir con la base de datos existente
    """
    title = models.CharField(max_length=255, default="Blog Title")
    author = models.CharField(max_length=255, default="Author")
    date = models.DateField(default="2023-01-01")  # Cambiado de DateTimeField a DateField
    category = models.CharField(max_length=100, default="General")
    read_time = models.CharField(max_length=50, default="5 min")
    image = models.CharField(max_length=500, null=True, blank=True)  # Mantener como CharField para compatibilidad
    summary = models.TextField(default="Blog summary")
    content = models.TextField(default="Blog content")
    tags = models.TextField(default="")
    featured = models.BooleanField(default=False)
    favorite_count = models.IntegerField(default=0)
    like_count = models.IntegerField(default=0)
    excerpt = models.TextField(blank=True, null=True)
    slug = models.CharField(max_length=50, blank=True, null=True, default="")

    class Meta:
        ordering = ['-date']

    def __str__(self):
        return self.title

class BlogImage(models.Model):
    """
    Imágenes adicionales para blogs
    """
    blog = models.ForeignKey(Blog, related_name='extra_images', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='blogs/extra_images/')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Imagen de {self.blog.title}"

class BlogLikeFavorite(models.Model):
    """
    Sistema de likes y favoritos para blogs
    """
    blog = models.ForeignKey(Blog, on_delete=models.CASCADE, related_name='interactions')
    visitor_id = models.CharField(max_length=50, default=generate_default_visitor_id)
    liked = models.BooleanField(default=False)
    favorited = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['blog', 'visitor_id']
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.visitor_id} - {self.blog.title}"

class ProjectLikeFavorite(models.Model):
    """
    Sistema de likes y favoritos para proyectos
    """
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='interactions')
    visitor_id = models.CharField(max_length=50, default=generate_default_visitor_id)
    liked = models.BooleanField(default=False)
    favorited = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['project', 'visitor_id']
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.visitor_id} - {self.project.title}"

class MarketplaceProduct(models.Model):
    """
    Productos del marketplace
    """
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    category = models.CharField(max_length=100)
    style = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    area_m2 = models.DecimalField(max_digits=8, decimal_places=2)
    rooms = models.IntegerField()
    bathrooms = models.IntegerField()
    floors = models.IntegerField()
    image = models.ImageField(upload_to='marketplace/', null=True, blank=True)
    zip_file = models.FileField(upload_to='marketplace/zips/', null=True, blank=True, help_text="Archivo ZIP del producto")
    features = models.JSONField(default=list)
    is_featured = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    included_items = models.JSONField(default=list)
    not_included_items = models.JSONField(default=list)
    price_editable_m2 = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    price_editable_sqft = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    price_pdf_m2 = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    price_pdf_sqft = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    area_sqft = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    area_unit = models.CharField(max_length=10, default='m2')
    garage_spaces = models.IntegerField(default=0)
    main_level_images = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name

class MarketplaceProductImage(models.Model):
    """
    Imágenes adicionales para productos del marketplace
    """
    product = models.ForeignKey(MarketplaceProduct, related_name='additional_images', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='marketplace/additional_images/')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Imagen de {self.product.name}"

class Cart(models.Model):
    """
    Carrito de compras del usuario
    """
    user = models.ForeignKey('auth.User', on_delete=models.CASCADE, related_name='carts')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Carrito de {self.user.username}"

    @property
    def total(self):
        return sum(item.subtotal for item in self.items.all())

class CartItem(models.Model):
    """
    Items del carrito de compras
    """
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(MarketplaceProduct, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2, help_text="Precio al momento de agregar al carrito")

    class Meta:
        unique_together = ['cart', 'product']

    def __str__(self):
        return f"{self.quantity}x {self.product.name}"

    @property
    def subtotal(self):
        return self.quantity * self.price

class MarketplaceOrder(models.Model):
    """
    Órdenes de compra del marketplace
    """
    STATUS_CHOICES = [
        ('pending', 'Pendiente'),
        ('paid', 'Pagado'),
        ('processing', 'Procesando'),
        ('completed', 'Completado'),
        ('cancelled', 'Cancelado'),
    ]

    user = models.ForeignKey('auth.User', on_delete=models.CASCADE, related_name='marketplace_orders')
    stripe_payment_intent_id = models.CharField(max_length=255, null=True, blank=True)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    customer_email = models.EmailField(blank=True, null=True, help_text="Email del cliente desde el formulario de checkout")
    shipping_address = models.TextField(blank=True)
    billing_address = models.TextField(blank=True)
    zip_files_sent = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Orden Marketplace {self.id} - {self.user.username}"

class MarketplaceOrderItem(models.Model):
    """
    Items de las órdenes del marketplace
    """
    order = models.ForeignKey(MarketplaceOrder, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(MarketplaceProduct, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    zip_sent = models.BooleanField(default=False)
    zip_sent_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.quantity}x {self.product.name}"

    @property
    def subtotal(self):
        return self.quantity * self.price

class ProductFavorite(models.Model):
    """
    Productos favoritos del usuario
    """
    user = models.ForeignKey('auth.User', on_delete=models.CASCADE, related_name='favorites')
    product = models.ForeignKey(MarketplaceProduct, on_delete=models.CASCADE, related_name='favorited_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'product']
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.product.name}" 

class ContactMessage(models.Model):
    """
    Modelo para mensajes de contacto
    """
    STATUS_CHOICES = [
        ('new', 'Nuevo'),
        ('read', 'Leído'),
        ('responded', 'Respondido'),
        ('archived', 'Archivado'),
    ]
    
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True, null=True)
    project_location = models.CharField(max_length=200, blank=True, null=True)
    timeline = models.CharField(max_length=50, blank=True, null=True)
    comments = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new')
    admin_notes = models.TextField(blank=True, null=True, help_text="Notas del administrador sobre el mensaje")
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Mensaje de contacto'
        verbose_name_plural = 'Mensajes de contacto'
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} - {self.email}"
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

class OrderZipFile(models.Model):
    """
    Archivos ZIP asociados a órdenes del marketplace
    """
    order = models.ForeignKey(MarketplaceOrder, on_delete=models.CASCADE, related_name='zip_files')
    file = models.FileField(upload_to='order_zips/', help_text="Archivo ZIP con los planos y documentos")
    filename = models.CharField(max_length=255, help_text="Nombre original del archivo")
    file_size = models.PositiveIntegerField(help_text="Tamaño del archivo en bytes")
    uploaded_by = models.ForeignKey('auth.User', on_delete=models.CASCADE, help_text="Usuario que subió el archivo")
    uploaded_at = models.DateTimeField(auto_now_add=True)
    sent_to_customer = models.BooleanField(default=False, help_text="Si el archivo fue enviado al cliente")
    sent_at = models.DateTimeField(null=True, blank=True, help_text="Fecha de envío al cliente")
    
    class Meta:
        ordering = ['-uploaded_at']
        verbose_name = 'Archivo ZIP de orden'
        verbose_name_plural = 'Archivos ZIP de órdenes'
    
    def __str__(self):
        return f"ZIP para orden {self.order.id} - {self.filename}"
    
    def save(self, *args, **kwargs):
        # Calcular el tamaño del archivo si no se ha establecido
        if not self.file_size and self.file:
            self.file_size = self.file.size
        super().save(*args, **kwargs)


class SiteConfig(models.Model):
    """
    Modelo para la configuración del sitio web
    """
    key = models.CharField(max_length=255, unique=True, db_index=True, help_text="Clave de configuración")
    value = models.TextField(help_text="Valor de la configuración")
    description = models.TextField(blank=True, null=True, help_text="Descripción de la configuración")
    category = models.CharField(max_length=100, default="general", help_text="Categoría de la configuración")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['category', 'key']
        verbose_name = "Configuración del Sitio"
        verbose_name_plural = "Configuraciones del Sitio"

    def __str__(self):
        return f"{self.key}: {self.value[:50]}..." 