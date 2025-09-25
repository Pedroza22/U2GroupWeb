from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProjectViewSet, BlogViewSet, BlogLikeFavoriteViewSet, ProjectLikeFavoriteViewSet, upload_blog_image, upload_project_image, toggle_project_like_favorite, toggle_blog_like_favorite, SiteConfigViewSet, update_site_config_bulk
from .marketplace_views import MarketplaceProductViewSet, CartViewSet, MarketplaceOrderViewSet, ProductFavoriteViewSet, StripeWebhookView, SendZipFilesView
from .contact_views import ContactMessageViewSet, send_contact_message
from .design_views import DesignServicesView, DesignServiceDetailView, DesignServiceCreateView, DesignCategoriesView, DesignCategoryCreateView, DesignCategoryDetailView, DesignEntriesView, DesignConfigView

router = DefaultRouter()
router.register(r'projects', ProjectViewSet)
router.register(r'blogs', BlogViewSet)
router.register(r'blog-interactions', BlogLikeFavoriteViewSet)
router.register(r'project-interactions', ProjectLikeFavoriteViewSet)
router.register(r'marketplace', MarketplaceProductViewSet)
router.register(r'cart', CartViewSet, basename='cart')
router.register(r'marketplace-orders', MarketplaceOrderViewSet, basename='marketplace-order')
router.register(r'product-favorites', ProductFavoriteViewSet, basename='product-favorite')
router.register(r'contact-messages', ContactMessageViewSet, basename='contact-message')
router.register(r'site-config', SiteConfigViewSet, basename='site-config')

urlpatterns = [
    path('site-config/bulk-update/', update_site_config_bulk, name='site_config_bulk_update'),
    path('', include(router.urls)),
    path('upload-blog-image/', upload_blog_image, name='upload_blog_image'),
    path('upload-project-image/', upload_project_image, name='upload_project_image'),
    path('toggle-project-interaction/', toggle_project_like_favorite, name='toggle_project_like_favorite'),
    path('toggle-blog-interaction/', toggle_blog_like_favorite, name='toggle_blog_like_favorite'),
    path('send-contact-message/', send_contact_message, name='send_contact_message'),
    path('stripe-webhook/', StripeWebhookView.as_view(), name='stripe_webhook'),
    path('marketplace/orders/<int:order_id>/send-zip-files/', SendZipFilesView.as_view(), name='send_zip_files'),
    
    # Endpoints para servicios de diseño
    path('design/services/', DesignServicesView.as_view(), name='design_services'),
    path('design/services/create/', DesignServiceCreateView.as_view(), name='design_service_create'),
    path('design/services/<int:service_id>/', DesignServiceDetailView.as_view(), name='design_service_detail'),
    path('design/categories/', DesignCategoriesView.as_view(), name='design_categories'),
    path('design/categories/create/', DesignCategoryCreateView.as_view(), name='design_category_create'),
    path('design/categories/<int:category_id>/', DesignCategoryDetailView.as_view(), name='design_category_detail'),
    path('design/entries/', DesignEntriesView.as_view(), name='design_entries'),
    path('design/config/', DesignConfigView.as_view(), name='design_config'),
] 