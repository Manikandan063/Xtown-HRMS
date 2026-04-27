import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { User, Lock, Globe, Loader2, ChevronDown, KeyRound } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // Hidden by default
  const navigate = useNavigate();
  const { login } = useAuth();

  // Forgot Password State
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    
    // Auto-formatting for DOB (DD-MM-YYYY)
    // If input starts with a number, we assume DOB mode
    if (/^\d/.test(val) || val === '') {
      const clean = val.replace(/\D/g, '').slice(0, 8);
      let formatted = clean;
      if (clean.length > 2) formatted = `${clean.slice(0, 2)}-${clean.slice(2)}`;
      if (clean.length > 4) formatted = `${formatted.slice(0, 5)}-${clean.slice(4)}`;
      setPassword(formatted);
    } else {
      // Normal password for Admins
      setPassword(val);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await apiFetch('/auth/login', {
        method: 'POST',
        body: { 
          email: email.trim(), 
          password: password.trim() 
        },
      });

      login(response.data.user, response.data.token);
      toast.success('Successfully logged in!');
      
      const roleName = (response.data.user?.role?.toLowerCase() || '').replace(/[^a-z0-9]/g, '');
      
      if (roleName === 'superadmin') {
        navigate('/superadmin/dashboard');
      } else if (roleName === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/employee/dashboard');
      }
    } catch (error) {
      toast.error(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotIdentifier) return toast.error("Please enter your Employee ID or Email");
    
    setForgotLoading(true);
    try {
      const response = await apiFetch('/auth/forgot-password', {
        method: 'POST',
        body: { identifier: forgotIdentifier.trim() },
      });
      toast.success(response.message || "Instructions sent!");
      setIsForgotModalOpen(false);
    } catch (error) {
      toast.error(error.message || "Failed to process request");
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 md:p-8 bg-[#0a051d] overflow-hidden relative">
      {/* Dynamic Background Effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-violet-600/20 rounded-full blur-[120px]" />
      <div className="absolute top-[30%] right-[10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[100px] animate-bounce duration-[15000ms]" />
      
      <div className="bg-white/[0.03] backdrop-blur-2xl w-full max-w-6xl rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] flex flex-col md:flex-row overflow-hidden min-h-[700px] relative z-10 border border-white/10">
        
        {/* Left Side: Cinematic Visual */}
        <div className="relative w-full md:w-[55%] h-80 md:h-auto overflow-hidden bg-indigo-950/20">
           <img 
             src="/login_simple_dark.png" 
             alt="HRMS Support" 
             className="absolute inset-0 w-full h-full object-contain p-16"
           />
           <div className="absolute inset-0 bg-gradient-to-r from-[#0a051d]/40 to-transparent" />
           
           {/* Logo Branding */}
           <div className="absolute top-12 left-12 flex items-center gap-4">
              <div className="h-14 w-14 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(79,70,229,0.3)]">
                 <div className="h-7 w-7 border-[5px] border-white rotate-45 rounded-md" />
              </div>
              <div className="flex flex-col">
                 <h1 className="text-5xl font-black italic tracking-tighter text-white uppercase leading-none">HRMS</h1>
                 <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] ml-1 mt-1">Enterprise Platform</span>
              </div>
           </div>
        </div>

        {/* Right Side: Secure Terminal */}
        <div className="w-full md:w-[45%] p-8 md:p-20 flex flex-col justify-center relative bg-gradient-to-b from-white/5 to-transparent">
           <div className="space-y-3 mb-16">
              <h2 className="text-5xl font-black tracking-tighter text-white uppercase italic leading-none">Account Login</h2>
              <p className="text-white/40 font-bold uppercase tracking-[0.3em] text-[11px] ml-1">Secure Sign-In Gateway</p>
           </div>

           <form onSubmit={handleLogin} className="space-y-10">
              <div className="space-y-8">
                  {/* Identifier Input */}
                  <div className="relative group">
                     <User className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20 group-focus-within:text-indigo-400 transition-all duration-300" />
                     <Input 
                       type="text" 
                       placeholder="Employee ID / Email" 
                       className="pl-12 border-0 border-b-2 border-white/10 rounded-none h-16 focus-visible:ring-0 focus-visible:border-indigo-500 transition-all duration-500 font-bold text-white bg-transparent placeholder:text-white/10 text-lg"
                       value={email}
                       onChange={(e) => setEmail(e.target.value)}
                       required
                     />
                  </div>

                 {/* Password Input */}
                 <div className="relative group">
                    <Lock className={cn(
                      "absolute left-0 top-1/2 -translate-y-1/2 h-5 w-5 transition-all duration-300",
                      showPassword ? "text-indigo-400" : "text-white/20"
                    )} />
                    <Input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="Password (DOB: DD-MM-YYYY)" 
                      className="pl-12 border-0 border-b-2 border-white/10 rounded-none h-16 focus-visible:ring-0 focus-visible:border-indigo-500 transition-all duration-500 font-bold text-white bg-transparent placeholder:text-white/10 text-lg"
                      value={password}
                      onChange={handlePasswordChange}
                      onFocus={() => setShowPassword(true)}
                      onBlur={() => setShowPassword(false)}
                      required
                    />
                 </div>
              </div>

              <div className="flex flex-col gap-6 pt-6">
                 <Button 
                   type="submit" 
                   disabled={loading}
                   className="h-16 w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-black uppercase text-sm tracking-[0.3em] shadow-[0_20px_40px_rgba(79,70,229,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 relative overflow-hidden group mb-2"
                 >
                   <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 slant-effect" />
                   {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <span className="relative z-10">Login Now</span>}
                 </Button>

                 <button 
                    type="button"
                    onClick={() => setIsForgotModalOpen(true)}
                    className="text-center text-[10px] font-black uppercase tracking-[0.4em] text-white/30 hover:text-indigo-400 transition-all duration-300 bg-transparent border-none cursor-pointer"
                  >
                     Forgot Password ?
                  </button>
              </div>
           </form>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <Dialog open={isForgotModalOpen} onOpenChange={setIsForgotModalOpen}>
        <DialogContent className="sm:max-w-[450px] bg-[#0f0a28] border-white/10 rounded-[2rem] p-0 overflow-hidden">
          <div className="p-8 space-y-6">
            <DialogHeader className="space-y-4">
              <div className="h-16 w-16 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(79,70,229,0.3)] mx-auto">
                <KeyRound className="h-8 w-8 text-white" />
              </div>
              <DialogTitle className="text-3xl font-black text-white text-center uppercase italic tracking-tighter">Recover Access</DialogTitle>
              <DialogDescription className="text-white/40 text-center font-bold uppercase tracking-widest text-[10px]">
                Enter your credentials to receive instructions
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleForgotPassword} className="space-y-8">
              <div className="relative group">
                <User className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20 group-focus-within:text-indigo-400 transition-all duration-300" />
                <Input 
                  type="text" 
                  placeholder="Employee ID / Email" 
                  className="pl-12 border-0 border-b-2 border-white/10 rounded-none h-14 focus-visible:ring-0 focus-visible:border-indigo-500 transition-all duration-500 font-bold text-white bg-transparent placeholder:text-white/10"
                  value={forgotIdentifier}
                  onChange={(e) => setForgotIdentifier(e.target.value)}
                  required
                />
              </div>

              <div className="bg-indigo-500/10 p-4 rounded-xl border border-indigo-500/20">
                <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest leading-relaxed">
                  <span className="text-white block mb-1">💡 Quick Reminder</span>
                  For most employees, your password is your Date of Birth in <span className="text-white">DD-MM-YYYY</span> format.
                </p>
              </div>

              <DialogFooter>
                <Button 
                  type="submit" 
                  disabled={forgotLoading}
                  className="h-14 w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-black uppercase text-xs tracking-widest shadow-xl transition-all active:scale-95"
                >
                  {forgotLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Send Instructions"}
                </Button>
              </DialogFooter>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Login;
