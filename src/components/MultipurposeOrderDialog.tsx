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
import { Textarea } from "@/components/ui/textarea";
import { DateTimePicker } from "@/components/ui/datetime-picker";
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
  Calendar,
  Clock,
  User,
  MapPin,
  Package,
  Scissors,
  Dumbbell,
  Pill,
  Stethoscope,
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
  useBusinessSettings,
} from "@/hooks";

interface MultipurposeOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const businessTypeIcons = {
  RESTAURANT: Package,
  RETAIL_STORE: Package,
  CAFE: Package,
  HOTEL: Package,
  BAR: Package,
  ECOMMERCE: Package,
  SALON: Scissors,
  SPA: Scissors,
  PHARMACY: Pill,
  GROCERY_STORE: Package,
  FOOD_TRUCK: Package,
  GYM: Dumbbell,
  CLINIC: Stethoscope,
};

const businessTypeOrderTypes = {
  RESTAURANT: ["DINE_IN", "TAKEAWAY", "DELIVERY"],
  RETAIL_STORE: ["IN_STORE"],
  CAFE: ["IN_STORE", "TAKEAWAY"],
  HOTEL: ["DINE_IN", "ROOM_SERVICE", "DELIVERY"],
  BAR: ["DINE_IN", "TAB"],
  ECOMMERCE: ["ONLINE", "DELIVERY"],
  SALON: ["APPOINTMENT", "SERVICE"],
  SPA: ["APPOINTMENT", "SERVICE", "SUBSCRIPTION"],
  PHARMACY: ["IN_STORE", "PRESCRIPTION"],
  GROCERY_STORE: ["IN_STORE", "ONLINE", "DELIVERY"],
  FOOD_TRUCK: ["IN_STORE", "TAKEAWAY"],
  GYM: ["SUBSCRIPTION", "APPOINTMENT"],
  CLINIC: ["APPOINTMENT", "SERVICE"],
};

export default function MultipurposeOrderDialog({
  open,
  onOpenChange,
}: MultipurposeOrderDialogProps) {
  const [orderType, setOrderType] = useState<string>("");
  const [selectedTable, setSelectedTable] = useState<string>("");
  const [selectedCustomer, setSelectedCustomer] = useState<string>("");
  const [newCustomerName, setNewCustomerName] = useState<string>("");
  const [newCustomerPhone, setNewCustomerPhone] = useState<string>("");
  const [showAddCustomer, setShowAddCustomer] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [isProcessingPayment, setIsProcessingPayment] =
    useState<boolean>(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState<boolean>(false);
  const [appointmentDate, setAppointmentDate] = useState<Date>(new Date());
  const [serviceType, setServiceType] = useState<string>("");
  const [customFields, setCustomFields] = useState<Record<string, string>>({});

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
  const { data: businessSettings } = useBusinessSettings(selectedRestaurant);
  const createOrderMutation = useCreateOrder();
  const createCustomerMutation = useCreateCustomer();
  const createPaymentMutation = useCreatePayment();

  const BusinessIcon = businessSettings?.businessType
    ? businessTypeIcons[
        businessSettings.businessType as keyof typeof businessTypeIcons
      ]
    : Package;

  // Filter menu items based on search and category
  const filteredMenuItems =
    menuItemsData?.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || item.categoryId === selectedCategory;
      return matchesSearch && matchesCategory;
    }) || [];

  // Set default order type based on business type
  useEffect(() => {
    if (businessSettings?.businessType && !orderType) {
      const availableTypes =
        businessTypeOrderTypes[
          businessSettings.businessType as keyof typeof businessTypeOrderTypes
        ];
      if (availableTypes && availableTypes.length > 0) {
        setOrderType(availableTypes[0]);
      }
    }
  }, [businessSettings, orderType]);

  // Initialize custom fields based on business type
  useEffect(() => {
    if (businessSettings?.businessType) {
      const fields: Record<string, string> = {};
      switch (businessSettings.businessType) {
        case "RESTAURANT":
          fields.tableNumber = "";
          fields.specialInstructions = "";
          break;
        case "RETAIL_STORE":
          fields.sku = "";
          fields.barcode = "";
          break;
        case "SALON":
          fields.stylist = "";
          fields.serviceDuration = "30";
          break;
        case "SPA":
          fields.therapist = "";
          fields.treatmentType = "";
          break;
        case "PHARMACY":
          fields.prescriptionNumber = "";
          fields.doctorName = "";
          break;
        case "GYM":
          fields.trainer = "";
          fields.membershipType = "";
          break;
        case "CLINIC":
          fields.doctor = "";
          fields.symptoms = "";
          break;
      }
      setCustomFields(fields);
    }
  }, [businessSettings]);

  // Calculate GST
  const calculateGST = (subtotal: number) => {
    const gstRate = businessSettings?.enableGST ? businessSettings.gstRate : 0;
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
        appointmentDate: orderType === "APPOINTMENT" ? appointmentDate : null,
        serviceType: serviceType || null,
        customFields: JSON.stringify(customFields),
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
      setOrderType("");
      setSelectedTable("");
      setSelectedCustomer("");
      setNotes("");
      setSearchTerm("");
      setSelectedCategory("");
      setServiceType("");
      setCustomFields({});
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
        appointmentDate: orderType === "APPOINTMENT" ? appointmentDate : null,
        serviceType: serviceType || null,
        customFields: JSON.stringify(customFields),
      };

      const order = await createOrderMutation.mutateAsync(orderData);

      // Show success and print receipt
      await printReceipt(order.data);

      clearCart();
      setOrderType("");
      setSelectedTable("");
      setSelectedCustomer("");
      setNotes("");
      setSearchTerm("");
      setSelectedCategory("");
      setServiceType("");
      setCustomFields({});
      onOpenChange(false);
    } catch (error) {
      setError("Failed to create order");
    }
  };

  const printReceipt = async (order: any) => {
    // Create a new window for printing
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const businessName = businessSettings?.businessType || "Business";
    const receiptHeader =
      businessSettings?.receiptHeader || `${businessName} Receipt`;
    const receiptFooter =
      businessSettings?.receiptFooter || "Thank you for your business!";

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
            <div class="title">${receiptHeader}</div>
            <div class="subtitle">Order #${order.orderNumber}</div>
            <div class="subtitle">${new Date(
              order.createdAt
            ).toLocaleString()}</div>
            <div class="subtitle">Type: ${order.orderType.replace(
              "_",
              " "
            )}</div>
          </div>
          
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
          ${
            businessSettings?.enableGST
              ? `
          <div class="item">
            <span class="item-name">CGST (${(
              businessSettings.gstRate * 50
            ).toFixed(1)}%)</span>
            <span class="item-price">₹${(order.gstAmount / 2).toFixed(2)}</span>
          </div>
          <div class="item">
            <span class="item-name">SGST (${(
              businessSettings.gstRate * 50
            ).toFixed(1)}%)</span>
            <span class="item-price">₹${(order.gstAmount / 2).toFixed(2)}</span>
          </div>
          `
              : ""
          }
          <div class="item total">
            <span class="item-name">TOTAL</span>
            <span class="item-price">₹${order.totalAmount.toFixed(2)}</span>
          </div>
          
          <div class="divider"></div>
          
          <div style="text-align: center; margin-bottom: 10px;">
            <strong>STATUS: ${order.status}</strong>
          </div>
          
          <div class="footer">
            ${receiptFooter}
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(receiptHTML);
    printWindow.document.close();
    printWindow.print();
    printWindow.close();
  };

  const renderBusinessSpecificFields = () => {
    if (!businessSettings?.businessType) return null;

    switch (businessSettings.businessType) {
      case "RESTAURANT":
        return (
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
            <Input
              value={customFields.specialInstructions || ""}
              onChange={(e) =>
                setCustomFields((prev) => ({
                  ...prev,
                  specialInstructions: e.target.value,
                }))
              }
              placeholder="Special instructions"
              className="h-8"
            />
          </div>
        );
      case "SALON":
      case "SPA":
        return (
          <div className="space-y-2 mb-4">
            <Label className="text-sm font-medium">Appointment Date</Label>
            <Input
              type="datetime-local"
              value={appointmentDate.toISOString().slice(0, 16)}
              onChange={(e) => setAppointmentDate(new Date(e.target.value))}
              className="h-8"
            />
            <Input
              value={customFields.stylist || customFields.therapist || ""}
              onChange={(e) =>
                setCustomFields((prev) => ({
                  ...prev,
                  stylist: e.target.value,
                  therapist: e.target.value,
                }))
              }
              placeholder={
                businessSettings.businessType === "SALON"
                  ? "Stylist"
                  : "Therapist"
              }
              className="h-8"
            />
            <Input
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              placeholder="Service type"
              className="h-8"
            />
          </div>
        );
      case "PHARMACY":
        return (
          <div className="space-y-2 mb-4">
            <Input
              value={customFields.prescriptionNumber || ""}
              onChange={(e) =>
                setCustomFields((prev) => ({
                  ...prev,
                  prescriptionNumber: e.target.value,
                }))
              }
              placeholder="Prescription number"
              className="h-8"
            />
            <Input
              value={customFields.doctorName || ""}
              onChange={(e) =>
                setCustomFields((prev) => ({
                  ...prev,
                  doctorName: e.target.value,
                }))
              }
              placeholder="Doctor name"
              className="h-8"
            />
          </div>
        );
      case "GYM":
        return (
          <div className="space-y-2 mb-4">
            <Input
              value={customFields.trainer || ""}
              onChange={(e) =>
                setCustomFields((prev) => ({
                  ...prev,
                  trainer: e.target.value,
                }))
              }
              placeholder="Trainer"
              className="h-8"
            />
            <Select value={serviceType} onValueChange={setServiceType}>
              <SelectTrigger className="h-8">
                <SelectValue placeholder="Membership type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );
      case "CLINIC":
        return (
          <div className="space-y-2 mb-4">
            <Input
              value={customFields.doctor || ""}
              onChange={(e) =>
                setCustomFields((prev) => ({ ...prev, doctor: e.target.value }))
              }
              placeholder="Doctor"
              className="h-8"
            />
            <Textarea
              value={customFields.symptoms || ""}
              onChange={(e) =>
                setCustomFields((prev) => ({
                  ...prev,
                  symptoms: e.target.value,
                }))
              }
              placeholder="Symptoms/Reason for visit"
              className="h-8"
            />
          </div>
        );
      default:
        return null;
    }
  };

  const availableOrderTypes = businessSettings?.businessType
    ? businessTypeOrderTypes[
        businessSettings.businessType as keyof typeof businessTypeOrderTypes
      ]
    : ["DINE_IN", "TAKEAWAY", "DELIVERY"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-full max-h-[95vh] w-full h-[95vh] p-0">
        <div className="flex h-full w-full">
          {/* Left Panel - Order Details */}
          <div className="w-full bg-gray-50 border-r p-4 flex flex-col">
            <DialogHeader className="pb-4">
              <DialogTitle className="text-lg flex items-center gap-2">
                <BusinessIcon className="h-5 w-5" />
                New Order - {businessSettings?.businessType?.replace("_", " ")}
              </DialogTitle>
            </DialogHeader>

            {/* Order Type */}
            <div className="space-y-3 mb-4">
              <Label className="text-sm font-medium">Order Type</Label>
              <div className="grid grid-cols-2 gap-2">
                {availableOrderTypes.map((type) => (
                  <Button
                    key={type}
                    variant={orderType === type ? "default" : "outline"}
                    size="sm"
                    onClick={() => setOrderType(type)}
                    className="h-16 p-2"
                  >
                    <span className="text-xs">{type.replace("_", " ")}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Business Specific Fields */}
            {renderBusinessSpecificFields()}

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
              <Textarea
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
                {businessSettings?.enableGST && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span>
                        CGST ({(businessSettings.gstRate * 50).toFixed(1)}%):
                      </span>
                      <span>₹{cartGST.cgst.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>
                        SGST ({(businessSettings.gstRate * 50).toFixed(1)}%):
                      </span>
                      <span>₹{cartGST.sgst.toFixed(2)}</span>
                    </div>
                  </>
                )}
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
                disabled={cart.length === 0 || !orderType}
                className="w-full"
                size="sm"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Complete Order
              </Button>
              <Button
                onClick={handleCreateOrder}
                disabled={cart.length === 0 || !orderType}
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
            <div className="p-4 border-b">
              <div className="flex gap-2 mb-4">
                <div className="flex-1">
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search items..."
                    className="h-8"
                  />
                </div>
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className="w-48 h-8">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categoriesData?.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMenuItems.map((item) => (
                  <Card
                    key={item.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleAddToCart(item)}
                  >
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="font-medium text-sm mb-2">
                          {item.name}
                        </div>
                        <div className="text-xs text-gray-600 mb-2 line-clamp-2">
                          {item.description}
                        </div>
                        <div className="font-bold text-lg">₹{item.price}</div>
                        <Button
                          size="sm"
                          className="mt-2 w-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(item);
                          }}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
