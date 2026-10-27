import React, { createContext, useContext } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import wishlistService from '../services/wishlistService';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const toast = useToast();

  const { data: wishlistData, isLoading, refetch } = useQuery({
    queryKey: ['wishlist'],
    queryFn: wishlistService.getWishlist,
    enabled: isAuthenticated,
  });

  const products = wishlistData?.products || [];
  const wishlistIds = products.map((p) => p._id);

  const addMutation = useMutation({
    mutationFn: wishlistService.addToWishlist,
    onSuccess: (updated) => {
      queryClient.setQueryData(['wishlist'], updated);
      toast.success('Saved to your wishlist!');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to update wishlist.');
    },
  });

  const removeMutation = useMutation({
    mutationFn: wishlistService.removeFromWishlist,
    onSuccess: (updated) => {
      queryClient.setQueryData(['wishlist'], updated);
      toast.info('Removed from your wishlist.');
    },
  });

  const moveMutation = useMutation({
    mutationFn: wishlistService.moveToCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Product moved to your shopping cart!');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to move to cart.');
    },
  });

  const toggleWishlist = (product) => {
    if (!isAuthenticated) {
      toast.warning('Please sign in to save items to your wishlist.');
      return;
    }
    const productId = product._id;
    if (wishlistIds.includes(productId)) {
      removeMutation.mutate(productId);
    } else {
      addMutation.mutate(productId);
    }
  };

  const removeFromWishlist = (productId) => {
    return removeMutation.mutateAsync(productId);
  };

  const moveToCart = (productId) => {
    return moveMutation.mutateAsync(productId);
  };

  const value = {
    wishlistProducts: products,
    wishlistCount: products.length,
    wishlistIds,
    isWishlisted: (id) => wishlistIds.includes(id),
    toggleWishlist,
    removeFromWishlist,
    moveToCart,
    refreshWishlist: refetch,
    isLoading: isLoading || addMutation.isPending || removeMutation.isPending,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
