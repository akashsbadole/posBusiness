import { usePOSStore } from '@/store';
import { Order, OrderItem } from '@/types';

export const useOrders = () => {
  const {
    orders,
    currentOrder,
    orderItems,
    setOrders,
    setCurrentOrder,
    setOrderItems,
    addOrder,
    updateOrder,
    deleteOrder,
    addOrderItem,
    updateOrderItem,
    removeOrderItem,
    setLoading,
    setError,
    showToast
  } = usePOSStore();

  const fetchOrders = async (restaurantId: string) => {
    try {
      setLoading(true);
      // This would integrate with your API service
      // const response = await apiService.get(`/orders?restaurantId=${restaurantId}`);
      // if (response.success) {
      //   setOrders(response.data);
      // }
      
      // For now, simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setOrders([]); // Empty for demo
    } catch (error) {
      setError('Failed to fetch orders');
      showToast('Failed to fetch orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (orderData: Partial<Order>) => {
    try {
      setLoading(true);
      // This would integrate with your API service
      // const response = await apiService.post('/orders', orderData);
      // if (response.success) {
      //   addOrder(response.data);
      //   return response.data;
      // }
      
      // For now, simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      const newOrder: Order = {
        ...orderData,
        id: Date.now().toString(),
        orderNumber: `ORD-${Date.now()}`,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Order;
      
      addOrder(newOrder);
      showToast('Order created successfully', 'success');
      return newOrder;
    } catch (error) {
      setError('Failed to create order');
      showToast('Failed to create order', 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      setLoading(true);
      // This would integrate with your API service
      // const response = await apiService.put(`/orders/${orderId}`, { status });
      // if (response.success) {
      //   updateOrder(orderId, { status });
      // }
      
      // For now, simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      updateOrder(orderId, { status });
      showToast(`Order status updated to ${status}`, 'success');
    } catch (error) {
      setError('Failed to update order status');
      showToast('Failed to update order status', 'error');
    } finally {
      setLoading(false);
    }
  };

  const addItemToOrder = (item: OrderItem) => {
    addOrderItem(item);
    showToast('Item added to order', 'success');
  };

  const removeItemFromOrder = (itemId: string) => {
    removeOrderItem(itemId);
    showToast('Item removed from order', 'info');
  };

  const updateItemInOrder = (itemId: string, updates: Partial<OrderItem>) => {
    updateOrderItem(itemId, updates);
    showToast('Order item updated', 'success');
  };

  const calculateOrderTotal = () => {
    return orderItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return {
    // State
    orders,
    currentOrder,
    orderItems,
    
    // Actions
    fetchOrders,
    createOrder,
    updateOrderStatus,
    addItemToOrder,
    removeItemFromOrder,
    updateItemInOrder,
    setCurrentOrder,
    setOrderItems,
    
    // Computed
    orderTotal: calculateOrderTotal(),
    orderCount: orders.length,
    currentOrderItems: orderItems,
  };
};