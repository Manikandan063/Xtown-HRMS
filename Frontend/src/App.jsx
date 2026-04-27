import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import AppRoutes from '@/routes';
import { Toaster } from "@/components/ui/sonner";
import LocationTracker from '@/components/attendance/LocationTracker';

/**
 * Root Component for the HRMS frontend
 * Wraps every page with necessary context providers
 */
function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          {/* Periodic GPS Node Sync (Employee Only) */}
          <LocationTracker />
          
          {/* Main App Routes */}
          <AppRoutes />
          
          {/* Toast Notification Provider */}
          <Toaster position="top-right" richColors closeButton />
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}


export default App;
