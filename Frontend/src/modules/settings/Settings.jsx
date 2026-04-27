import React, { useState, useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { 
  Building2, 
  ShieldCheck, 
  Sun, 
  Moon, 
  Monitor, 
  Smartphone, 
  Palette, 
  BellRing, 
  Database,
  Loader2,
  Globe,
  Clock,
  Zap,
  Activity,
  ShieldAlert,
  Fingerprint,
  Cpu
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { apiFetch } from '@/services/api';
import { toast } from 'sonner';
import PageLoader from '@/components/ui/PageLoader';
import { cn } from '@/lib/utils';
import * as XLSX from 'xlsx';
import SupportChat from '@/components/support/SupportChat';

/**
 * Global Settings Module - Premium Command Center
 * Handles Company profile, Theme management, and System preferences (HR Only)
 */
const Settings = () => {

  const { theme, setTheme } = useTheme();
  const { user, isSuperAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  const [companyData, setCompanyData] = useState({
    companyName: 'Root System',
    domain: 'xtown.hrms',
    address: 'Global Hub',
    email: 'system@xtown.hrms',
    phone: '',
    workingStartTime: '09:00',
    workingEndTime: '18:00'
  });

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        setLoading(true);
        if (isSuperAdmin) {
          setCompanyData({
            companyName: 'XTOWN TECHNOLOGIES',
            domain: 'xtown.global',
            address: 'Global Command Hub',
            email: 'system@xtown.global',
            phone: 'SYSTEM-ROOT',
            workingStartTime: '00:00',
            workingEndTime: '23:59'
          });
          return;
        }

        const res = await apiFetch(`/companies`);
        const company = Array.isArray(res) ? res[0] : res?.data?.[0];
        if (company) {
          setCompanyData({
            id: company.id,
            companyName: company.companyName || '',
            domain: company.domain || '',
            address: company.address || '',
            email: company.email || '',
            phone: company.phone || '',
            workingStartTime: company.workingStartTime || '09:00',
            workingEndTime: company.workingEndTime || '18:00'
          });
        }
      } catch (e) {
        console.error('Context fetch suppressed:', e.message);
      } finally {
        setLoading(false);
      }
    };

    if (user?.companyId || isSuperAdmin) {
      fetchCompany();
    } else {
      setLoading(false);
    }
  }, [user, isSuperAdmin]);

  const handleSave = async () => {
    try {
      if (!companyData.id && !isSuperAdmin) return toast.error("Missing company identifier.");
      setIsSaving(true);
      
      if (!isSuperAdmin) {
        await apiFetch(`/companies/${companyData.id}`, {
          method: 'PUT',
          body: JSON.stringify(companyData)
        });
      }
      
      toast.success('Enterprise parameters synchronized successfully!');
    } catch (e) {
      toast.error(e.message || 'Synchronization failed');
    } finally {
      setIsSaving(false);
    }
  };

  const navItems = [
    { id: 'profile', label: 'Company Details', icon: Building2, desc: 'Name, Address & Domain' },
    { id: 'security', label: 'Security', icon: ShieldCheck, desc: 'Login & Passwords' },
    { id: 'notifications', label: 'Notifications', icon: BellRing, desc: 'Email & Alert settings' },
    { id: 'system', label: 'System Health', icon: Cpu, desc: 'Performance & Status' },
    { id: 'backup', label: 'Data Backup', icon: Database, desc: 'Safe storage & Archives' },
  ];

  if (loading) {
    return <PageLoader message="Opening Settings..." />;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-24">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 px-4">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-primary/10 rounded-xl">
                <Zap className="h-6 w-6 text-primary animate-pulse" />
             </div>
             <Badge className="bg-primary/10 text-primary border-none font-black text-[9px] uppercase tracking-widest px-4 py-1 rounded-full">
                {isSuperAdmin ? 'Master Account' : 'Company Admin'}
             </Badge>
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-foreground uppercase italic leading-none">
            General <span className="text-primary">Settings</span>
          </h1>
          <p className="text-muted-foreground font-bold uppercase tracking-widest text-[11px] opacity-60 pl-1 border-l-4 border-primary max-w-lg">
             Manage your company profile and system preferences for <span className="text-foreground italic">{companyData.companyName}</span>.
          </p>
        </div>

        <div className="bg-card/50 backdrop-blur-xl border border-border rounded-[2.5rem] p-6 flex items-center gap-8 shadow-2xl ring-1 ring-border/50">
           <div className="flex flex-col items-end">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 italic">Server Status</span>
              <div className="flex items-center gap-2">
                 <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                 <span className="font-black text-foreground italic uppercase text-sm tracking-tighter">Online</span>
              </div>
           </div>
           <div className="h-10 w-[1px] bg-border" />
           <div className="flex flex-col items-end">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 italic">System Uptime</span>
              <span className="font-black text-primary italic uppercase text-sm tracking-tighter">99.9%</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* SIDEBAR NAVIGATION */}
        <div className="lg:col-span-3 space-y-6">
           <div className="grid grid-cols-1 gap-3">
              {navItems.map((item) => (
                <button 
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "relative group flex flex-col items-start p-6 rounded-[2rem] transition-all duration-500 text-left overflow-hidden border border-transparent",
                    activeTab === item.id 
                      ? "bg-foreground text-background shadow-2xl shadow-primary/20 scale-[1.02]" 
                      : "bg-card/40 hover:bg-card hover:border-border text-muted-foreground"
                  )}
                >
                   {activeTab === item.id && (
                     <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
                        <item.icon className="h-20 w-20" />
                     </div>
                   )}
                   <div className={cn(
                     "p-2.5 rounded-xl mb-4 transition-colors",
                     activeTab === item.id ? "bg-primary text-white" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                   )}>
                      <item.icon className="h-5 w-5" />
                   </div>
                   <span className="text-[11px] font-black uppercase tracking-widest mb-1">{item.label}</span>
                   <span className={cn(
                     "text-[9px] font-bold uppercase tracking-tighter opacity-40 italic transition-all",
                     activeTab === item.id ? "opacity-60" : "group-hover:opacity-60"
                   )}>{item.desc}</span>
                </button>
              ))}
           </div>

           <Card className="border-none bg-indigo-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl group cursor-pointer hover:scale-[1.02] transition-transform duration-500">
              <div className="absolute -bottom-10 -right-10 opacity-10 group-hover:rotate-12 transition-transform duration-700">
                 <ShieldAlert className="h-40 w-40" />
              </div>
              <div className="relative z-10 space-y-4">
                 <h4 className="text-xl font-black italic tracking-tighter uppercase leading-tight">Need Help?</h4>
                 <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Support is available</p>
                 <Button className="w-full bg-white text-indigo-600 hover:bg-indigo-50 rounded-xl font-black uppercase text-[10px] tracking-widest h-11 border-none shadow-xl" onClick={() => setIsChatOpen(true)}>Contact Us</Button>
              </div>
           </Card>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="lg:col-span-9 space-y-10">
          
          {/* THEME & APPEARANCE */}
          <section className="space-y-4">
            <div className="flex items-center justify-between px-2">
               <h3 className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.3em] italic flex items-center gap-2">
                  <Palette className="h-4 w-4" /> Theme & Appearance
               </h3>
               <Badge className="bg-emerald-500/10 text-emerald-600 border-none font-black text-[8px] uppercase px-3">Standard View</Badge>
            </div>
            <Card className="border-none shadow-xl rounded-[3rem] overflow-hidden bg-card/60 backdrop-blur-md ring-1 ring-border/50">
               <CardContent className="p-10">
                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-2">
                      <h4 className="text-2xl font-black tracking-tight uppercase italic text-foreground">Visual Style</h4>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-60">Choose how the system looks for you.</p>
                    </div>
                    <div className="flex bg-muted p-2 rounded-2xl ring-1 ring-border/50">
                       {[
                         { id: 'light', icon: Sun, label: 'Light' },
                         { id: 'dark', icon: Moon, label: 'Dark' },
                         { id: 'system', icon: Monitor, label: 'Auto' }
                       ].map((m) => (
                         <Button 
                           key={m.id}
                           variant={theme === m.id ? 'default' : 'ghost'} 
                           className={cn(
                             "rounded-xl gap-3 font-black uppercase text-[10px] tracking-widest transition-all px-8 h-12",
                             theme === m.id ? "bg-foreground text-background shadow-2xl" : "text-muted-foreground hover:text-foreground"
                           )}
                           onClick={() => setTheme(m.id)}
                         >
                           <m.icon className="h-4 w-4" /> {m.label}
                         </Button>
                       ))}
                    </div>
                 </div>
               </CardContent>
            </Card>
          </section>

          {/* TAB CONTENT */}
          <div className="animate-in fade-in slide-in-from-right-8 duration-700">
            {activeTab === 'profile' && (
              <section className="space-y-8">
                <div className="flex items-center gap-4 px-2">
                   <h3 className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.3em] italic flex items-center gap-2">
                      <Globe className="h-4 w-4" /> Company Information
                   </h3>
                </div>
                <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-card/40 backdrop-blur-xl ring-1 ring-border/50 p-1">
                   <div className="bg-card rounded-[2.9rem] p-12 space-y-12">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-3">
                           <label className="text-[10px] font-black text-primary uppercase tracking-widest pl-1">Company Name</label>
                           <div className="relative group">
                              <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/30 group-focus-within:text-primary transition-colors" />
                              <Input 
                                value={companyData.companyName} 
                                onChange={e => setCompanyData({...companyData, companyName: e.target.value})}
                                className="h-16 pl-14 rounded-2xl bg-muted/30 border-border/50 font-black text-xl italic tracking-tighter focus-visible:ring-primary/20 transition-all" 
                              />
                           </div>
                        </div>
                        <div className="space-y-3">
                           <label className="text-[10px] font-black text-primary uppercase tracking-widest pl-1">Website Domain</label>
                           <div className="relative flex items-center gap-3">
                              <Globe className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/30" />
                              <Input 
                                  value={companyData.domain} 
                                  onChange={e => setCompanyData({...companyData, domain: e.target.value})}
                                  className="h-16 pl-14 rounded-2xl bg-muted/30 border-border/50 font-black text-primary focus-visible:ring-primary/20" 
                              />
                              <div className="absolute right-4 h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                 <ShieldCheck className="h-4 w-4 text-emerald-600" />
                              </div>
                           </div>
                        </div>
                        <div className="space-y-3 md:col-span-2">
                           <label className="text-[10px] font-black text-primary uppercase tracking-widest pl-1">Office Address</label>
                           <Input 
                              value={companyData.address} 
                              onChange={e => setCompanyData({...companyData, address: e.target.value})}
                              className="h-16 rounded-2xl bg-muted/30 border-border/50 font-bold px-6 focus-visible:ring-primary/20" 
                           />
                        </div>

                        <div className="space-y-3">
                           <label className="text-[10px] font-black text-primary uppercase tracking-widest pl-1">Start Time (Morning)</label>
                           <div className="flex items-center gap-4 px-6 bg-muted/30 border border-border/50 h-16 rounded-2xl transition-all group focus-within:ring-2 focus-within:ring-primary/20">
                              <Clock className="h-5 w-5 text-muted-foreground/30 group-focus-within:text-primary" />
                              <Input 
                                  type="time"
                                  value={companyData.workingStartTime} 
                                  onChange={e => setCompanyData({...companyData, workingStartTime: e.target.value})}
                                  className="border-none bg-transparent shadow-none font-black text-xl p-0 h-auto focus-visible:ring-0 italic" 
                              />
                           </div>
                        </div>

                        <div className="space-y-3">
                           <label className="text-[10px] font-black text-primary uppercase tracking-widest pl-1">End Time (Evening)</label>
                           <div className="flex items-center gap-4 px-6 bg-muted/30 border border-border/50 h-16 rounded-2xl transition-all group focus-within:ring-2 focus-within:ring-primary/20">
                              <Clock className="h-5 w-5 text-muted-foreground/30 group-focus-within:text-primary" />
                              <Input 
                                  type="time"
                                  value={companyData.workingEndTime} 
                                  onChange={e => setCompanyData({...companyData, workingEndTime: e.target.value})}
                                  className="border-none bg-transparent shadow-none font-black text-xl p-0 h-auto focus-visible:ring-0 italic" 
                              />
                           </div>
                        </div>
                      </div>
                      
                      <div className="pt-10 flex flex-col md:flex-row justify-between items-center gap-8 border-t border-border/50">
                         <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center border border-border/50">
                               <Fingerprint className="h-6 w-6 text-muted-foreground/40" />
                            </div>
                            <div className="flex flex-col">
                               <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 italic">System Code</span>
                               <span className="text-xs font-mono font-bold opacity-30">HRMS-8A72-F9B4</span>
                            </div>
                         </div>
                         <Button 
                           onClick={handleSave} 
                           disabled={isSaving} 
                           className="h-16 rounded-3xl px-16 bg-primary hover:bg-blue-700 text-white font-black uppercase text-xs tracking-[0.3em] shadow-2xl shadow-primary/40 active:scale-95 transition-all group"
                         >
                           {isSaving ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : (
                             <>
                               Update Settings
                               <Zap className="h-4 w-4 ml-3 group-hover:animate-bounce" />
                             </>
                           )}
                         </Button>
                      </div>
                   </div>
                </Card>
              </section>
            )}

            {activeTab === 'security' && (
              <section className="space-y-8">
                 <div className="flex items-center gap-4 px-2">
                   <h3 className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.3em] italic flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4" /> Security & Passwords
                   </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <Card className="rounded-[3.5rem] border-none shadow-2xl bg-gradient-to-br from-card to-muted p-12 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                         <Fingerprint className="h-40 w-40" />
                      </div>
                      <h4 className="text-2xl font-black italic tracking-tighter uppercase mb-4 text-foreground">Password Rules</h4>
                      <p className="text-muted-foreground text-[11px] font-bold uppercase tracking-widest mb-10 leading-relaxed opacity-60">Requirements for all staff and admin accounts.</p>
                      <div className="space-y-6">
                         <div className="flex items-center justify-between border-b border-border/50 pb-4">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Minimum Length</span>
                            <Badge className="bg-primary/10 text-primary border-none font-black text-[10px]">12 Letters</Badge>
                         </div>
                         <div className="flex items-center justify-between border-b border-border/50 pb-4">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Mobile Verification</span>
                            <Badge className="bg-emerald-500/10 text-emerald-600 border-none font-black text-[10px]">On</Badge>
                         </div>
                      </div>
                   </Card>
                   <Card className="rounded-[3.5rem] border-none shadow-2xl bg-card p-12 flex flex-col justify-between items-start">
                      <div className="space-y-4">
                        <div className="h-14 w-14 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-6">
                           <ShieldAlert className="h-7 w-7" />
                        </div>
                        <h4 className="text-2xl font-black italic tracking-tighter uppercase text-foreground">User Sessions</h4>
                        <p className="text-muted-foreground text-[11px] font-bold uppercase tracking-widest leading-relaxed opacity-60">Manage how long users stay logged in on their devices.</p>
                      </div>
                      <Button variant="outline" className="mt-10 w-full rounded-2xl h-14 font-black uppercase text-[10px] tracking-[0.2em] border-border/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-all">Clear All Sessions</Button>
                   </Card>
                </div>
              </section>
            )}

            {activeTab === 'notifications' && (
              <section className="space-y-8">
                 <div className="flex items-center gap-4 px-2">
                   <h3 className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.3em] italic flex items-center gap-2">
                      <BellRing className="h-4 w-4" /> Notification Settings
                   </h3>
                </div>
                <Card className="border-none shadow-2xl rounded-[3.5rem] overflow-hidden bg-card/60 backdrop-blur-xl ring-1 ring-border/50">
                   <CardContent className="p-14 space-y-10">
                      {[
                        { title: 'System Alerts', desc: 'Critical system and security updates.', state: true, icon: Zap },
                        { title: 'Email Reports', desc: 'Automated monthly and weekly reports.', state: true, icon: Globe },
                        { title: 'Mobile Alerts', desc: 'Real-time alerts on your phone or browser.', state: false, icon: Smartphone },
                      ].map((n, i) => (
                        <div key={i} className="flex items-center justify-between group py-4">
                          <div className="flex items-center gap-6">
                             <div className={cn(
                               "h-12 w-12 rounded-2xl flex items-center justify-center transition-all",
                               n.state ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-muted text-muted-foreground/40"
                             )}>
                                <n.icon className="h-5 w-5" />
                             </div>
                             <div className="space-y-1">
                               <h4 className="text-lg font-black tracking-tight uppercase italic text-foreground">{n.title}</h4>
                               <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-40">{n.desc}</p>
                             </div>
                          </div>
                          <button className={cn(
                            "w-14 h-7 rounded-full p-1 transition-all duration-500 ring-1 ring-border",
                            n.state ? "bg-primary" : "bg-muted"
                          )}>
                             <div className={cn(
                               "w-5 h-5 bg-white rounded-full transition-all shadow-md duration-500",
                               n.state ? "translate-x-7" : "translate-x-0"
                             )} />
                          </button>
                        </div>
                      ))}
                      <div className="pt-10 border-t border-border/50 flex justify-end">
                         <Button onClick={handleSave} className="h-14 rounded-2xl px-12 bg-foreground text-background font-black uppercase text-[10px] tracking-widest shadow-2xl transition-all active:scale-95">Save Changes</Button>
                      </div>
                   </CardContent>
                </Card>
              </section>
            )}

            {activeTab === 'system' && (
              <section className="space-y-8">
                 <div className="flex items-center gap-4 px-2">
                   <h3 className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.3em] italic flex items-center gap-2">
                      <Activity className="h-4 w-4" /> System Health
                   </h3>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                   <Card className="lg:col-span-2 border-none shadow-2xl rounded-[3.5rem] bg-card p-12 space-y-8 relative overflow-hidden">
                      <div className="flex items-center justify-between mb-8">
                         <h4 className="text-2xl font-black italic tracking-tighter uppercase text-foreground">Live Performance</h4>
                         <Badge className="bg-primary text-white border-none font-black text-[9px] uppercase px-4 py-1">Running Fast</Badge>
                      </div>
                      
                      <div className="space-y-6">
                         {[
                           { label: 'System Speed', value: 82 },
                           { label: 'Network', value: 45 },
                           { label: 'Database', value: 91 },
                         ].map((s, i) => (
                           <div key={i} className="space-y-2">
                              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest opacity-60">
                                 <span>{s.label}</span>
                                 <span>{s.value}%</span>
                              </div>
                              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                 <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${s.value}%` }} />
                              </div>
                           </div>
                         ))}
                      </div>
                   </Card>
                   <Card className="border-none shadow-2xl rounded-[3.5rem] bg-foreground p-12 text-background flex flex-col justify-between">
                      <div className="space-y-4">
                         <Cpu className="h-10 w-10 text-primary" />
                         <h4 className="text-2xl font-black italic tracking-tighter uppercase">Memory Used</h4>
                         <p className="text-[11px] font-black uppercase tracking-widest opacity-40">Current System Load</p>
                      </div>
                      <div className="text-5xl font-black italic tracking-tighter text-primary">64 GB</div>
                   </Card>
                </div>
              </section>
            )}

            {activeTab === 'backup' && (
              <section className="space-y-8">
                 <div className="flex items-center gap-4 px-2">
                   <h3 className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.3em] italic flex items-center gap-2">
                      <Database className="h-4 w-4" /> Data Backup
                   </h3>
                </div>
                <Card className="border-none shadow-2xl rounded-[3.5rem] bg-card overflow-hidden">
                   <div className="p-14 flex flex-col md:flex-row items-center gap-12">
                      <div className="h-40 w-40 rounded-[2.5rem] bg-indigo-600/10 flex items-center justify-center border border-indigo-600/20 relative group">
                         <div className="absolute inset-0 bg-indigo-600/5 rounded-[2.5rem] scale-0 group-hover:scale-100 transition-transform duration-500" />
                         <Database className="h-16 w-16 text-indigo-600 relative z-10 group-hover:rotate-12 transition-transform duration-500" />
                      </div>
                      <div className="flex-1 text-center md:text-left space-y-4">
                         <h3 className="text-3xl font-black italic tracking-tighter uppercase text-foreground">Safe Data Export</h3>
                         <p className="text-muted-foreground text-sm font-medium leading-relaxed max-w-xl">
                            Download a complete snapshot of your company records including employee profiles, attendance logs, and project data. 
                            The export will be provided in a secure JSON format for your archives.
                         </p>
                         <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-4">
                            <Button 
                              onClick={async () => {
                                try {
                                  toast.loading("Generating Multi-Sheet Excel Archive...");
                                  const response = await apiFetch('/dashboard/export-all'); 
                                  const result = response?.data || response;
                                  
                                  const wb = XLSX.utils.book_new();

                                  // Helper to safely convert nested data to flat rows for Excel
                                  const flattenData = (items) => {
                                    if (!items || !Array.isArray(items)) return [];
                                    return items.map(item => {
                                      const flat = {};
                                      
                                      // Prioritize human-readable fields at the beginning of the row
                                      if (item.fullName) flat['Full Name'] = item.fullName;
                                      if (item.employeeName) flat['Employee Name'] = item.employeeName;
                                      if (item.employeeCode) flat['Employee Code'] = item.employeeCode;
                                      if (item.designation && typeof item.designation === 'string') flat['Designation'] = item.designation;
                                      if (item.shift && typeof item.shift === 'string') flat['Shift'] = item.shift;

                                      // Copy other fields, skipping raw objects we've already resolved
                                      Object.keys(item).forEach(key => {
                                        const skip = ['employee', 'designation', 'Shift', 'fullName', 'employeeName', 'employeeCode', 'personalDetail', 'contactDetail', 'legalDetail', 'salary', 'bankDetail'];
                                        if (skip.includes(key)) return;

                                        if (typeof item[key] === 'object' && item[key] !== null) {
                                          flat[key] = JSON.stringify(item[key]).substring(0, 32000); 
                                        } else {
                                          flat[key] = item[key];
                                        }
                                      });
                                      return flat;
                                    });
                                  };


                                  // Add Sheets
                                  const sheets = [
                                    { name: 'Employees', data: result.data?.employees },
                                    { name: 'Attendance', data: result.data?.attendanceHistory },
                                    { name: 'Leave Requests', data: result.data?.leaveRequests },
                                    { name: 'Payroll', data: result.data?.payrollRecords },
                                    { name: 'Resignations', data: result.data?.resignationLogs },
                                    { name: 'Shifts', data: result.data?.operationalShifts },
                                    { name: 'Designations', data: result.data?.designationMatrix }
                                  ];

                                  sheets.forEach(sheet => {
                                    if (sheet.data && sheet.data.length > 0) {
                                      const ws = XLSX.utils.json_to_sheet(flattenData(sheet.data));
                                      XLSX.utils.book_append_sheet(wb, ws, sheet.name);
                                    }
                                  });

                                  XLSX.writeFile(wb, `XTOWN_ENTERPRISE_BACKUP_${new Date().toISOString().split('T')[0]}.xlsx`);
                                  
                                  toast.dismiss();
                                  toast.success("Excel backup generated successfully!");
                                } catch (e) {
                                  toast.dismiss();
                                  toast.error("Excel export failed: " + e.message);
                                }
                              }}
                              className="h-16 px-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-indigo-600/30 transition-all active:scale-95 group"
                            >


                               Download All Data
                               <Zap className="h-4 w-4 ml-3 group-hover:animate-bounce" />
                            </Button>
                            <div className="flex flex-col items-start px-4">
                               <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Last Backup</span>
                               <span className="text-xs font-bold text-foreground italic">Ready for Download</span>
                            </div>
                         </div>
                      </div>
                   </div>
                   <div className="bg-muted/30 p-8 flex items-center justify-center border-t border-border/50">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 italic flex items-center gap-2">
                         <ShieldCheck className="h-4 w-4" /> Your data is encrypted and stored in secure nodes.
                      </p>
                   </div>
                </Card>
              </section>
            )}


          </div>
        </div>
      </div>
      <SupportChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
};


export default Settings;


