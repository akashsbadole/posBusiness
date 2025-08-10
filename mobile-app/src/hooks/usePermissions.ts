import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { StaffRole } from '@/types';

interface PermissionConfig {
  module: string;
  actions: string[];
  roles: StaffRole[];
}

const permissionConfigs: PermissionConfig[] = [
  {
    module: 'dashboard',
    actions: ['view', 'edit'],
    roles: [StaffRole.OWNER, StaffRole.MANAGER, StaffRole.CASHIER, StaffRole.WAITER],
  },
  {
    module: 'orders',
    actions: ['view', 'create', 'edit', 'delete'],
    roles: [StaffRole.OWNER, StaffRole.MANAGER, StaffRole.CASHIER, StaffRole.WAITER],
  },
  {
    module: 'menu',
    actions: ['view', 'create', 'edit', 'delete'],
    roles: [StaffRole.OWNER, StaffRole.MANAGER, StaffRole.CHEF],
  },
  {
    module: 'customers',
    actions: ['view', 'create', 'edit', 'delete'],
    roles: [StaffRole.OWNER, StaffRole.MANAGER, StaffRole.CASHIER],
  },
  {
    module: 'inventory',
    actions: ['view', 'create', 'edit', 'delete'],
    roles: [StaffRole.OWNER, StaffRole.MANAGER, StaffRole.KITCHEN_STAFF],
  },
  {
    module: 'staff',
    actions: ['view', 'create', 'edit', 'delete'],
    roles: [StaffRole.OWNER, StaffRole.MANAGER],
  },
  {
    module: 'reports',
    actions: ['view', 'create', 'export'],
    roles: [StaffRole.OWNER, StaffRole.MANAGER],
  },
  {
    module: 'settings',
    actions: ['view', 'edit'],
    roles: [StaffRole.OWNER, StaffRole.MANAGER],
  },
  {
    module: 'payments',
    actions: ['view', 'process', 'refund'],
    roles: [StaffRole.OWNER, StaffRole.MANAGER, StaffRole.CASHIER],
  },
  {
    module: 'tables',
    actions: ['view', 'create', 'edit', 'delete'],
    roles: [StaffRole.OWNER, StaffRole.MANAGER, StaffRole.WAITER],
  },
];

export const usePermissions = () => {
  const { user } = useAuth();

  const hasPermission = useMemo(() => {
    return (module: string, action: string): boolean => {
      if (!user) return false;

      const config = permissionConfigs.find(p => p.module === module);
      if (!config) return false;

      return config.roles.includes(user.role as StaffRole) && config.actions.includes(action);
    };
  }, [user]);

  const canView = useMemo(() => {
    return (module: string): boolean => {
      return hasPermission(module, 'view');
    };
  }, [hasPermission]);

  const canCreate = useMemo(() => {
    return (module: string): boolean => {
      return hasPermission(module, 'create');
    };
  }, [hasPermission]);

  const canEdit = useMemo(() => {
    return (module: string): boolean => {
      return hasPermission(module, 'edit');
    };
  }, [hasPermission]);

  const canDelete = useMemo(() => {
    return (module: string): boolean => {
      return hasPermission(module, 'delete');
    };
  }, [hasPermission]);

  const canProcess = useMemo(() => {
    return (module: string): boolean => {
      return hasPermission(module, 'process');
    };
  }, [hasPermission]);

  const canExport = useMemo(() => {
    return (module: string): boolean => {
      return hasPermission(module, 'export');
    };
  }, [hasPermission]);

  const getAvailableModules = useMemo(() => {
    if (!user) return [];

    return permissionConfigs
      .filter(config => config.roles.includes(user.role as StaffRole))
      .map(config => config.module);
  }, [user]);

  const getAvailableActions = useMemo(() => {
    return (module: string): string[] => {
      if (!user) return [];

      const config = permissionConfigs.find(p => p.module === module);
      if (!config || !config.roles.includes(user.role as StaffRole)) return [];

      return config.actions;
    };
  }, [user]);

  const isSuperAdmin = useMemo(() => {
    return user?.role === StaffRole.OWNER;
  }, [user]);

  const isManager = useMemo(() => {
    return user?.role === StaffRole.MANAGER;
  }, [user]);

  const isStaff = useMemo(() => {
    return [StaffRole.CASHIER, StaffRole.WAITER, StaffRole.CHEF, StaffRole.KITCHEN_STAFF].includes(user?.role as StaffRole);
  }, [user]);

  return {
    hasPermission,
    canView,
    canCreate,
    canEdit,
    canDelete,
    canProcess,
    canExport,
    getAvailableModules,
    getAvailableActions,
    isSuperAdmin,
    isManager,
    isStaff,
  };
};