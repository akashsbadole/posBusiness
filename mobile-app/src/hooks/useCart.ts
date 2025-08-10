import { usePOSStore } from '@/store';
import { OrderItem, MenuItem } from '@/types';

export const useCart = () => {
  const {
    cart,
    addToCart,
    removeFromCart,
    updateCartItem,
    clearCart,
    getCartTotal,
    showToast
  } = usePOSStore();

  const addItem = (menuItem: MenuItem, quantity: number = 1, notes?: string) => {
    const cartItem: OrderItem = {
      id: `cart-${Date.now()}`,
      orderId: '',
      menuItemId: menuItem.id,
      quantity,
      price: menuItem.price,
      notes,
      menuItem,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addToCart(cartItem);
    showToast(`${menuItem.name} added to cart`, 'success');
  };

  const removeItem = (itemId: string) => {
    removeFromCart(itemId);
    showToast('Item removed from cart', 'info');
  };

  const updateItem = (itemId: string, updates: Partial<OrderItem>) => {
    updateCartItem(itemId, updates);
    showToast('Cart item updated', 'success');
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    updateItem(itemId, { quantity });
  };

  const clearAllItems = () => {
    clearCart();
    showToast('Cart cleared', 'info');
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalAmount = () => {
    return getCartTotal();
  };

  const getItemQuantity = (menuItemId: string) => {
    const item = cart.find(cartItem => cartItem.menuItemId === menuItemId);
    return item ? item.quantity : 0;
  };

  const isItemInCart = (menuItemId: string) => {
    return cart.some(cartItem => cartItem.menuItemId === menuItemId);
  };

  const getCartSummary = () => {
    const totalItems = getTotalItems();
    const totalAmount = getTotalAmount();
    const itemCount = cart.length;

    return {
      totalItems,
      totalAmount,
      itemCount,
      isEmpty: itemCount === 0,
    };
  };

  const groupItemsByCategory = () => {
    const grouped = cart.reduce((acc, item) => {
      const category = item.menuItem?.category?.name || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {} as Record<string, OrderItem[]>);

    return grouped;
  };

  return {
    // State
    cart,
    
    // Actions
    addItem,
    removeItem,
    updateItem,
    updateQuantity,
    clearAllItems,
    
    // Computed
    totalItems: getTotalItems(),
    totalAmount: getTotalAmount(),
    itemCount: cart.length,
    isEmpty: cart.length === 0,
    summary: getCartSummary(),
    groupedItems: groupItemsByCategory(),
    
    // Utilities
    getItemQuantity,
    isItemInCart,
  };
};