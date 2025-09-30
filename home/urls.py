# home/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    CalculatorEntryViewSet, ProjectViewSet, ProductViewSet, 
    ProductImageViewSet, OrderViewSet, register_user, login_user,
    test_stripe_connection_view, test_payment_method_view, validate_discount_view,
    stripe_config, PublicMarketplaceProductViewSet
)
from admin_api.marketplace_views import ProductFavoriteViewSet

router = DefaultRouter()
router.register(r'calculator-entries', CalculatorEntryViewSet)
router.register(r'projects', ProjectViewSet)
router.register(r'products', ProductViewSet)
router.register(r'product-images', ProductImageViewSet)
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'product-favorites', ProductFavoriteViewSet, basename='product-favorite')
router.register(r'marketplace', PublicMarketplaceProductViewSet, basename='marketplace')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/register/', register_user, name='register'),
    path('auth/login/', login_user, name='login'),
    path('auth/login-jwt/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('stripe/test-connection/', test_stripe_connection_view, name='test_stripe_connection'),
    path('stripe/test-payment-method/', test_payment_method_view, name='test_payment_method'),
    path('stripe/validate-discount/', validate_discount_view, name='validate_discount'),
    path('stripe/config/', stripe_config, name='stripe_config'),
]