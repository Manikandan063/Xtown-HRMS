import React, { useState, useEffect } from 'react';
import { Monitor, ShieldCheck, Clock, Loader2, Layers } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { apiFetch } from '@/services/api';
import { toast } from 'sonner';

const MyAssets = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/dashboard/summary');
      const data = res?.data?.personalData?.assets || res?.personalData?.assets || [];
      setAssets(data);
    } catch (err) {
      toast.error("Failed to synchronize asset records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-12 w-12 text-emerald-600 animate-spin" />
        <p className="text-muted-foreground font-black tracking-widest uppercase text-xs">Scanning Asset Registry...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tighter text-slate-800 flex items-center gap-3 uppercase italic">
            <div className="h-12 w-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-2xl shadow-emerald-200">
              <Monitor className="h-7 w-7" />
            </div>
            My Hardware & Assets
          </h1>
          <p className="text-muted-foreground font-bold italic text-sm tracking-tight opacity-70 pl-1">
            Personal inventory and equipment assigned to your identity.
          </p>
        </div>
      </div>

      <Card className="border-none shadow-2xl rounded-[2.5rem] bg-white p-10">
        <div className="space-y-8">
           <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-emerald-50 rounded-2xl">
                <ShieldCheck className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="flex flex-col">
                <h3 className="text-xl font-black italic tracking-tighter uppercase leading-none">Terminal Inventory</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Verified Corporate Equipment</p>
              </div>
           </div>

           {assets.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 {assets.map((asset, i) => (
                    <div key={i} className="p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 flex items-center justify-between group hover:border-emerald-200 hover:bg-white hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500">
                       <div className="flex items-center gap-6">
                          <div className="h-20 w-20 rounded-3xl bg-white flex items-center justify-center text-emerald-600 shadow-xl shadow-emerald-500/5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                             <Monitor className="h-10 w-10" />
                          </div>
                          <div className="space-y-1">
                             <p className="text-lg font-black uppercase tracking-tight text-slate-800">{asset.assetName}</p>
                             <div className="flex items-center gap-3">
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{asset.assetCategory || 'General Asset'}</span>
                                <span className="h-1 w-1 rounded-full bg-slate-200" />
                                <span className="text-[10px] text-emerald-600 font-mono font-black">{asset.serialNumber || 'SN: N/A'}</span>
                             </div>
                             <div className="flex items-center gap-2 mt-2">
                                <Clock className="h-3 w-3 text-slate-400" />
                                <p className="text-[10px] text-slate-600 font-black italic">Rcvd: {asset.assignedDate || 'N/A'}</p>
                             </div>
                          </div>
                       </div>
                       <div className="text-right flex flex-col items-end gap-3">
                          <div className="px-4 py-1.5 rounded-full bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-200">
                             {asset.status || 'ASSIGNED'}
                          </div>
                          <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                             <Layers className="h-5 w-5 text-slate-400" />
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
           ) : (
              <div className="text-center py-32 opacity-20 italic text-sm font-medium flex flex-col items-center gap-6 border-2 border-dashed border-slate-100 rounded-[3rem]">
                 <div className="p-8 bg-slate-100 rounded-full">
                    <Monitor className="h-24 w-24" />
                 </div>
                 <div className="space-y-1">
                    <p className="text-xl font-black uppercase tracking-[0.2em]">No Assets Found</p>
                    <p className="text-xs font-bold tracking-widest">Your terminal registry is currently empty.</p>
                 </div>
              </div>
           )}
        </div>
      </Card>
    </div>
  );
};

export default MyAssets;
