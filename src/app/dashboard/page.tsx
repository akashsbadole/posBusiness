"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Utensils,
  ShoppingCart,
  Users,
  Package,
  Table,
  TrendingUp,
  Clock,
  Timer,
  Plus,
  Search,
  Settings,
  LogOut,
  Eye,
  CheckCircle,
  Printer,
  Brain,
  FileText,
  MessageSquare,
  Mic,
  Upload,
  Download,
  TestTube,
  Wifi,
  WifiOff,
  Smartphone,
  BarChart3,
  Trophy,
  MapPin,
  Tag,
  Calculator,
  Bell,
  Shield,
  BookOpen,
} from "lucide-react";
import { usePOSStore } from "@/store";
import {
  useCategories,
  useMenuItems,
  useOrders,
  useStaff,
  useInvoice,
  usePrintInvoice,
  useSubscription,
} from "@/hooks";
import { billingApi } from "@/services/api";
import InvoicePrint from "@/components/invoice/InvoicePrint";
import GSTInvoicePrint from "@/components/invoice/GSTInvoicePrint";
import BarcodeScanner from "@/components/inventory/BarcodeScanner";
import CustomizationSettings from "@/components/settings/CustomizationSettings";
import CompactOrderDialog from "@/components/CompactOrderDialog";
import BusinessTypeSelector from "@/components/settings/BusinessTypeSelector";
import BusinessSettings from "@/components/settings/BusinessSettings";
import PaymentGatewayManager from "@/components/payment/PaymentGatewayManager";
import MultipurposeOrderDialog from "@/components/MultipurposeOrderDialog";
import AIDashboard from "@/components/ai/AIDashboard";
import MenuManagement from "@/components/menu/MenuManagement";
import EnhancedMenuManagement from "@/components/menu/EnhancedMenuManagement";
import EnhancedOrderManagement from "@/components/orders/EnhancedOrderManagement";
import EnhancedCustomerManagement from "@/components/customers/EnhancedCustomerManagement";
import POSCustomization from "@/components/pos/POSCustomization";
import AIConfigComponent from "@/components/ai/AIConfig";
// import TestPanel from '@/components/test/TestPanel'
import OfflineOrders from "@/components/offline/OfflineOrders";
import SystemConfig from "@/components/settings/SystemConfig";
import RoleManagement from "@/components/roles/RoleManagement";
import StaffRoleAssignment from "@/components/roles/StaffRoleAssignment";
import TwoFactorManagement from "@/components/auth/TwoFactorManagement";
import { useOffline } from "@/contexts/OfflineContext";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import {
  CanViewDashboard,
  CanManageOrders,
  CanCreateOrders,
  CanManageMenu,
  CanViewMenu,
  CanManageInventory,
  CanManageCustomers,
  CanManageStaff,
  CanManageSettings,
  CanManageAI,
  IsSuperAdmin,
  IsOwner,
} from "@/components/auth/PermissionBasedUI";
import { Module, PermissionAction, RoleLevel } from "@prisma/client";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { PageLoader, LoadingSpinner } from "@/components/ui/loading-states";
import { AnimatedPage } from "@/components/ui/animations";
import MobileIntegrationDashboard from "@/components/mobile/MobileIntegrationDashboard";
import AdvancedReportingDashboard from "@/components/reports/AdvancedReportingDashboard";
import ReceiptsHistory from "@/components/reports/ReceiptsHistory";
import InventoryValuation from "@/components/reports/InventoryValuation";
import ReportsExport from "@/components/reports/ReportsExport";
import LoyaltyCards from "@/components/loyalty/LoyaltyCards";
import MultiLocationManagement from "@/components/locations/MultiLocationManagement";
import InvoiceCustomization from "@/components/invoice/InvoiceCustomization";
import DiscountManagement from "@/components/discounts/DiscountManagement";
import TaxManagement from "@/components/tax/TaxManagement";
import CustomerNotifications from "@/components/notifications/CustomerNotifications";
import AuditTrails from "@/components/audit/AuditTrails";
import ChatSystem from "@/components/chat/ChatSystem";
import KnowledgeBase from "@/components/knowledge/KnowledgeBase";
import ShiftsManagement from "@/components/staff/ShiftsManagement";
import StockAdjustments from "@/components/inventory/StockAdjustments";
import InventoryCounts from "@/components/inventory/InventoryCounts";
import ProductionTracking from "@/components/inventory/ProductionTracking";
import TimeClock from "@/components/staff/TimeClock";
import LabelPrinting from "@/components/inventory/LabelPrinting";
import InventoryHistory from "@/components/inventory/InventoryHistory";

export default function POSDashboard() {
  // ALL hooks must be called first, before any conditional returns
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedRestaurant, setSelectedRestaurant] = useState(
    "cme2cx36c0002x5haddxsxhtg"
  );
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] =
    useState<any>(null);
  const [showBusinessTypeSelector, setShowBusinessTypeSelector] =
    useState(false);
  const [showBusinessSettings, setShowBusinessSettings] = useState(false);
  const [showPaymentGatewayManager, setShowPaymentGatewayManager] =
    useState(false);
  const [showGSTInvoice, setShowGSTInvoice] = useState(false);
  const [businessSetupData, setBusinessSetupData] = useState<any>(null);
  const [aiConfig, setAiConfig] = useState<any>(null);

  const { isOnline, isOffline } = useOffline();
  const {
    currentRestaurant,
    setCurrentRestaurant,
    orders,
    cart,
    clearCart,
    getCartTotal,
    isLoading: storeLoading,
    error,
    setError,
    clearError,
  } = usePOSStore();
  const { data: staffData } = useStaff(selectedRestaurant);
  const printInvoiceMutation = usePrintInvoice();

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = () => {
      // Only run on client side
      if (typeof window === "undefined") {
        setIsLoading(false);
        return;
      }

      const token = localStorage.getItem("auth_token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const decoded = JSON.parse(Buffer.from(token, "base64").toString());

        // Verify token is not expired (24 hours)
        if (
          decoded.timestamp &&
          Date.now() - decoded.timestamp > 24 * 60 * 60 * 1000
        ) {
          localStorage.removeItem("auth_token");
          localStorage.removeItem("user");
          router.push("/login");
          return;
        }

        setIsAuthenticated(true);
      } catch (error) {
        console.error("Error decoding auth token:", error);
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user");
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  // Set demo business and load staff
  useEffect(() => {
    if (isAuthenticated && typeof window !== "undefined") {
      const demoBusiness = {
        id: "cme2cx36c0002x5haddxsxhtg",
        name: "Spice Business",
        address: "123 Main Street, Mumbai, Maharashtra 400001",
        phone: "+91 22 1234 5678",
        email: "info@spicebusiness.com",
        gstNumber: "27ABCDE1234F1Z5",
        description: "Retail business with modern management",
        isActive: true,
      };
      setCurrentRestaurant(demoBusiness);
    }
  }, [setCurrentRestaurant, isAuthenticated]);

  // Show loading state while checking authentication
  if (isLoading) {
    return <PageLoader message="Authenticating..." />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return null; // This will redirect due to the useEffect
  }

  // Calculate dashboard stats
  const todaysOrders =
    orders?.filter((order) => {
      const orderDate = new Date(order.createdAt);
      const today = new Date();
      return (
        orderDate.getDate() === today.getDate() &&
        orderDate.getMonth() === today.getMonth() &&
        orderDate.getFullYear() === today.getFullYear()
      );
    }) || [];

  const totalRevenue = todaysOrders.reduce(
    (sum, order) => sum + order.totalAmount,
    0
  );
  const totalOrders = todaysOrders.length;
  const uniqueCustomers = new Set(todaysOrders.map((order) => order.customerId))
    .size;
  const occupiedTables = 0; // tables?.filter(table => table.status === 'OCCUPIED').length || 0
  const totalTables = 1; // tables?.length || 1
  const tableOccupancy =
    totalTables > 0 ? Math.round((occupiedTables / totalTables) * 100) : 0;

  const stats = [
    {
      title: "Today's Revenue",
      value: `₹${totalRevenue.toLocaleString("en-IN")}`,
      change: "+12.5%",
      icon: TrendingUp,
      color: "text-green-600",
    },
    {
      title: "Orders",
      value: totalOrders.toString(),
      change: "+8.2%",
      icon: ShoppingCart,
      color: "text-blue-600",
    },
    {
      title: "Customers",
      value: uniqueCustomers.toString(),
      change: "+5.1%",
      icon: Users,
      color: "text-purple-600",
    },
    {
      title: "Table Occupancy",
      value: `${tableOccupancy}%`,
      change: "+2.3%",
      icon: Table,
      color: "text-orange-600",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "READY":
        return "bg-green-500";
      case "PREPARING":
        return "bg-yellow-500";
      case "CONFIRMED":
        return "bg-blue-500";
      case "PENDING":
        return "bg-gray-500";
      case "DELIVERED":
        return "bg-emerald-500";
      default:
        return "bg-gray-500";
    }
  };

  const handlePrintInvoice = async (order: any, useGST: boolean = false) => {
    try {
      // Fetch the complete order data with customer information
      const response = await fetch(`/api/orders/${order.id}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch complete order data");
      }

      const completeOrder = await response.json();
      setSelectedOrderForInvoice(completeOrder);
      setShowGSTInvoice(useGST);
      setIsInvoiceOpen(true);

      await printInvoiceMutation.mutateAsync({
        orderId: completeOrder.id,
        template: useGST ? "gst" : "default",
        customizations: {
          showGST: useGST,
          showDiscount: true,
        },
      });
    } catch (error) {
      setError("Failed to print invoice");
      console.error("Error printing invoice:", error);
    }
  };

  const handleBusinessTypeSelect = (type: string) => {
    // Business type selected, will be used in setup
  };

  const handleBusinessInfoSubmit = (info: any) => {
    setBusinessSetupData(info);
    setShowBusinessTypeSelector(false);
    // Here you would typically save the business info and update the restaurant
  };

  const handleBusinessSettingsUpdate = async (settings: any) => {
    try {
      // Update business settings via API
      console.log("Updating business settings:", settings);
      setShowBusinessSettings(false);
    } catch (error) {
      setError("Failed to update business settings");
    }
  };

  const handleLogout = async () => {
    try {
      // Clear local storage
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user");

      // Call logout API
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        // Redirect to login page
        window.location.href = "/login";
      } else {
        setError("Failed to logout properly");
      }
    } catch (error) {
      console.error("Logout error:", error);
      // Even if API fails, clear local storage and redirect
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
  };

  return (
    <AnimatedPage>
      <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        {/* Sidebar - Hidden on mobile */}
        <div className="hidden md:flex md:w-64 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-xl border-r border-slate-200 dark:border-slate-700 flex-col">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  POSBiz
                </h1>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Business Management
                </p>
              </div>
            </div>
          </div>

          <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
            <CanViewDashboard>
              <Button
                variant={activeTab === "overview" ? "default" : "ghost"}
                className="w-full justify-start rounded-lg transition-all duration-200 hover:scale-105"
                onClick={() => setActiveTab("overview")}
              >
                <TrendingUp className="mr-3 h-4 w-4" />
                <span className="font-medium">Dashboard</span>
              </Button>
            </CanViewDashboard>

            <CanManageOrders>
              <Button
                variant={activeTab === "orders" ? "default" : "ghost"}
                className="w-full justify-start rounded-lg transition-all duration-200 hover:scale-105"
                onClick={() => setActiveTab("orders")}
              >
                <ShoppingCart className="mr-3 h-4 w-4" />
                <span className="font-medium">Orders</span>
              </Button>
            </CanManageOrders>

            <CanViewMenu>
              <Button
                variant={activeTab === "menu" ? "default" : "ghost"}
                className="w-full justify-start rounded-lg transition-all duration-200 hover:scale-105"
                onClick={() => setActiveTab("menu")}
              >
                <Utensils className="mr-3 h-4 w-4" />
                <span className="font-medium">Menu</span>
              </Button>
            </CanViewMenu>

            <PermissionGuard
              permission={{
                module: Module.TABLES,
                action: PermissionAction.READ,
              }}
            >
              <Button
                variant={activeTab === "tables" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("tables")}
              >
                <Table className="mr-2 h-4 w-4" />
                Tables
              </Button>
            </PermissionGuard>

            <CanManageCustomers>
              <Button
                variant={activeTab === "customers" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("customers")}
              >
                <Users className="mr-2 h-4 w-4" />
                Customers
              </Button>
            </CanManageCustomers>

            <CanManageInventory>
              <Button
                variant={activeTab === "inventory" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("inventory")}
              >
                <Package className="mr-2 h-4 w-4" />
                Inventory
              </Button>
            </CanManageInventory>

            <CanManageAI>
              <Button
                variant={activeTab === "ai" ? "default" : "ghost"}
                className="w-full justify-start rounded-lg transition-all duration-200 hover:scale-105"
                onClick={() => setActiveTab("ai")}
              >
                <Brain className="mr-3 h-4 w-4" />
                <span className="font-medium">AI Insights</span>
              </Button>
            </CanManageAI>

            <IsSuperAdmin>
              <Button
                variant={activeTab === "test" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("test")}
              >
                <TestTube className="mr-2 h-4 w-4" />
                Test Panel
              </Button>
            </IsSuperAdmin>

            <CanManageStaff>
              <Button
                variant={activeTab === "roles" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("roles")}
              >
                <Shield className="mr-2 h-4 w-4" />
                Role Management
              </Button>
            </CanManageStaff>

            <CanManageStaff>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => setActiveTab("shifts")}
              >
                <Clock className="mr-2 h-4 w-4" />
                Shifts Management
              </Button>

              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => setActiveTab("timeclock")}
              >
                <Timer className="mr-2 h-4 w-4" />
                Time Clock
              </Button>
            </CanManageStaff>

            <CanManageSettings>
              <Button
                variant={activeTab === "settings" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("settings")}
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </CanManageSettings>

            <CanViewDashboard>
              <Button
                variant={activeTab === "reports" ? "default" : "ghost"}
                className="w-full justify-start rounded-lg transition-all duration-200 hover:scale-105"
                onClick={() => setActiveTab("reports")}
              >
                <BarChart3 className="mr-3 h-4 w-4" />
                <span className="font-medium">Reports</span>
              </Button>
            </CanViewDashboard>

            <CanViewDashboard>
              <Button
                variant={activeTab === "loyalty" ? "default" : "ghost"}
                className="w-full justify-start rounded-lg transition-all duration-200 hover:scale-105"
                onClick={() => setActiveTab("loyalty")}
              >
                <Trophy className="mr-3 h-4 w-4" />
                <span className="font-medium">Loyalty</span>
              </Button>
            </CanViewDashboard>

            <IsOwner>
              <Button
                variant={activeTab === "locations" ? "default" : "ghost"}
                className="w-full justify-start rounded-lg transition-all duration-200 hover:scale-105"
                onClick={() => setActiveTab("locations")}
              >
                <MapPin className="mr-3 h-4 w-4" />
                <span className="font-medium">Locations</span>
              </Button>
            </IsOwner>

            <CanViewDashboard>
              <Button
                variant={activeTab === "mobile" ? "default" : "ghost"}
                className="w-full justify-start rounded-lg transition-all duration-200 hover:scale-105"
                onClick={() => setActiveTab("mobile")}
              >
                <Smartphone className="mr-3 h-4 w-4" />
                <span className="font-medium">Mobile</span>
              </Button>
            </CanViewDashboard>

            <CanViewDashboard>
              <Button
                variant={activeTab === "notifications" ? "default" : "ghost"}
                className="w-full justify-start rounded-lg transition-all duration-200 hover:scale-105"
                onClick={() => setActiveTab("notifications")}
              >
                <Bell className="mr-3 h-4 w-4" />
                <span className="font-medium">Notifications</span>
              </Button>
            </CanViewDashboard>

            <CanViewDashboard>
              <Button
                variant={activeTab === "audit" ? "default" : "ghost"}
                className="w-full justify-start rounded-lg transition-all duration-200 hover:scale-105"
                onClick={() => setActiveTab("audit")}
              >
                <BookOpen className="mr-3 h-4 w-4" />
                <span className="font-medium">Audit Trails</span>
              </Button>
            </CanViewDashboard>

            <CanViewDashboard>
              <Button
                variant={activeTab === "chat" ? "default" : "ghost"}
                className="w-full justify-start rounded-lg transition-all duration-200 hover:scale-105"
                onClick={() => setActiveTab("chat")}
              >
                <MessageSquare className="mr-3 h-4 w-4" />
                <span className="font-medium">Chat</span>
              </Button>
            </CanViewDashboard>

            <CanViewDashboard>
              <Button
                variant={activeTab === "knowledge" ? "default" : "ghost"}
                className="w-full justify-start rounded-lg transition-all duration-200 hover:scale-105"
                onClick={() => setActiveTab("knowledge")}
              >
                <FileText className="mr-3 h-4 w-4" />
                <span className="font-medium">Knowledge Base</span>
              </Button>
            </CanViewDashboard>

            <CanViewDashboard>
              <Button
                variant={activeTab === "discounts" ? "default" : "ghost"}
                className="w-full justify-start rounded-lg transition-all duration-200 hover:scale-105"
                onClick={() => setActiveTab("discounts")}
              >
                <Tag className="mr-3 h-4 w-4" />
                <span className="font-medium">Discounts</span>
              </Button>
            </CanViewDashboard>

            <CanViewDashboard>
              <Button
                variant={activeTab === "tax" ? "default" : "ghost"}
                className="w-full justify-start rounded-lg transition-all duration-200 hover:scale-105"
                onClick={() => setActiveTab("tax")}
              >
                <Calculator className="mr-3 h-4 w-4" />
                <span className="font-medium">Tax</span>
              </Button>
            </CanViewDashboard>

            <CanViewDashboard>
              <Button
                variant={activeTab === "invoice" ? "default" : "ghost"}
                className="w-full justify-start rounded-lg transition-all duration-200 hover:scale-105"
                onClick={() => setActiveTab("invoice")}
              >
                <FileText className="mr-3 h-4 w-4" />
                <span className="font-medium">Invoice</span>
              </Button>
            </CanViewDashboard>
          </nav>

          <div className="p-4 border-t border-slate-200 dark:border-slate-700">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Bar */}
          <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-sm border-b border-slate-200 dark:border-slate-700 z-10">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center space-x-4">
                <h2 className="text-xl font-semibold capitalize">
                  {activeTab === "overview" && "Dashboard"}
                  {activeTab === "orders" && "Orders"}
                  {activeTab === "menu" && "Menu Management"}
                  {activeTab === "customers" && "Customers"}
                  {activeTab === "inventory" && "Inventory"}
                  {activeTab === "ai" && "AI Insights"}
                  {activeTab === "settings" && "Settings"}
                  {activeTab === "reports" && "Reports"}
                  {activeTab === "loyalty" && "Loyalty Program"}
                  {activeTab === "locations" && "Locations"}
                  {activeTab === "mobile" && "Mobile Integration"}
                  {activeTab === "notifications" && "Notifications"}
                  {activeTab === "audit" && "Audit Trails"}
                  {activeTab === "chat" && "Chat System"}
                  {activeTab === "knowledge" && "Knowledge Base"}
                  {activeTab === "discounts" && "Discounts"}
                  {activeTab === "tax" && "Tax Management"}
                  {activeTab === "invoice" && "Invoice Settings"}
                  {activeTab === "roles" && "Role Management"}
                  {activeTab === "shifts" && "Shifts Management"}
                  {activeTab === "timeclock" && "Time Clock"}
                  {activeTab === "test" && "Test Panel"}
                  {activeTab === "tables" && "Table Management"}
                </h2>

                <div className="flex items-center space-x-2">
                  <Badge variant={isOnline ? "default" : "secondary"}>
                    {isOnline ? (
                      <>
                        <Wifi className="w-3 h-3 mr-1" />
                        Online
                      </>
                    ) : (
                      <>
                        <WifiOff className="w-3 h-3 mr-1" />
                        Offline
                      </>
                    )}
                  </Badge>

                  {currentRestaurant && (
                    <Badge variant="outline">{currentRestaurant.name}</Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <LanguageSwitcher />
                <ThemeToggle />

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCreateOrderOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  New Order
                </Button>
              </div>
            </div>
          </header>

          {/* Content Area */}
          <main className="flex-1 overflow-y-auto p-6">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="h-full"
            >
              <TabsContent value="overview" className="h-full mt-0">
                <div className="space-y-6">
                  {/* Stats Cards */}
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat, index) => (
                      <Card key={index}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">
                            {stat.title}
                          </CardTitle>
                          <stat.icon className={`h-4 w-4 ${stat.color}`} />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{stat.value}</div>
                          <p className="text-xs text-muted-foreground">
                            {stat.change}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Recent Orders */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Orders</CardTitle>
                      <CardDescription>
                        Latest orders from your restaurant
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {todaysOrders.slice(0, 5).map((order) => (
                          <div
                            key={order.id}
                            className="flex items-center justify-between p-4 border rounded-lg"
                          >
                            <div className="flex items-center space-x-4">
                              <div
                                className={`w-3 h-3 rounded-full ${getStatusColor(
                                  order.status
                                )}`}
                              />
                              <div>
                                <p className="font-medium">Order #{order.id}</p>
                                <p className="text-sm text-muted-foreground">
                                  {order.customerName || "Guest"} •{" "}
                                  {format(new Date(order.createdAt), "HH:mm")}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">
                                ₹{order.totalAmount.toFixed(2)}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePrintInvoice(order)}
                              >
                                <Printer className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="orders">
                <EnhancedOrderManagement />
              </TabsContent>

              <TabsContent value="menu">
                <EnhancedMenuManagement />
              </TabsContent>

              <TabsContent value="customers">
                <EnhancedCustomerManagement />
              </TabsContent>

              <TabsContent value="inventory">
                <Tabs defaultValue="scanner">
                  <TabsList>
                    <TabsTrigger value="scanner">Barcode Scanner</TabsTrigger>
                    <TabsTrigger value="adjustments">
                      Stock Adjustments
                    </TabsTrigger>
                    <TabsTrigger value="counts">Inventory Counts</TabsTrigger>
                    <TabsTrigger value="production">
                      Production Tracking
                    </TabsTrigger>
                    <TabsTrigger value="labels">Label Printing</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                  </TabsList>
                  <TabsContent value="scanner">
                    <BarcodeScanner
                      onAddToCart={(item) => {
                        // Add item to cart via POS store
                        const cartItem = {
                          id: item.barcode,
                          name: item.name,
                          price: item.price,
                          quantity: item.quantity,
                        };
                        // Add to cart logic here
                      }}
                    />
                  </TabsContent>
                  <TabsContent value="adjustments">
                    <StockAdjustments />
                  </TabsContent>
                  <TabsContent value="counts">
                    <InventoryCounts />
                  </TabsContent>
                  <TabsContent value="production">
                    <ProductionTracking />
                  </TabsContent>
                  <TabsContent value="labels">
                    <LabelPrinting />
                  </TabsContent>
                  <TabsContent value="history">
                    <InventoryHistory />
                  </TabsContent>
                </Tabs>
              </TabsContent>

              <TabsContent value="ai">
                <AIDashboard />
              </TabsContent>

              <TabsContent value="settings">
                <SystemConfig />
              </TabsContent>

              <TabsContent value="reports">
                <Tabs defaultValue="analytics">
                  <TabsList>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    <TabsTrigger value="receipts">Receipts History</TabsTrigger>
                    <TabsTrigger value="valuation">
                      Inventory Valuation
                    </TabsTrigger>
                    <TabsTrigger value="export">Export</TabsTrigger>
                  </TabsList>
                  <TabsContent value="analytics">
                    <AdvancedReportingDashboard />
                  </TabsContent>
                  <TabsContent value="receipts">
                    <ReceiptsHistory />
                  </TabsContent>
                  <TabsContent value="valuation">
                    <InventoryValuation />
                  </TabsContent>
                  <TabsContent value="export">
                    <ReportsExport />
                  </TabsContent>
                </Tabs>
              </TabsContent>

              <TabsContent value="loyalty">
                <LoyaltyCards />
              </TabsContent>

              <TabsContent value="locations">
                <MultiLocationManagement />
              </TabsContent>

              <TabsContent value="mobile">
                <MobileIntegrationDashboard />
              </TabsContent>

              <TabsContent value="notifications">
                <CustomerNotifications />
              </TabsContent>

              <TabsContent value="audit">
                <AuditTrails />
              </TabsContent>

              <TabsContent value="chat">
                <ChatSystem />
              </TabsContent>

              <TabsContent value="knowledge">
                <KnowledgeBase />
              </TabsContent>

              <TabsContent value="discounts">
                <DiscountManagement />
              </TabsContent>

              <TabsContent value="tax">
                <TaxManagement />
              </TabsContent>

              <TabsContent value="invoice">
                <InvoiceCustomization />
              </TabsContent>

              <TabsContent value="roles">
                <RoleManagement />
                <StaffRoleAssignment />
              </TabsContent>

              <TabsContent value="shifts">
                <ShiftsManagement />
              </TabsContent>

              <TabsContent value="timeclock">
                <TimeClock />
              </TabsContent>

              <TabsContent value="test">{/* <TestPanel /> */}</TabsContent>

              <TabsContent value="tables">
                <div className="text-center py-12">
                  <h3 className="text-lg font-semibold mb-2">
                    Table Management
                  </h3>
                  <p className="text-muted-foreground">
                    Table management features coming soon...
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </main>

          {/* Mobile Navigation */}
          <div className="md:hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-t border-slate-200 dark:border-slate-700">
            <div className="flex justify-around py-2">
              <CanViewDashboard>
                <Button
                  variant={activeTab === "overview" ? "default" : "ghost"}
                  size="sm"
                  className="flex-col h-auto py-2"
                  onClick={() => setActiveTab("overview")}
                >
                  <TrendingUp className="h-4 w-4 mb-1" />
                  <span className="text-xs">Dashboard</span>
                </Button>
              </CanViewDashboard>

              <CanManageOrders>
                <Button
                  variant={activeTab === "orders" ? "default" : "ghost"}
                  size="sm"
                  className="flex-col h-auto py-2"
                  onClick={() => setActiveTab("orders")}
                >
                  <ShoppingCart className="h-4 w-4 mb-1" />
                  <span className="text-xs">Orders</span>
                </Button>
              </CanManageOrders>

              <CanViewMenu>
                <Button
                  variant={activeTab === "menu" ? "default" : "ghost"}
                  size="sm"
                  className="flex-col h-auto py-2"
                  onClick={() => setActiveTab("menu")}
                >
                  <Utensils className="h-4 w-4 mb-1" />
                  <span className="text-xs">Menu</span>
                </Button>
              </CanViewMenu>

              <CanManageInventory>
                <Button
                  variant={activeTab === "inventory" ? "default" : "ghost"}
                  size="sm"
                  className="flex-col h-auto py-2"
                  onClick={() => setActiveTab("inventory")}
                >
                  <Package className="h-4 w-4 mb-1" />
                  <span className="text-xs">Inventory</span>
                </Button>
              </CanManageInventory>

              <CanManageCustomers>
                <Button
                  variant={activeTab === "customers" ? "default" : "ghost"}
                  size="sm"
                  className="flex-col h-auto py-2"
                  onClick={() => setActiveTab("customers")}
                >
                  <Users className="h-4 w-4 mb-1" />
                  <span className="text-xs">Customers</span>
                </Button>
              </CanManageCustomers>

              <CanManageAI>
                <Button
                  variant={activeTab === "ai" ? "default" : "ghost"}
                  size="sm"
                  className="flex-col h-auto py-2"
                  onClick={() => setActiveTab("ai")}
                >
                  <Brain className="h-4 w-4 mb-1" />
                  <span className="text-xs">AI</span>
                </Button>
              </CanManageAI>

              <CanManageSettings>
                <Button
                  variant={activeTab === "settings" ? "default" : "ghost"}
                  size="sm"
                  className="flex-col h-auto py-2"
                  onClick={() => setActiveTab("settings")}
                >
                  <Settings className="h-4 w-4 mb-1" />
                  <span className="text-xs">Settings</span>
                </Button>
              </CanManageSettings>

              <IsSuperAdmin>
                <Button
                  variant={activeTab === "test" ? "default" : "ghost"}
                  size="sm"
                  className="flex-col h-auto py-2"
                  onClick={() => setActiveTab("test")}
                >
                  <TestTube className="h-4 w-4 mb-1" />
                  <span className="text-xs">Test</span>
                </Button>
              </IsSuperAdmin>

              <CanManageStaff>
                <Button
                  variant={activeTab === "roles" ? "default" : "ghost"}
                  size="sm"
                  className="flex-col h-auto py-2"
                  onClick={() => setActiveTab("roles")}
                >
                  <Shield className="h-4 w-4 mb-1" />
                  <span className="text-xs">Roles</span>
                </Button>
              </CanManageStaff>

              <CanManageStaff>
                <Button
                  variant={activeTab === "shifts" ? "default" : "ghost"}
                  size="sm"
                  className="flex-col h-auto py-2"
                  onClick={() => setActiveTab("shifts")}
                >
                  <Clock className="h-4 w-4 mb-1" />
                  <span className="text-xs">Shifts</span>
                </Button>

                <Button
                  variant={activeTab === "timeclock" ? "default" : "ghost"}
                  size="sm"
                  className="flex-col h-auto py-2"
                  onClick={() => setActiveTab("timeclock")}
                >
                  <Timer className="h-4 w-4 mb-1" />
                  <span className="text-xs">Time Clock</span>
                </Button>
              </CanManageStaff>
            </div>
          </div>
        </div>

        {/* Order Creation Dialog */}
        {isCreateOrderOpen && (
          <CompactOrderDialog
            open={isCreateOrderOpen}
            onOpenChange={setIsCreateOrderOpen}
            restaurantId={selectedRestaurant}
          />
        )}

        {/* Invoice Print Dialog */}
        {isInvoiceOpen && selectedOrderForInvoice && (
          <div className="hidden">
            {showGSTInvoice ? (
              <GSTInvoicePrint order={selectedOrderForInvoice} />
            ) : (
              <InvoicePrint order={selectedOrderForInvoice} />
            )}
          </div>
        )}

        {/* Business Type Selector */}
        {showBusinessTypeSelector && (
          <BusinessTypeSelector
            open={showBusinessTypeSelector}
            onClose={() => setShowBusinessTypeSelector(false)}
            onSelect={handleBusinessTypeSelect}
          />
        )}

        {/* Business Settings */}
        {showBusinessSettings && (
          <BusinessSettings
            open={showBusinessSettings}
            onClose={() => setShowBusinessSettings(false)}
            onSubmit={handleBusinessSettingsUpdate}
          />
        )}

        {/* Payment Gateway Manager */}
        {showPaymentGatewayManager && (
          <PaymentGatewayManager
            open={showPaymentGatewayManager}
            onClose={() => setShowPaymentGatewayManager(false)}
          />
        )}
      </div>
    </AnimatedPage>
  );
}
