import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import cartService from '../services/cartService';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const CartContext = createContext(null);

const GUEST_CART_KEY = 'rescrafted_guest_cart';

// Helper to compute summary for guest cart
const formatGuestCart = (items = []) => {
  let subtotalPaise = 0;
  const sellerGroupsMap = new Map();

  const formattedItems = items.map((item) => {
    const unitPrice = item.unitPricePaise || item.pricePaise || 0;
    const qty = Number(item.quantity) || 1;
    const itemSubtotal = unitPrice * qty;
    subtotalPaise += itemSubtotal;

    const seller = item.seller || (typeof item.sellerId === 'object' ? item.sellerId : null) || {
      _id: 'general',
      storeName: 'ResCrafted Artisan',
    };

    const formattedItem = {
      _id: item._id || item.productId?._id || item.productId,
      productId: {
        _id: item.productId?._id || item.productId || item._id,
        title: item.title || item.productId?.title || 'Sustainable Item',
        slug: item.slug || item.productId?.slug || '',
        pricePaise: unitPrice,
        compareAtPricePaise: item.compareAtPricePaise || item.productId?.compareAtPricePaise,
        stockQuantity: item.stockQuantity || item.productId?.stockQuantity || 99,
        condition: item.condition || item.productId?.condition || 'recycled',
        imageUrl: item.imageUrl || item.images?.[0]?.url || item.productId?.images?.[0]?.url || '',
        seller,
      },
      quantity: qty,
      effectiveQuantity: qty,
      unitPricePaise: unitPrice,
      itemSubtotalPaise: itemSubtotal,
    };

    const sellerKey = seller._id || 'general';
    if (!sellerGroupsMap.has(sellerKey)) {
      sellerGroupsMap.set(sellerKey, {
        sellerId: sellerKey,
        storeName: seller.storeName || 'ResCrafted Artisan',
        items: [],
        groupSubtotalPaise: 0,
      });
    }

    const group = sellerGroupsMap.get(sellerKey);
    group.items.push(formattedItem);
    group.groupSubtotalPaise += itemSubtotal;

    return formattedItem;
  });

  const freeShippingThresholdPaise = 99900;
  const isFreeShipping = subtotalPaise >= freeShippingThresholdPaise || subtotalPaise === 0;
  const shippingPaise = isFreeShipping ? 0 : 9900;
  const taxPaise = Math.round(subtotalPaise * 0.05);
  const totalPaise = subtotalPaise + shippingPaise + taxPaise;

  return {
    items: formattedItems,
    itemCount: formattedItems.reduce((acc, it) => acc + it.quantity, 0),
    summary: {
      subtotalPaise,
      shippingPaise,
      taxPaise,
      totalPaise,
      isFreeShippingQualified: isFreeShipping && subtotalPaise > 0,
      freeShippingThresholdPaise,
    },
    sellerGroups: Array.from(sellerGroupsMap.values()),
    hasUnavailableItems: false,
  };
};

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const toast = useToast();

  // Local storage state for guest cart
  const [guestCartItems, setGuestCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem(GUEST_CART_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Query cart from backend when authenticated
  const {
    data: backendCartData,
    isLoading: isBackendLoading,
    refetch,
  } = useQuery({
    queryKey: ['cart'],
    queryFn: cartService.getCart,
    enabled: isAuthenticated,
  });

  // Sync guest cart to backend upon authentication
  useEffect(() => {
    if (isAuthenticated && guestCartItems.length > 0) {
      const syncGuestCart = async () => {
        try {
          for (const item of guestCartItems) {
            const pId = item.productId?._id || item.productId || item._id;
            if (pId) {
              await cartService.addToCart({ productId: pId, quantity: item.quantity || 1 });
            }
          }
          localStorage.removeItem(GUEST_CART_KEY);
          setGuestCartItems([]);
          queryClient.invalidateQueries({ queryKey: ['cart'] });
        } catch {
          // Ignore sync errors, backend cart will prevail
        }
      };
      syncGuestCart();
    }
  }, [isAuthenticated, guestCartItems, queryClient]);

  // Persist guest cart to localStorage
  const saveGuestItems = (newItems) => {
    setGuestCartItems(newItems);
    try {
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(newItems));
    } catch {
      // ignore storage error
    }
  };

  // Add to cart mutation (Authenticated)
  const addMutation = useMutation({
    mutationFn: cartService.addToCart,
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(['cart'], updatedCart);
      toast.success('Item added to your sustainable cart!');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to add item to cart.');
    },
  });

  // Update item quantity mutation (Authenticated)
  const updateMutation = useMutation({
    mutationFn: ({ itemId, quantity }) => cartService.updateCartItem(itemId, quantity),
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(['cart'], updatedCart);
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to update quantity.');
    },
  });

  // Remove item mutation (Authenticated)
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

  // Clear cart mutation (Authenticated)
  const clearMutation = useMutation({
    mutationFn: cartService.clearCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.info('Cart has been cleared.');
    },
  });

  // Unified Add to Cart (Handles both string ID and full product object, authenticated & guest)
  const addToCart = async (productOrId, quantity = 1) => {
    let productId = productOrId;
    let productDetails = null;

    if (typeof productOrId === 'object' && productOrId !== null) {
      productId = productOrId._id || productOrId.id;
      productDetails = productOrId;
    }

    if (!productId) {
      toast.error('Unable to identify product.');
      return;
    }

    if (isAuthenticated) {
      return addMutation.mutateAsync({ productId, quantity });
    }

    // Guest Cart Mode
    const existingIndex = guestCartItems.findIndex(
      (it) => (it.productId?._id || it.productId || it._id) === productId
    );

    let updated = [...guestCartItems];
    if (existingIndex > -1) {
      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity: (updated[existingIndex].quantity || 1) + quantity,
      };
    } else {
      updated.push({
        _id: `guest_${Date.now()}_${productId}`,
        productId,
        quantity,
        title: productDetails?.title || 'Circular Product',
        slug: productDetails?.slug || '',
        pricePaise: productDetails?.pricePaise || 0,
        compareAtPricePaise: productDetails?.compareAtPricePaise,
        stockQuantity: productDetails?.stockQuantity || 99,
        condition: productDetails?.condition || 'recycled',
        imageUrl: productDetails?.images?.[0]?.url || productDetails?.imageUrl || '',
        seller: productDetails?.sellerId || { _id: 'general', storeName: 'ResCrafted Artisan' },
      });
    }

    saveGuestItems(updated);
    toast.success('Item added to your sustainable cart!');
  };

  // Unified Update Quantity
  const updateQuantity = async (itemId, quantity) => {
    if (isAuthenticated) {
      return updateMutation.mutateAsync({ itemId, quantity });
    }

    const updated = guestCartItems
      .map((it) => {
        if (it._id === itemId || (it.productId?._id || it.productId) === itemId) {
          return { ...it, quantity: Math.max(1, quantity) };
        }
        return it;
      })
      .filter(Boolean);

    saveGuestItems(updated);
  };

  // Unified Remove from Cart
  const removeFromCart = async (itemId) => {
    if (isAuthenticated) {
      return removeMutation.mutateAsync(itemId);
    }

    const updated = guestCartItems.filter(
      (it) => it._id !== itemId && (it.productId?._id || it.productId) !== itemId
    );
    saveGuestItems(updated);
    toast.info('Item removed from cart.');
  };

  // Unified Clear Cart
  const clearCart = async () => {
    if (isAuthenticated) {
      return clearMutation.mutateAsync();
    }
    saveGuestItems([]);
    toast.info('Cart has been cleared.');
  };

  // Determine current active cart
  const cart = isAuthenticated
    ? backendCartData || {
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
      }
    : formatGuestCart(guestCartItems);

  const value = {
    cart,
    cartCount: cart.itemCount || 0,
    items: cart.items || [],
    summary: cart.summary,
    sellerGroups: cart.sellerGroups || [],
    hasUnavailableItems: cart.hasUnavailableItems,
    isLoading: isBackendLoading || addMutation.isPending || updateMutation.isPending,
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
