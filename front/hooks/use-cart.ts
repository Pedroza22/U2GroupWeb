"use client"

import { useState, useEffect } from 'react'

interface CartItem {
  id: number;
  product_name: string;
  price: number;
  quantity: number;
  image_url: string;
  plan_set?: string;
  unit?: string;
}

export function useCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    const loadCart = () => {
      const savedCart = localStorage.getItem("cart")
      if (savedCart) {
        const items = JSON.parse(savedCart)
        setCartItems(items)
        setCartCount(items.reduce((total: number, item: CartItem) => total + item.quantity, 0))
      }
    }

    loadCart()
  }, [])

  const addToCart = (product: {
    id: number;
    name: string;
    price: number;
    main_image: string;
    plan_set?: string;
    unit?: string;
  }) => {
    const existingItemIndex = cartItems.findIndex(item => 
      item.id === product.id && 
      item.plan_set === product.plan_set &&
      item.unit === product.unit
    )

    let updatedItems: CartItem[]

    if (existingItemIndex >= 0) {
      // Update quantity of existing item
      updatedItems = cartItems.map((item, index) =>
        index === existingItemIndex 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    } else {
      // Add new item
      const newItem: CartItem = {
        id: product.id,
        product_name: product.name,
        price: product.price,
        quantity: 1,
        image_url: product.main_image,
        plan_set: product.plan_set,
        unit: product.unit
      }
      updatedItems = [...cartItems, newItem]
    }

    setCartItems(updatedItems)
    const newCount = updatedItems.reduce((total, item) => total + item.quantity, 0)
    setCartCount(newCount)
    localStorage.setItem("cart", JSON.stringify(updatedItems))

    return true
  }

  const removeFromCart = (itemId: number, planSet?: string, unit?: string) => {
    const updatedItems = cartItems.filter(item => 
      !(item.id === itemId && item.plan_set === planSet && item.unit === unit)
    )
    
    setCartItems(updatedItems)
    const newCount = updatedItems.reduce((total, item) => total + item.quantity, 0)
    setCartCount(newCount)
    localStorage.setItem("cart", JSON.stringify(updatedItems))
  }

  const updateQuantity = (itemId: number, newQuantity: number, planSet?: string, unit?: string) => {
    if (newQuantity < 1) {
      removeFromCart(itemId, planSet, unit)
      return
    }

    const updatedItems = cartItems.map(item =>
      (item.id === itemId && item.plan_set === planSet && item.unit === unit)
        ? { ...item, quantity: newQuantity }
        : item
    )
    
    setCartItems(updatedItems)
    const newCount = updatedItems.reduce((total, item) => total + item.quantity, 0)
    setCartCount(newCount)
    localStorage.setItem("cart", JSON.stringify(updatedItems))
  }

  const clearCart = () => {
    setCartItems([])
    setCartCount(0)
    localStorage.removeItem("cart")
  }

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  return {
    cartItems,
    cartCount,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal
  }
}