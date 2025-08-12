"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Minus,
  Trash2,
  Printer,
  CreditCard,
  Smartphone,
  Banknote,
  Search,
  X,
  CheckCircle,
} from "lucide-react";
import { usePOSStore } from "@/store";
import {
  useCategories,
  useMenuItems,
  useTables,
  useCustomers,
  useCreateOrder,
  useCreateCustomer,
  useCreatePayment,
} from "@/hooks";

interface CompactOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CompactOrderDialog({
  open,
  onOpenChange,
}: CompactOrderDialogProps) {
  const [orderType, setOrderType] = useState<
    "DINE_IN" | "TAKEAWAY" | "DELIVERY"
  >("DINE_IN");
  const [selectedTable, setSelectedTable] = useState<string>("");
  const [selectedCustomer, setSelectedCustomer] = useState<string>("");
  const [newCustomerName, setNewCustomerName] = useState<string>("");
  const [newCustomerPhone, setNewCustomerPhone] = useState<string>("");
  const [showAddCustomer, setShowAddCustomer] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [isProcessingPayment, setIsProcessingPayment] =
    useState<boolean>(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState<boolean>(false);

  const {
    cart,
    addToCart,
    removeFromCart,
    updateCartItem,
    clearCart,
    getCartTotal,
    setError,
    clearError,
  } = usePOSStore();

  const selectedRestaurant = "cme2cx36c0002x5haddxsxhtg"; // Demo restaurant ID

  const { data: categoriesData } = useCategories(selectedRestaurant);
  const { data: menuItemsData } = useMenuItems(selectedRestaurant);
  const { data: tablesData } = useTables(selectedRestaurant);
  const { data: customersData } = useCustomers(selectedRestaurant);
  const createOrderMutation = useCreateOrder();
  const createCustomerMutation = useCreateCustomer();
  const createPaymentMutation = useCreatePayment();

  // Filter menu items based on search and category
  const filteredMenuItems =
    menuItemsData?.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        !selectedCategory || item.categoryId === selectedCategory;
      return matchesSearch && matchesCategory;
    }) || [];

  // Calculate GST
  const calculateGST = (subtotal: number) => {
    const gstRate = 0.05; // 5% GST
    const gstAmount = subtotal * gstRate;
    const cgst = gstAmount / 2;
    const sgst = gstAmount / 2;
    const totalAmount = subtotal + gstAmount;

    return {
      subtotal,
      cgst,
      sgst,
      totalGST: gstAmount,
      totalAmount,
    };
  };

  const cartGST = calculateGST(getCartTotal());

  const handleAddToCart = (menuItem: any) => {
    addToCart({
      id: `cart-${Date.now()}`,
      orderId: "",
      menuItemId: menuItem.id,
      quantity: 1,
      price: menuItem.price,
      notes: "",
      menuItem,
    });
  };

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
    } else {
      updateCartItem(itemId, { quantity: newQuantity });
    }
  };

  const handleCreateCustomer = async () => {
    if (!newCustomerName.trim() || !newCustomerPhone.trim()) {
      setError("Customer name and phone are required");
      return;
    }

    try {
      const customerData = {
        name: newCustomerName.trim(),
        phone: newCustomerPhone.trim(),
        email: "",
        address: "",
        restaurantId: selectedRestaurant,
      };

      const newCustomer = await createCustomerMutation.mutateAsync(
        customerData
      );
      setSelectedCustomer(newCustomer.data.id);
      setNewCustomerName("");
      setNewCustomerPhone("");
      setShowAddCustomer(false);
      clearError();
    } catch (error) {
      setError("Failed to create customer");
    }
  };

  const handleCompleteOrder = async () => {
    try {
      if (cart.length === 0) {
        setError("Please add items to the order");
        return;
      }

      // Get staff ID (demo)
      const staffId = "eca71220-9e3b-4d60-81dc-372a8c780912";

      const orderData = {
        orderType,
        customerId: selectedCustomer || null,
        tableId: selectedTable || null,
        staffId,
        restaurantId: selectedRestaurant,
        orderItems: cart.map((item) => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          price: item.price,
          notes: item.notes,
        })),
        notes: notes || "",
      };

      const order = await createOrderMutation.mutateAsync(orderData);

      // Process payment to complete the order
      const paymentData = {
        orderId: order.data.id,
        amount: order.data.totalAmount,
        method: "CASH", // Default to cash for completion
        transactionId: "",
        notes: "Order completed",
      };

      await createPaymentMutation.mutateAsync(paymentData);

      // Show success and print receipt
      await printReceipt(order.data);

      clearCart();
      setOrderType("DINE_IN");
      setSelectedTable("");
      setSelectedCustomer("");
      setNotes("");
      setSearchTerm("");
      setSelectedCategory("");
      onOpenChange(false);
    } catch (error) {
      setError("Failed to complete order");
    }
  };

  const handleCreateOrder = async () => {
    try {
      if (cart.length === 0) {
        setError("Please add items to the order");
        return;
      }

      // Get staff ID (demo)
      const staffId = "eca71220-9e3b-4d60-81dc-372a8c780912";

      const orderData = {
        orderType,
        customerId: selectedCustomer || null,
        tableId: selectedTable || null,
        staffId,
        restaurantId: selectedRestaurant,
        orderItems: cart.map((item) => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          price: item.price,
          notes: item.notes,
        })),
        notes: notes || "",
      };

      const order = await createOrderMutation.mutateAsync(orderData);

      // Show success and print receipt
      await printReceipt(order);

      clearCart();
      setOrderType("DINE_IN");
      setSelectedTable("");
      setSelectedCustomer("");
      setNotes("");
      setSearchTerm("");
      setSelectedCategory("");
      onOpenChange(false);
    } catch (error) {
      setError("Failed to create order");
    }
  };

  const printReceipt = async (order: any) => {
    // Create a new window for printing
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const receiptHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Order Receipt</title>
          <style>
            body { 
              font-family: monospace; 
              margin: 0; 
              padding: 20px; 
              font-size: 12px;
              line-height: 1.4;
            }
            .header { text-align: center; margin-bottom: 20px; }
            .title { font-size: 18px; font-weight: bold; margin-bottom: 5px; }
            .subtitle { font-size: 14px; margin-bottom: 10px; }
            .divider { border-top: 1px dashed #000; margin: 10px 0; }
            .item { display: flex; justify-content: space-between; margin-bottom: 5px; }
            .item-name { flex: 1; }
            .item-qty { width: 50px; text-align: center; }
            .item-price { width: 80px; text-align: right; }
            .total { font-weight: bold; margin-top: 10px; }
            .footer { text-align: center; margin-top: 20px; font-size: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">SPICE GARDEN</div>
            <div class="subtitle">123 Main Street, Mumbai</div>
            <div class="subtitle">GST: 27ABCDE1234F1Z5</div>
            <div class="subtitle">Phone: +91 22 1234 5678</div>
          </div>
          
          <div class="divider"></div>
          
          <div><strong>Order #:</strong> ${order.orderNumber}</div>
          <div><strong>Date:</strong> ${new Date(
            order.createdAt
          ).toLocaleString()}</div>
          <div><strong>Type:</strong> ${order.orderType.replace("_", " ")}</div>
          ${
            order.tableId
              ? `<div><strong>Table:</strong> ${order.tableId}</div>`
              : ""
          }
          ${
            order.customerId
              ? `<div><strong>Customer:</strong> ${order.customerId}</div>`
              : ""
          }
          
          <div class="divider"></div>
          
          <div style="font-weight: bold; margin-bottom: 10px;">ORDER ITEMS</div>
          ${order.orderItems
            .map(
              (item: any) => `
            <div class="item">
              <span class="item-name">${item.menuItem.name}</span>
              <span class="item-qty">${item.quantity}</span>
              <span class="item-price">₹${(item.price * item.quantity).toFixed(
                2
              )}</span>
            </div>
          `
            )
            .join("")}
          
          <div class="divider"></div>
          
          <div class="item">
            <span class="item-name">Subtotal</span>
            <span class="item-price">₹${order.subtotal.toFixed(2)}</span>
          </div>
          <div class="item">
            <span class="item-name">CGST (2.5%)</span>
            <span class="item-price">₹${(order.gstAmount / 2).toFixed(2)}</span>
          </div>
          <div class="item">
            <span class="item-name">SGST (2.5%)</span>
            <span class="item-price">₹${(order.gstAmount / 2).toFixed(2)}</span>
          </div>
          <div class="item total">
            <span class="item-name">TOTAL</span>
            <span class="item-price">₹${order.totalAmount.toFixed(2)}</span>
          </div>
          
          <div class="divider"></div>
          
          <div style="text-align: center; margin-bottom: 10px;">
            <strong>STATUS: ${order.status}</strong>
          </div>
          
          <div class="footer">
            Thank you for your business!<br>
            Visit us again soon!
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(receiptHTML);
    printWindow.document.close();
    printWindow.print();
    printWindow.close();
  };

  const handleQuickOrder = async () => {
    // Quick order with default settings
    setOrderType("DINE_IN");
    setSelectedTable("");
    setSelectedCustomer("");
    setNotes("");

    if (cart.length > 0) {
      await handleCreateOrder();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-full max-h-[95vh] w-full h-[95vh] p-0">
        <div className="flex h-full w-full">
          {/* Left Panel - Order Details */}
          <div className="w-full bg-gray-50 border-r p-4 flex flex-col">
            <DialogHeader className="pb-4">
              <DialogTitle className="text-lg">New Order</DialogTitle>
            </DialogHeader>

            {/* Order Type */}
            <div className="space-y-3 mb-4">
              <Label className="text-sm font-medium">Order Type</Label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: "DINE_IN", label: "Dine-in", icon: "🍽️" },
                  { value: "TAKEAWAY", label: "Takeaway", icon: "🥡" },
                  { value: "DELIVERY", label: "Delivery", icon: "🚚" },
                ].map((type) => (
                  <Button
                    key={type.value}
                    variant={orderType === type.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setOrderType(type.value as any)}
                    className="flex flex-col items-center h-16 p-2"
                  >
                    <span className="text-lg mb-1">{type.icon}</span>
                    <span className="text-xs">{type.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Table Selection */}
            {orderType === "DINE_IN" && (
              <div className="space-y-2 mb-4">
                <Label className="text-sm font-medium">Table</Label>
                <Select value={selectedTable} onValueChange={setSelectedTable}>
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Select table" />
                  </SelectTrigger>
                  <SelectContent>
                    {tablesData?.map((table) => (
                      <SelectItem key={table.id} value={table.id}>
                        Table {table.number} ({table.capacity} seats)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Customer Selection */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium">Customer</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddCustomer(!showAddCustomer)}
                  className="h-6 px-2 text-xs"
                >
                  {showAddCustomer ? "Cancel" : "Add New"}
                </Button>
              </div>

              {showAddCustomer ? (
                <div className="space-y-2 p-3 bg-gray-50 rounded border">
                  <Input
                    value={newCustomerName}
                    onChange={(e) => setNewCustomerName(e.target.value)}
                    placeholder="Customer name"
                    className="h-8"
                  />
                  <Input
                    value={newCustomerPhone}
                    onChange={(e) => setNewCustomerPhone(e.target.value)}
                    placeholder="Phone number"
                    className="h-8"
                  />
                  <Button
                    onClick={handleCreateCustomer}
                    disabled={
                      !newCustomerName.trim() || !newCustomerPhone.trim()
                    }
                    className="w-full h-8"
                    size="sm"
                  >
                    Add Customer
                  </Button>
                </div>
              ) : (
                <Select
                  value={selectedCustomer}
                  onValueChange={setSelectedCustomer}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customersData?.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name} ({customer.loyaltyPoints} pts)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2 mb-4">
              <Label className="text-sm font-medium">Notes</Label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Order notes..."
                className="h-8"
              />
            </div>

            {/* Cart Summary */}
            <div className="flex-1 overflow-hidden">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-medium">
                    Order Items ({cart.length})
                  </Label>
                  {cart.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearCart}
                      className="h-6 px-2"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>

                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2 bg-white rounded border"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">
                          {item.menuItem?.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          ₹{item.price}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleUpdateQuantity(item.id, item.quantity - 1)
                          }
                          className="h-6 w-6 p-0"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm w-6 text-center">
                          {item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleUpdateQuantity(item.id, item.quantity + 1)
                          }
                          className="h-6 w-6 p-0"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.id)}
                          className="h-6 w-6 p-0 text-red-500"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="border-t pt-2 space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>₹{cartGST.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>CGST (2.5%):</span>
                  <span>₹{cartGST.cgst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>SGST (2.5%):</span>
                  <span>₹{cartGST.sgst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold border-t pt-1">
                  <span>Total:</span>
                  <span>₹{cartGST.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-4">
              <Button
                onClick={handleCompleteOrder}
                disabled={cart.length === 0}
                className="w-full"
                size="sm"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Complete Order
              </Button>
              <Button
                onClick={handleCreateOrder}
                disabled={cart.length === 0}
                variant="outline"
                className="w-full"
                size="sm"
              >
                <Printer className="mr-2 h-4 w-4" />
                Create & Print Order
              </Button>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="w-full"
                size="sm"
              >
                Cancel
              </Button>
            </div>
          </div>

          {/* Right Panel - Menu Items */}
          <div className="flex-1 flex flex-col">
            {/* Search and Categories */}
            <div className="p-4 border-b space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search menu items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-9"
                />
              </div>

              <Tabs
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <TabsList className="grid w-full grid-cols-6 h-8">
                  <TabsTrigger value="" className="text-xs">
                    All
                  </TabsTrigger>
                  {categoriesData?.slice(0, 5).map((category) => (
                    <TabsTrigger
                      key={category.id}
                      value={category.id}
                      className="text-xs"
                    >
                      {category.name.split(" ")[0]}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            {/* Menu Items Grid */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {filteredMenuItems.map((item) => (
                  <Card
                    key={item.id}
                    className="cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-105"
                    onClick={() => handleAddToCart(item)}
                  >
                    <CardContent className="p-2">
                      <div className="space-y-1">
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium text-xs leading-tight line-clamp-2">
                            {item.name}
                          </h3>
                          <Badge variant="secondary" className="text-xs">
                            ₹{item.price}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 line-clamp-2">
                          {item.description}
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500 truncate">
                            {item.category?.name?.split(" ")[0]}
                          </span>
                          <Button
                            size="sm"
                            className="h-5 text-xs px-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToCart(item);
                            }}
                          >
                            <Plus className="h-2 w-2" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Quick Actions Footer */}
            <div className="p-4 border-t bg-gray-50">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  {cart.length} items • ₹{cartGST.totalAmount.toFixed(2)}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearCart}
                    disabled={cart.length === 0}
                  >
                    <Trash2 className="mr-1 h-3 w-3" />
                    Clear
                  </Button>
                  <Button
                    onClick={handleCreateOrder}
                    disabled={cart.length === 0}
                    size="sm"
                  >
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Complete Order
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
