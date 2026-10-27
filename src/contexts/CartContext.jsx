import React, { createContext, useContext } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import cartService from '../services/cartService';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const toast = useToast();

  // Query cart from backend when authenticated
  const {
    data: cartData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['cart'],
    queryFn: cartService.getCart,
    enabled: isAuthenticated,
  });

  const cart = cartData || {
    items: [],
    itemCount: 0,
    summary: {
      subtotalPaise: 0,
      shippingPaise: 0,
      taxPaise: 0,
      totalPaise: 0,
      isFreeShippingQualified: false,
      freeShippingThresholdPaise: 99900,
    },
    sellerGroups: [],
    hasUnavailableItems: false,
  };

  // Add to cart mutation
  const addMutation = useMutation({
    mutationFn: cartService.addToCart,
    onSuccess: (updatedCart, variables) => {
      queryClient.setQueryData(['cart'], updatedCart);
      toast.success('Item added to your sustainable cart!');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to add item to cart.');
    },
  });

  // Update item quantity mutation
  const updateMutation = useMutation({
    mutationFn: ({ itemId, quantity }) => cartService.updateCartItem(itemId, quantity),
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(['cart'], updatedCart);
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to update quantity.');
    },
  });

  // Remove item mutation
  const removeMutation = useMutation({
    mutationFn: cartService.removeCartItem,
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(['cart'], updatedCart);
      toast.info('Item removed from cart.');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to remove item.');
    },
  });

  // Clear cart mutation
  const clearMutation = useMutation({
    mutationFn: cartService.clearCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.info('Cart has been cleared.');
    },
  });

  const addToCart = (productId, quantity = 1) => {
    if (!isAuthenticated) {
      toast.warning('Please sign in to add products to your cart.');
      return;
    }
    return addMutation.mutateAsync({ productId, quantity });
  };

  const updateQuantity = (itemId, quantity) => {
    return updateMutation.mutateAsync({ itemId, quantity });
  };

  const removeFromCart = (itemId) => {
    return removeMutation.mutateAsync(itemId);
  };

  const clearCart = () => {
    return clearMutation.mutateAsync();
  };

  const value = {
    cart,
    cartCount: cart.itemCount || 0,
    items: cart.items || [],
    summary: cart.summary,
    sellerGroups: cart.sellerGroups || [],
    hasUnavailableItems: cart.hasUnavailableItems,
    isLoading: isLoading || addMutation.isPending || updateMutation.isPending,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    refreshCart: refetch,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
