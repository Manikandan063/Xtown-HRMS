import React from 'react';
import { ShieldAlert, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const Unauthorized = () => {
  const navigate = useNavigate();
  const { dashboardPath } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
            <ShieldAlert className="w-10 h-10 text-red-600" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter">ACCESS DENIED</h1>
          <p className="text-slate-500 font-medium leading-relaxed">
            You don't have permission to view this section. This incident will be logged in our security audits.
          </p>
        </div>
        <Button 
          onClick={() => navigate(dashboardPath || '/login')} 
          className="gap-2 px-8 py-6 text-lg rounded-2xl"
        >
          <Home className="w-5 h-5" />
          Return to Safety
        </Button>
      </div>
    </div>
  );
};

export default Unauthorized;
