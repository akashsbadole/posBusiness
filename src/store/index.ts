// Re-export the shared Zustand store
export { usePOSStore } from '../../shared/store'
export type { 
  POSStore, 
  POSState, 
  POSActions,
  Restaurant,
  Staff,
  Category,
  MenuItem,
  Customer,
  Order,
  OrderItem,
  Payment,
  Table,
  User,
  AuthState,
  UIState,
  OfflineState
} from '../../shared/types'