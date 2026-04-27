import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  Building2, 
  ShieldCheck, 
  Camera, 
  Loader2, 
  CheckCircle2,
  Lock,
  HeartPulse,
  IdCard,
  FileText,
  Briefcase,
  MapPin,
  GraduationCap,
  Monitor,
  Calendar,
  CreditCard,
  UserMinus,
  Edit3,
  Trash2,
  ChevronRight,
  Globe,
  Languages,
  Palette,
  Download,
  Eye,
  CheckCircle,
  AlertCircle,
  FileCode,
  Files
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { apiFetch } from '@/services/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const Profile = () => {
  const { user, isEmployee, isSuperAdmin, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [vaultDocs, setVaultDocs] = useState([]);
  const [editForm, setEditForm] = useState({});
  const [imgError, setImgError] = useState(false);
  const [revealStates, setRevealStates] = useState({});
  const fileInputRef = useRef(null);

  const tabs = [
    { id: 'personal', label: 'Personal Details', icon: User },
    { id: 'basic', label: 'Basic Information', icon: Briefcase },
    { id: 'emergency', label: 'Emergency Contact', icon: HeartPulse },
    { id: 'vault', label: 'Identity Vault', icon: IdCard },
    { id: 'docs', label: 'Documents', icon: Files },
    { id: 'bank', label: 'Bank Details', icon: CreditCard },
    { id: 'more', label: 'More Information', icon: ShieldCheck },
  ];

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (activeTab === 'docs' || activeTab === 'vault') {
        fetchVaultDocuments();
    }
  }, [activeTab, profileData]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setImgError(false);
      const res = await apiFetch('/dashboard/summary');
      const data = res?.data?.personalData || res?.personalData;
      setProfileData(data);
      setEditForm({
        firstName: data?.firstName,
        lastName: data?.lastName,
      });
    } catch (err) {
      toast.error("Failed to synchronize identity profile.");
    } finally {
      setLoading(false);
    }
  };

  const fetchVaultDocuments = async () => {
    try {
        const employeeId = profileData?.id || user?.employeeId;
        if (!employeeId) return;
        const res = await apiFetch(`/document/employee/${employeeId}`);
        if (res.status === 'success') {
            setVaultDocs(res.data);
        }
    } catch (e) {
        console.error("Failed to load vault documents");
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemovePhoto = async () => {
    if (!profileData?.id) return;
    if (!window.confirm("Are you sure you want to remove your profile photo?")) return;

    try {
      setIsSaving(true);
      await apiFetch(`/employees/${profileData.id}/profile-image`, {
        method: 'DELETE'
      });

      setImgError(false);
      toast.success("Identity photo removed.");
      setProfileData(prev => ({ ...prev, profileImage: null }));
      
      const updatedUser = { ...user, profileImage: null };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      window.dispatchEvent(new Event('storage')); 
      fetchProfile();
    } catch (err) {
      toast.error(err.message || "Failed to remove photo.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      return toast.error("Only professional JPG or PNG photos are authorized.");
    }
    
    if (file.size > 2 * 1024 * 1024) {
      return toast.error("Image too heavy. Max limit is 2MB.");
    }

    try {
      setIsSaving(true);
      const formData = new FormData();
      formData.append('image', file);

      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8080/api'}/employees/${profileData.id}/profile-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Upload failed");

      setImgError(false);
      toast.success("Identity profile image updated!");
      
      if (result.data) {
        setProfileData(result.data);
      }
      
      const updatedUser = { ...user, profileImage: result.data?.profileImage };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      window.dispatchEvent(new Event('storage')); 
      fetchProfile();
    } catch (err) {
      toast.error(err.message || "Failed to sync photo to cloud.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    if (!profileData?.id) return toast.error("Profile identity not found.");
    try {
      setIsSaving(true);
      await apiFetch(`/employees/${profileData.id}`, {
        method: 'PUT',
        body: editForm
      });
      toast.success("Profile updated successfully!");
      setIsEditing(false);
      fetchProfile();
    } catch (err) {
      toast.error(err.message || "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleReveal = (key) => {
    setRevealStates(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const maskValue = (value, show) => {
    if (!value) return 'Not Shared';
    if (show) return value;
    return value.toString().replace(/.(?=.{4})/g, '•');
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
        <p className="text-muted-foreground font-black tracking-widest uppercase text-xs">Synchronizing Identity...</p>
      </div>
    );
  }

  const renderInfoItem = (label, value, Icon, color = "text-primary") => (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 transition-all hover:shadow-md group"
    >
      <div className={cn("h-10 w-10 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform", color)}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{label}</p>
        <p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">{value || 'N/A'}</p>
      </div>
    </motion.div>
  );

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-8 space-y-8 pb-32">
      
      {/* 1. MODERN PROFILE HEADER CARD */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative bg-slate-900 rounded-[3rem] p-8 md:p-12 shadow-2xl overflow-hidden border border-white/10"
      >
        {/* Background Accents */}
        <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none">
          <ShieldCheck className="h-64 w-64 text-white" />
        </div>
        <div className="absolute -bottom-24 -left-24 h-64 w-64 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center lg:items-end gap-10">
          {/* Profile Image Section */}
          <div className="relative group">
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/jpeg,image/png" 
              onChange={handleFileChange} 
            />
            <div 
              onClick={handleAvatarClick}
              className="h-40 w-40 rounded-[2.5rem] bg-gradient-to-br from-primary to-blue-600 p-1 shadow-2xl cursor-pointer hover:rotate-3 transition-all duration-500 overflow-hidden"
            >
              <div className="h-full w-full rounded-[2.3rem] bg-slate-900 overflow-hidden flex items-center justify-center relative group/inner">
                {profileData?.profileImage && !imgError ? (
                  <img 
                    src={`${(import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080').replace('127.0.0.1', window.location.hostname)}${profileData.profileImage}`} 
                    alt="Profile" 
                    className="h-full w-full object-cover transition-transform duration-700 group-hover/inner:scale-110"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <span className="text-6xl font-black italic text-white/20 select-none">
                    {profileData?.firstName?.charAt(0) || user?.name?.charAt(0)}
                  </span>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/inner:opacity-100 flex items-center justify-center transition-all duration-300">
                  <Camera className="h-8 w-8 text-white animate-in zoom-in" />
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            {profileData?.profileImage && (
              <button 
                onClick={(e) => { e.stopPropagation(); handleRemovePhoto(); }}
                className="absolute -top-2 -right-2 h-10 w-10 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-xl border-4 border-slate-900 hover:scale-110 active:scale-95 transition-all"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
            <div className="absolute -bottom-2 -right-2 h-10 w-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xl border-4 border-slate-900">
                <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>

          {/* Identity Details */}
          <div className="flex-1 text-center lg:text-left space-y-4">
            <div className="space-y-1">
                <Badge className="bg-primary/20 text-primary border-none rounded-lg px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] mb-2">
                    {profileData?.status === 'ACTIVE' ? 'Active Status' : 'Inactive'}
                </Badge>
                {isEditing ? (
                  <div className="flex flex-col sm:flex-row gap-2 mb-2 animate-in slide-in-from-left-2">
                    <Input 
                       value={editForm.firstName || ''} 
                       onChange={e => setEditForm({...editForm, firstName: e.target.value})}
                       className="bg-white/10 border-white/20 text-white font-black uppercase h-10 px-4 rounded-xl placeholder:text-white/20"
                       placeholder="First Name"
                    />
                    <Input 
                       value={editForm.lastName || ''} 
                       onChange={e => setEditForm({...editForm, lastName: e.target.value})}
                       className="bg-white/10 border-white/20 text-white font-black uppercase h-10 px-4 rounded-xl placeholder:text-white/20"
                       placeholder="Last Name"
                    />
                  </div>
                ) : (
                  <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase italic leading-none">
                      {profileData?.firstName} {profileData?.lastName}
                  </h1>
                )}
                <p className="text-lg font-bold text-white/60 tracking-tight">
                    {typeof profileData?.designation === 'object' ? profileData?.designation?.name : (profileData?.designation || 'Specialist')}
                </p>
            </div>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/40 text-[10px] font-black uppercase tracking-widest">
                    <IdCard className="h-3 w-3 text-primary" />
                    ID: {profileData?.employeeCode}
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/40 text-[10px] font-black uppercase tracking-widest">
                    <Building2 className="h-3 w-3 text-blue-400" />
                    {profileData?.department?.name || 'Authorized Dept'}
                </div>
            </div>
          </div>

          {/* Quick Stats / Action */}
          <div className="flex flex-col gap-3 w-full lg:w-auto">
             {isEditing && (
                <Button 
                   onClick={handleSave} 
                   disabled={isSaving}
                   className="rounded-2xl h-14 px-8 bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase text-[11px] tracking-widest shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                   {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                   Commit Changes
                </Button>
             )}
             <Button 
                onClick={() => setIsEditing(!isEditing)}
                className={cn(
                    "rounded-2xl h-14 px-8 font-black uppercase text-[11px] tracking-widest transition-all",
                    isEditing ? "bg-rose-500 hover:bg-rose-600" : "bg-white text-slate-900 hover:bg-slate-100"
                )}
             >
                {isEditing ? 'Discard Changes' : 'Edit Profile'}
             </Button>
             <div className="flex items-center gap-4 justify-center lg:justify-end text-white/40">
                <div className="text-center">
                    <p className="text-[14px] font-black text-white italic leading-none">
                        {profileData?.dateOfJoining ? new Date(profileData.dateOfJoining).getFullYear() : '2024'}
                    </p>
                    <p className="text-[8px] font-black uppercase tracking-widest">Joined</p>
                </div>
                <div className="h-8 w-px bg-white/10" />
                <div className="text-center">
                    <p className="text-[14px] font-black text-white italic leading-none">
                        {vaultDocs.length}
                    </p>
                    <p className="text-[8px] font-black uppercase tracking-widest">Docs</p>
                </div>
             </div>
          </div>
        </div>
      </motion.div>

      {/* 2. TAB NAVIGATION */}
      <div className="flex items-center gap-2 p-2 bg-slate-100 dark:bg-slate-800/50 rounded-3xl overflow-x-auto no-scrollbar border border-slate-200/50 dark:border-slate-800">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all relative shrink-0",
              activeTab === tab.id 
                ? "bg-white dark:bg-slate-900 text-primary shadow-xl shadow-black/5" 
                : "text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 dark:hover:bg-slate-800"
            )}
          >
            <tab.icon className={cn("h-4 w-4", activeTab === tab.id ? "text-primary" : "text-slate-400")} />
            {tab.label}
            {activeTab === tab.id && (
                <motion.div 
                    layoutId="activeTab"
                    className="absolute inset-0 bg-white dark:bg-slate-900 rounded-2xl -z-10 shadow-lg"
                    transition={{ type: 'spring', duration: 0.5 }}
                />
            )}
          </button>
        ))}
      </div>

      {/* 3. SECTION CONTENT */}
      <div className="relative min-h-[500px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            {/* PERSONAL DETAILS SECTION */}
            {activeTab === 'personal' && (
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <Card className="lg:col-span-2 border-none shadow-2xl rounded-[2.5rem] bg-white p-10 space-y-10">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="text-2xl font-black uppercase tracking-tighter italic text-slate-800">Personal Identity</h3>
                            <p className="text-[10px] font-black uppercase tracking-widest text-primary">Confidential Information</p>
                        </div>
                        <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-primary">
                            <User className="h-6 w-6" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {renderInfoItem('Full Name', `${profileData?.firstName} ${profileData?.lastName}`, User)}
                        {renderInfoItem('Official Email', profileData?.officialEmail, Mail, "text-blue-500")}
                        {renderInfoItem('Official Phone', profileData?.officialPhone, Phone, "text-emerald-500")}
                        {renderInfoItem('Date of Birth', profileData?.personalDetail?.dateOfBirth, HeartPulse, "text-rose-500")}
                        {renderInfoItem('Gender', profileData?.personalDetail?.gender, User, "text-indigo-500")}
                        {renderInfoItem('Marital Status', profileData?.personalDetail?.maritalStatus, ShieldCheck, "text-amber-500")}
                    </div>

                    <div className="pt-10 border-t border-slate-50 space-y-6">
                        <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Address Information</h4>
                        <div className="grid grid-cols-1 gap-6">
                            {renderInfoItem('Current Address', profileData?.contactDetail?.currentAddress, MapPin, "text-orange-500")}
                            {renderInfoItem('Permanent Address', profileData?.contactDetail?.permanentAddress, MapPin, "text-sky-500")}
                        </div>
                    </div>
                  </Card>

                  <Card className="border-none shadow-2xl rounded-[2.5rem] bg-slate-50 p-10 flex flex-col items-center justify-center text-center space-y-6">
                      <div className="h-32 w-32 rounded-full bg-white flex items-center justify-center shadow-inner">
                        <Palette className="h-16 w-16 text-primary/20" />
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-lg font-black uppercase tracking-tighter italic">Hobbies & Interests</h4>
                        <p className="text-xs text-slate-400 font-medium leading-relaxed">Personal interests are not yet shared. Connect with HR to update your social profile.</p>
                      </div>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {['Music', 'Travel', 'Coding'].map(h => (
                            <Badge key={h} className="bg-white text-slate-400 border-slate-200 rounded-lg px-4 py-1 uppercase text-[8px] font-black tracking-widest">{h}</Badge>
                        ))}
                      </div>
                  </Card>
               </div>
            )}

            {/* BASIC INFORMATION SECTION */}
            {activeTab === 'basic' && (
               <Card className="border-none shadow-2xl rounded-[3rem] bg-white p-12">
                  <div className="flex items-center gap-4 mb-12">
                      <div className="h-16 w-16 rounded-[1.5rem] bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-200">
                          <Briefcase className="h-8 w-8" />
                      </div>
                      <div className="space-y-1">
                          <h3 className="text-3xl font-black uppercase tracking-tighter italic text-slate-800 leading-none">Professional Dossier</h3>
                          <p className="text-[11px] font-black uppercase tracking-widest text-blue-600">Company Employment Details</p>
                      </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {renderInfoItem('Employee Code', profileData?.employeeCode, IdCard)}
                      {renderInfoItem('Department', profileData?.department?.name, Building2, "text-indigo-500")}
                      {renderInfoItem('Designation', typeof profileData?.designation === 'object' ? profileData?.designation?.name : profileData?.designation, Briefcase, "text-blue-500")}
                      {renderInfoItem('Date of Joining', profileData?.dateOfJoining, Calendar, "text-emerald-500")}
                      {renderInfoItem('Blood Group', profileData?.personalDetail?.bloodGroup, HeartPulse, "text-rose-500")}
                      {renderInfoItem('Nationality', profileData?.personalDetail?.nationality, Globe, "text-orange-500")}
                      {renderInfoItem('Work Location', profileData?.workLocation || 'Noida HQ', MapPin, "text-sky-500")}
                      {renderInfoItem('Primary Language', 'English, Hindi', Languages, "text-purple-500")}
                      {renderInfoItem('Shift Timing', profileData?.Shift?.shiftName || '9:00 AM - 6:00 PM', Monitor, "text-slate-500")}
                  </div>
               </Card>
            )}

            {/* EMERGENCY CONTACT SECTION */}
            {activeTab === 'emergency' && (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {profileData?.emergencyContacts?.length > 0 ? (
                            profileData.emergencyContacts.map((contact, i) => (
                                <motion.div key={i} whileHover={{ y: -5 }} transition={{ type: 'spring' }}>
                                    <Card className="border-none shadow-2xl rounded-[3rem] bg-white p-10 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                            <HeartPulse className="h-24 w-24 text-rose-500" />
                                        </div>
                                        <div className="flex items-center gap-4 mb-8">
                                            <div className="h-14 w-14 rounded-2xl bg-rose-500 flex items-center justify-center text-white shadow-lg shadow-rose-200">
                                                <User className="h-6 w-6" />
                                            </div>
                                            <div className="space-y-0.5">
                                                <h4 className="text-xl font-black uppercase tracking-tighter italic text-slate-800">{contact.contactName}</h4>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-rose-500">{contact.relationship}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-6">
                                            {renderInfoItem('Phone Number', contact.phoneNumber, Phone, "text-emerald-500")}
                                            {renderInfoItem('Address', contact.address || 'Authorized Emergency Point', MapPin, "text-slate-400")}
                                        </div>
                                    </Card>
                                </motion.div>
                            ))
                        ) : (
                            <div className="col-span-2 py-32 bg-white rounded-[3rem] flex flex-col items-center justify-center text-center opacity-30 gap-6 border-4 border-dashed border-slate-100">
                                <HeartPulse className="h-20 w-20" />
                                <div className="space-y-2">
                                    <p className="text-lg font-black uppercase tracking-tighter italic">No Emergency Contacts</p>
                                    <p className="text-xs font-bold uppercase tracking-widest">Protocols not established</p>
                                </div>
                                <Button className="rounded-xl bg-slate-900 text-white font-black uppercase text-[9px] px-6">Add Contact</Button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* IDENTITY VAULT SECTION */}
            {activeTab === 'vault' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { id: 'aadhaar', label: 'Aadhaar Card', value: profileData?.legalDetail?.aadhaarNumber, icon: IdCard, color: 'emerald' },
                        { id: 'pan', label: 'PAN Card', value: profileData?.legalDetail?.panNumber, icon: ShieldCheck, color: 'blue' },
                        { id: 'pf', label: 'PF Number', value: profileData?.legalDetail?.pfNumber, icon: Files, color: 'purple' },
                        { id: 'esi', label: 'ESI Number', value: profileData?.legalDetail?.esiNumber, icon: HeartPulse, color: 'indigo' },
                    ].map((card, i) => (
                        <Card key={i} className="border-none shadow-xl rounded-[2.5rem] bg-white p-8 space-y-6 relative group overflow-hidden">
                             <div className={`absolute top-0 right-0 h-24 w-24 bg-${card.color}-500/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700`} />
                             <div className={`h-12 w-12 rounded-2xl bg-${card.color}-500/10 flex items-center justify-center text-${card.color}-600 shadow-sm`}>
                                <card.icon className="h-6 w-6" />
                             </div>
                             <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{card.label}</p>
                                <h4 className="text-lg font-black italic tracking-tighter text-slate-800">
                                    {maskValue(card.value, revealStates[card.id])}
                                </h4>
                             </div>
                             <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                <Badge className="bg-emerald-500/10 text-emerald-600 border-none rounded-lg px-2 py-0.5 text-[8px] font-black uppercase tracking-widest">
                                    Verified
                                </Badge>
                                <button 
                                    onClick={() => toggleReveal(card.id)}
                                    className={cn("transition-colors", revealStates[card.id] ? "text-primary" : "text-slate-300 hover:text-primary")}
                                >
                                    <Eye className="h-4 w-4" />
                                </button>
                             </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* DOCUMENTS SECTION */}
            {activeTab === 'docs' && (
                <Card className="border-none shadow-2xl rounded-[3rem] bg-white p-10 overflow-hidden">
                     <div className="flex items-center justify-between mb-10">
                        <div className="space-y-1">
                            <h3 className="text-2xl font-black uppercase tracking-tighter italic text-slate-800">Document Repository</h3>
                            <p className="text-[10px] font-black uppercase tracking-widest text-primary">Soft-copy records</p>
                        </div>
                        <Button className="rounded-xl bg-slate-900 text-white font-black uppercase text-[10px] tracking-widest flex items-center gap-2 px-6">
                            <Download className="h-4 w-4" /> Export All
                        </Button>
                     </div>

                     <div className="grid grid-cols-1 gap-4">
                        {vaultDocs.length > 0 ? (
                            vaultDocs.map((doc, i) => (
                                <div key={i} className="flex items-center justify-between p-6 rounded-[2rem] bg-slate-50 hover:bg-slate-100/80 border border-slate-100 transition-all group">
                                    <div className="flex items-center gap-6">
                                        <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center text-primary shadow-sm group-hover:scale-110 transition-transform">
                                            <FileCode className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-black text-slate-800 italic uppercase leading-none mb-1">{doc.documentName}</h4>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{doc.documentType} — {new Date(doc.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge className="bg-emerald-500/10 text-emerald-600 border-none rounded-lg px-2 py-0.5 text-[8px] font-black uppercase tracking-widest mr-4">
                                            Verified
                                        </Badge>
                                        <a 
                                            href={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}${doc.filePath}`}
                                            target="_blank" 
                                            rel="noreferrer"
                                            className="h-10 w-10 rounded-xl bg-white hover:bg-primary hover:text-white flex items-center justify-center text-slate-400 shadow-sm transition-all"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </a>
                                        <a 
                                            href={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}${doc.filePath}`}
                                            download
                                            className="h-10 w-10 rounded-xl bg-primary/10 hover:bg-primary text-primary hover:text-white flex items-center justify-center shadow-sm transition-all"
                                        >
                                            <Download className="h-4 w-4" />
                                        </a>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-20 text-center opacity-20 italic font-black uppercase tracking-widest text-xs">
                                No verified documents in the repository.
                            </div>
                        )}
                     </div>
                </Card>
            )}

            {/* BANK DETAILS SECTION */}
            {activeTab === 'bank' && (
                <div className="max-w-4xl">
                    <Card className="border-none shadow-2xl rounded-[3rem] bg-gradient-to-br from-slate-900 to-slate-800 p-12 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                            <CreditCard className="h-48 w-48 text-white" />
                        </div>
                        
                        <div className="flex items-center justify-between mb-12">
                            <div className="space-y-1">
                                <h3 className="text-3xl font-black uppercase tracking-tighter italic leading-none">Settlement Account</h3>
                                <p className="text-[11px] font-black uppercase tracking-widest text-white/40">Verified Banking Information</p>
                            </div>
                            <div className="h-16 w-16 rounded-2xl bg-white/5 flex items-center justify-center text-emerald-400 border border-white/10">
                                <Building2 className="h-8 w-8" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-8">
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Bank Institution</p>
                                    <p className="text-2xl font-black italic tracking-tighter">{profileData?.bankDetail?.bankName || 'Authorized Financial Inst'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Account Number</p>
                                    <p className="text-2xl font-black italic tracking-tighter">
                                        {profileData?.bankDetail?.accountNumber ? `•••• •••• ${profileData.bankDetail.accountNumber.slice(-4)}` : '•••• •••• ••••'}
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-8">
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-white/30">IFSC / Routing Code</p>
                                    <p className="text-2xl font-black italic tracking-tighter">{profileData?.bankDetail?.ifscCode || 'N/A'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Account Holder</p>
                                    <p className="text-2xl font-black italic tracking-tighter text-emerald-400">{profileData?.bankDetail?.accountHolderName || `${profileData?.firstName} ${profileData?.lastName}`}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 pt-8 border-t border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-white/20 italic">Encrypted Secure Data</span>
                            </div>
                            <Badge className="bg-emerald-500/20 text-emerald-500 border-none rounded-lg px-4 py-1 text-[9px] font-black uppercase tracking-widest">
                                Primary Salary Account
                            </Badge>
                        </div>
                    </Card>
                </div>
            )}

            {/* MORE INFORMATION SECTION */}
            {activeTab === 'more' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { label: 'Work Experience', icon: Briefcase, count: profileData?.experiences?.length || 0 },
                        { label: 'Education Records', icon: GraduationCap, count: profileData?.educations?.length || 0 },
                        { label: 'Certifications', icon: CheckCircle, count: profileData?.certifications?.length || 0 },
                    ].map((item, i) => (
                        <Card key={i} className="border-none shadow-xl rounded-[2.5rem] bg-white p-8 flex flex-col items-center justify-center text-center space-y-4 hover:shadow-2xl transition-all">
                             <div className="h-16 w-16 rounded-2xl bg-slate-50 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                <item.icon className="h-8 w-8" />
                             </div>
                             <div className="space-y-1">
                                <h4 className="text-lg font-black uppercase tracking-tighter italic text-slate-800">{item.label}</h4>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item.count} Verified Records</p>
                             </div>
                             <Button variant="ghost" className="rounded-xl text-[9px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 px-6">
                                View Details <ChevronRight className="h-3 w-3 ml-2" />
                             </Button>
                        </Card>
                    ))}
                </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Profile;
