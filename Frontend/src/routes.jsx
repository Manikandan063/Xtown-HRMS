import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { X } from 'lucide-react';

// Layouts
import SuperAdminLayout from '@/components/layout/SuperAdminLayout';
import AdminLayout from '@/components/layout/AdminLayout';
import EmployeeLayout from '@/components/layout/EmployeeLayout';

// Modules
import Login from '@/modules/auth/Login';
import Unauthorized from '@/modules/auth/Unauthorized';
import Dashboard from '@/modules/dashboard/Dashboard';
import EmployeeList from '@/modules/employee/EmployeeList';
import AddEmployeePage from '@/modules/employee/AddEmployeePage';
import DepartmentList from '@/modules/employee/DepartmentList';
import DesignationList from '@/modules/employee/DesignationList';
import AttendanceList from '@/modules/attendance/AttendanceList';
import LeaveList from '@/modules/leave/LeaveList';
import PayrollList from '@/modules/payroll/PayrollList';
import HolidayCalendar from '@/modules/holiday/HolidayCalendar';
import ProjectList from '@/modules/project/ProjectList';
import ProjectDashboard from '@/modules/project/ProjectDashboard';
import ShiftList from '@/modules/shift/ShiftList';
import SubscriptionList from '@/modules/subscription/SubscriptionList';
import Settings from '@/modules/settings/Settings';
import CompanyList from '@/modules/company/CompanyList';
import AdminList from '@/modules/company/AdminList';
import SubscriptionPlansList from '@/modules/subscription/SubscriptionPlansList';
import Profile from '@/modules/profile/Profile';
import DeviceList from '@/modules/device/DeviceList';
import ReportsList from '@/modules/reports/ReportsList';
import AssetList from '@/modules/asset/AssetList';
import AdminSubscription from '@/modules/subscription/AdminSubscription';
import MyAssets from '@/modules/asset/MyAssets';
import ResignationList from '@/modules/resignation/ResignationList';
import ApplyResignation from '@/modules/resignation/ApplyResignation';
import SupportManagement from '@/modules/support/SupportManagement';
import DocumentVault from '@/modules/document/DocumentVault';

/**
 * Role-Based Protected Route Component
 */
const RoleProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, isSuperAdmin, isAdmin, isEmployee, dashboardPath } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="flex items-center justify-center h-screen bg-slate-50 font-black text-slate-300 italic tracking-widest text-4xl animate-pulse">XTOWN</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role verification mapping
  const userRoles = [];
  if (isSuperAdmin) userRoles.push('superadmin');
  if (isAdmin) userRoles.push('admin');
  if (isEmployee) userRoles.push('employee');

  const hasAccess = allowedRoles.some(role => userRoles.includes(role));

  if (!hasAccess) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

const AppRoutes = () => {
  const { dashboardPath } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* SuperAdmin Routes */}
      <Route
        path="/superadmin"
        element={
          <RoleProtectedRoute allowedRoles={['superadmin']}>
            <SuperAdminLayout />
          </RoleProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/superadmin/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="companies" element={<CompanyList />} />
        <Route path="admins" element={<AdminList />} />
        <Route path="subscriptions" element={<SubscriptionList />} />
        <Route path="plans" element={<SubscriptionPlansList />} />
        <Route path="analytics" element={<Dashboard title="System Analytics" />} />
        <Route path="health" element={<Dashboard title="Server Pulse" />} />
        <Route path="roles" element={<Dashboard title="Security Roles" />} />
        <Route path="settings" element={<Settings />} />
        <Route path="profile" element={<Profile />} />
        <Route path="profile/general" element={<Profile />} />
        <Route path="profile/personal" element={<Profile />} />
        <Route path="profile/contact" element={<Profile />} />
        <Route path="profile/documents" element={<Profile />} />
        <Route path="support" element={<SupportManagement />} />
        <Route path="documents" element={<DocumentVault />} />
      </Route>

      {/* Admin / HR Routes */}
      <Route
        path="/admin"
        element={
          <RoleProtectedRoute allowedRoles={['admin', 'superadmin']}>
            <AdminLayout />
          </RoleProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="employees" element={<EmployeeList />} />
        <Route path="departments" element={<DepartmentList />} />
        <Route path="designations" element={<DesignationList />} />
        <Route path="attendance" element={<AttendanceList />} />
        <Route path="leave" element={<LeaveList />} />
        <Route path="projects" element={<ProjectList />} />
        <Route path="projects/dashboard" element={<ProjectDashboard />} />
        <Route path="shifts" element={<ShiftList />} />
        <Route path="holidays" element={<HolidayCalendar />} />
        <Route path="payroll" element={<PayrollList />} />
        <Route path="reports" element={<ReportsList />} />
        <Route path="devices" element={<DeviceList />} />
        <Route path="assets" element={<AssetList />} />
        <Route path="resignation" element={<ResignationList />} />
        <Route path="subscription" element={<AdminSubscription />} />
        <Route path="settings" element={<Settings />} />
        <Route path="documents" element={<DocumentVault />} />
        <Route path="profile" element={<Profile />} />
        <Route path="profile/general" element={<Profile />} />
        <Route path="profile/personal" element={<Profile />} />
        <Route path="profile/contact" element={<Profile />} />
        <Route path="profile/documents" element={<Profile />} />
      </Route>

      {/* Employee Routes */}
      <Route
        path="/employee"
        element={
          <RoleProtectedRoute allowedRoles={['employee']}>
            <EmployeeLayout />
          </RoleProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/employee/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="profile" element={<Profile />} />
        <Route path="profile/general" element={<Profile />} />
        <Route path="profile/personal" element={<Profile />} />
        <Route path="profile/contact" element={<Profile />} />
        <Route path="profile/documents" element={<Profile />} />
        <Route path="attendance" element={<AttendanceList />} />
        <Route path="calendar" element={<HolidayCalendar />} />
        <Route path="projects" element={<ProjectList />} />
        <Route path="assets" element={<MyAssets />} />
        <Route path="resignation" element={<ApplyResignation />} />
        <Route path="leave" element={<LeaveList />} />
        <Route path="payroll" element={<PayrollList />} />
        <Route path="documents" element={<DocumentVault />} />
      </Route>

      {/* Auth-based root redirect */}
      <Route path="/" element={<Navigate to={dashboardPath || "/login"} replace />} />
      
      {/* 404 Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
