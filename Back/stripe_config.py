"""
Stripe payment configuration and utilities for U2Group
"""

import os
import stripe
from django.conf import settings

# Initialize Stripe with secret key
stripe.api_key = os.environ.get('STRIPE_SECRET_KEY', 'sk_test_your_stripe_secret_key_here')

def create_payment_intent(amount, currency='usd', metadata=None):
    """
    Create a Stripe payment intent
    
    Args:
        amount (int): Amount in cents
        currency (str): Currency code (default: 'usd')
        metadata (dict): Optional metadata
    
    Returns:
        dict: Payment intent object
    """
    try:
        payment_intent = stripe.PaymentIntent.create(
            amount=amount,
            currency=currency,
            metadata=metadata or {},
            automatic_payment_methods={
                'enabled': True,
            },
        )
        return {
            'success': True,
            'payment_intent': payment_intent,
            'client_secret': payment_intent.client_secret
        }
    except stripe.error.StripeError as e:
        return {
            'success': False,
            'error': str(e)
        }

def validate_stripe_config():
    """
    Validate Stripe configuration
    
    Returns:
        dict: Validation result
    """
    try:
        # Test the API key by retrieving account info
        account = stripe.Account.retrieve()
        return {
            'valid': True,
            'account_id': account.id,
            'country': account.country
        }
    except stripe.error.AuthenticationError:
        return {
            'valid': False,
            'error': 'Invalid Stripe API key'
        }
    except stripe.error.StripeError as e:
        return {
            'valid': False,
            'error': str(e)
        }

def get_stripe_publishable_key():
    """
    Get Stripe publishable key from environment
    
    Returns:
        str: Stripe publishable key
    """
    return os.environ.get('STRIPE_PUBLISHABLE_KEY', 'pk_test_your_stripe_publishable_key_here')

def test_stripe_connection():
    """
    Test the connection to Stripe using the configured API key
    
    Returns:
        tuple: (success: bool, message: str)
    """
    try:
        # Retrieve account information to test the connection
        account = stripe.Account.retrieve()
        
        # Get the current API key (masked for security)
        api_key = stripe.api_key
        masked_key = f"{api_key[:7]}...{api_key[-4:]}" if api_key else "No key configured"
        
        return (
            True, 
            f"✅ Conexión exitosa con Stripe! Cuenta ID: {account.id}, País: {account.country}, API Key: {masked_key}"
        )
        
    except stripe.error.AuthenticationError as e:
        return (
            False,
            f"❌ Error de autenticación: Clave de API inválida. {str(e)}"
        )
        
    except stripe.error.APIConnectionError as e:
        return (
            False,
            f"❌ Error de conexión con la API de Stripe: {str(e)}"
        )
        
    except stripe.error.StripeError as e:
        return (
            False,
            f"❌ Error de Stripe: {str(e)}"
        )
        
    except Exception as e:
        return (
            False,
            f"❌ Error inesperado: {str(e)}"
        )
