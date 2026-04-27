import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  Cpu, 
  Plus, 
  Search, 
  Activity, 
  Wifi, 
  Link2, 
  Unlink2, 
  RefreshCw, 
  Terminal, 
  ShieldCheck, 
  MoreVertical 
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiFetch } from '@/services/api';
import { toast } from 'sonner';

/**
 * Biometric Device Management (ZKTeco)
 * Connects to Backend's device/zkConnection logic: ip, port, sync status
 */
const DeviceList = () => {
  const { isHR } = useAuth();
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTerminal, setNewTerminal] = useState({ name: '', ip: '', port: '4370', location: '' });

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/devices');
      if (res.success) setDevices(res.data);
    } catch (error) {
      toast.error('Failed to load terminals');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchDevices();
  }, []);

  const handleAddTerminal = async (e) => {
    e.preventDefault();
    try {
      toast.loading('Registering terminal...', { id: 'add' });
      await apiFetch('/devices', {
        method: 'POST',
        body: JSON.stringify(newTerminal)
      });
      toast.success('Terminal added successfully!', { id: 'add' });
      setIsModalOpen(false);
      setNewTerminal({ name: '', ip: '', port: '4370', location: '' });
      fetchDevices();
    } catch (error) {
      toast.error(error.message || 'Failed to add terminal', { id: 'add' });
    }
  };

  const handleDeleteTerminal = async (id) => {
    if (!window.confirm('Are you sure you want to remove this terminal?')) return;
    try {
      toast.loading('Removing hardware configuration...', { id: 'del' });
      await apiFetch(`/devices/${id}`, { method: 'DELETE' });
      toast.success('Terminal removed', { id: 'del' });
      fetchDevices();
    } catch (error) {
      toast.error('Failed to delete', { id: 'del' });
    }
  };

  const handleSync = async (device) => {
    try {
      toast.loading(`Syncing ${device.name}...`, { id: 'sync' });
      const res = await apiFetch('/attendance/sync-zk', {
        method: 'POST',
        body: JSON.stringify({ ip: device.ip, port: device.port })
      });
      toast.success(res.message || 'Sync complete!', { id: 'sync' });
    } catch (error) {
      toast.error(error.message || 'Sync failed', { id: 'sync' });
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-top-4 duration-600">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-800 flex items-center gap-2 pr-2">
             <Cpu className="h-8 w-8 text-slate-800" /> Biometric Hardware
          </h1>
          <p className="text-muted-foreground font-medium italic">Configure and manage ZKTeco biometric communication via TCP/IP.</p>
        </div>
        
        {isHR && (
          <div className="flex gap-4">
             <Button 
                onClick={() => setIsModalOpen(true)}
                className="h-11 px-8 rounded-xl shadow-lg shadow-slate-500/20 font-bold bg-slate-900 hover:bg-black transition-all flex gap-3 text-white"
             >
                <Plus className="h-5 w-5" /> Add Terminal
             </Button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-pulse">
          {[1, 2].map(i => <div key={i} className="h-64 bg-slate-100 rounded-3xl" />)}
        </div>
      ) : devices.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
           <Terminal className="h-16 w-16 text-slate-300 mb-4" />
           <p className="text-slate-400 font-bold">No hardware terminals configured yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {devices.map((dev) => (
            <Card key={dev.id} className="border-none shadow-2xl shadow-slate-100 dark:shadow-none rounded-3xl overflow-hidden bg-card/60 backdrop-blur-md group hover:border-r-8 hover:border-primary/20 transition-all duration-300">
               <CardHeader className="flex flex-row justify-between items-center bg-slate-100/30 border-b border-white/10 px-8 py-6">
                  <div className="flex items-center gap-4">
                     <div className={`h-12 w-12 rounded-2xl bg-white flex items-center justify-center shadow-lg shadow-slate-200/50`}>
                        <Terminal className="h-7 w-7 text-slate-700" />
                     </div>
                     <div className="space-y-0.5">
                        <h4 className="text-lg font-bold">{dev.name}</h4>
                        <Badge variant="secondary" className="rounded-md font-bold text-[9px] uppercase tracking-widest px-2 pr-1 h-5 shadow-inner">SN: {dev.serialNumber || 'N/A'}</Badge>
                     </div>
                  </div>
                  <div className="flex gap-2">
                     <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDeleteTerminal(dev.id)}
                      className="h-9 w-9 rounded-full bg-white scale-90 hover:bg-red-50 hover:text-red-500 transition-all"
                     >
                        <Unlink2 className="h-4 w-4" />
                     </Button>
                  </div>
               </CardHeader>
               <CardContent className="p-8 space-y-6">
                  <div className="grid grid-cols-2 gap-6 bg-slate-50/50 p-4 rounded-2xl shadow-inner border border-white/20">
                     <div className="space-y-1">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1.5 opacity-70 italic pl-1"><Wifi className="h-3 w-3" /> Device IP</span>
                        <p className="text-xl font-black text-slate-800">{dev.ip}</p>
                     </div>
                     <div className="space-y-1 text-right">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1.5 opacity-70 italic justify-end pr-1"><Activity className="h-3 w-3" /> Port</span>
                        <p className="text-xl font-black text-slate-800">{dev.port}</p>
                     </div>
                  </div>
                  
                  <div className="flex justify-between items-center pt-2 px-1">
                     <div className="flex items-center gap-3">
                        <div className={`h-2.5 w-2.5 rounded-full ${dev.status === 'ACTIVE' ? 'bg-green-500 animate-pulse shadow-green-200 shadow-lg' : 'bg-orange-500 shadow-orange-200 shadow-lg'}`} />
                        <span className={`text-sm font-bold ${dev.status === 'ACTIVE' ? 'text-green-600' : 'text-orange-600'}`}>{dev.status}</span>
                     </div>
                     <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleSync(dev)}
                      className="rounded-xl font-bold text-xs h-8 px-4 border-slate-200 hover:bg-slate-100"
                     >
                       <RefreshCw className="h-3 w-3 mr-2" /> Sync Now
                     </Button>
                  </div>
               </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Terminal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 bg-slate-50 border-b border-slate-100">
              <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Add Terminal</h2>
              <p className="text-xs font-bold text-slate-400 italic">Configure a new ZKTeco biometric device.</p>
            </div>
            
            <form onSubmit={handleAddTerminal} className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Terminal Name</label>
                  <input 
                    required
                    value={newTerminal.name}
                    onChange={(e) => setNewTerminal({...newTerminal, name: e.target.value})}
                    placeholder="e.g. Main Gate Face Reader"
                    className="w-full h-12 bg-slate-50 border-none rounded-2xl px-5 text-sm font-bold focus:ring-2 focus:ring-slate-900 outline-none transition-all"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">IP Address</label>
                    <input 
                      required
                      value={newTerminal.ip}
                      onChange={(e) => setNewTerminal({...newTerminal, ip: e.target.value})}
                      placeholder="192.168.1.201"
                      className="w-full h-12 bg-slate-50 border-none rounded-2xl px-5 text-sm font-bold focus:ring-2 focus:ring-slate-900 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Port</label>
                    <input 
                      required
                      value={newTerminal.port}
                      onChange={(e) => setNewTerminal({...newTerminal, port: e.target.value})}
                      placeholder="4370"
                      className="w-full h-12 bg-slate-50 border-none rounded-2xl px-5 text-sm font-bold focus:ring-2 focus:ring-slate-900 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Location</label>
                  <input 
                    value={newTerminal.location}
                    onChange={(e) => setNewTerminal({...newTerminal, location: e.target.value})}
                    placeholder="Ground Floor Lobby"
                    className="w-full h-12 bg-slate-50 border-none rounded-2xl px-5 text-sm font-bold focus:ring-2 focus:ring-slate-900 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 h-12 rounded-2xl font-bold"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 h-12 rounded-2xl font-bold bg-slate-900 hover:bg-black text-white"
                >
                  Save Terminal
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeviceList;
