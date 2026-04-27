import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, [token]);

  const login = (userData, userToken) => {
    localStorage.setItem('token', userToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(userToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const updateUser = (newUserData) => {
    setUser(prev => {
      const updated = { ...prev, ...newUserData };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  };

  // Role Normalization: handles both 'admin', 'super_admin' etc.
  const rawRole = user?.role && typeof user.role === 'string' ? user.role.toLowerCase() : '';
  const roleName = rawRole.replace(/[^a-z0-9]/g, ''); // 'super_admin' -> 'superadmin'
  const designationName = user?.designation && typeof user.designation === 'string' ? user.designation.toUpperCase() : '';

  // CORE ROLE DEFINITIONS
  const isSuperAdmin = roleName === 'superadmin';
  const isAdmin = roleName === 'admin';
  const isHR = (isAdmin && (designationName === 'HR' || designationName === 'ADMIN' || designationName === 'CEO'));
  const isMD = (isAdmin && designationName === 'MD');
  const isEmployee = roleName === 'user' || (!isSuperAdmin && !isAdmin);
  
  // PERMISSION LOGIC
  // Admin HR has full access
  const hasFullAccess = isHR;
  // Admin MD has read-only access
  const isReadOnly = isMD;
  // SuperAdmin manages companies only
  const isCompanyManager = isSuperAdmin;

  // ACCESS GROUPS
  const canModify = hasFullAccess && !isReadOnly;
  const canViewPayroll = isSuperAdmin || isHR || isMD;
  const canViewEmployees = isSuperAdmin || isHR || isMD;

  // Aliases for compatibility
  const canEdit = canModify;
  const canAccessHRModules = isSuperAdmin || isAdmin || isHR;
  const canAccessManagementModules = isSuperAdmin || isAdmin || isMD;

  const dashboardPath = isSuperAdmin 
    ? '/superadmin/dashboard' 
    : isAdmin 
      ? '/admin/dashboard' 
      : '/employee/dashboard';

  return (
    <AuthContext.Provider value={{ 
      user, token, login, logout, updateUser,
      isSuperAdmin, isAdmin, isHR, isMD, isEmployee,
      hasFullAccess, isReadOnly, isCompanyManager,
      canModify, canViewPayroll, canViewEmployees,
      canEdit, canAccessHRModules, canAccessManagementModules,
      loading, dashboardPath
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
