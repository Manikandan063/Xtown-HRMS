import React, { useState } from 'react';
import { 
  Users, 
  CalendarCheck, 
  Wallet, 
  FileText, 
  Download,
  ShieldCheck,
  Eye,
  Loader2,
  Table as TableIcon
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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

const ReportsList = () => {
  const [previewData, setPreviewData] = useState(null);
  const [loading, setLoading] = useState(false);

  const reportTypes = [
    {
      id: 'employee',
      title: 'Employee List',
      description: 'Comprehensive directory of all employees.',
      icon: Users,
      color: 'blue',
      endpoint: '/employees',
      stats: 'Employee Data'
    },
    {
      id: 'attendance',
      title: 'Attendance Analytics',
      description: 'Detailed logs of clock-in/out patterns and daily presence metrics.',
      icon: CalendarCheck,
      color: 'emerald',
      endpoint: '/attendance/report',
      stats: 'Daily Sync'
    },
    {
      id: 'payroll',
      title: 'Compensation Analytics',
      description: 'Historical payout data, expenditures, and financial disbursement trails.',
      icon: Wallet,
      color: 'indigo',
      endpoint: '/payroll/company',
      stats: 'Financial'
    },
    {
      id: 'leave',
      title: 'Leave Report',
      description: 'Consolidated report of leave applications and balances.',
      icon: FileText,
      color: 'rose',
      endpoint: '/leave/request',
      stats: 'Workflow'
    }
  ];

  const handleGenerateReport = async (report) => {
    try {
      setLoading(true);
      toast.loading(`Preparing ${report.title}...`, { id: 'report' });
      
      const response = await apiFetch(report.endpoint);
      const data = response?.data || response || [];
      
      const rawRecords = Array.isArray(data) ? data : (data.list || []);
      
      const flatten = (obj, prefix = '') => {
        let result = {};
        for (let k in obj) {
          if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
            Object.assign(result, flatten(obj[k], `${prefix}${k}_`));
          } else {
            result[`${prefix}${k}`] = obj[k];
          }
        }
        return result;
      };

      const flattenedRecords = rawRecords.map(r => flatten(r));

      setPreviewData({
        title: report.title,
        id: report.id,
        data: flattenedRecords
      });
      
      toast.success(`${report.title} assembled and ready for review.`, { id: 'report' });
    } catch (err) {
      toast.error(`Failed to generate report: ${err.message}`, { id: 'report' });
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    if (!previewData?.data?.length) return;
    
    const headers = Object.keys(previewData.data[0]);
    const csvRows = [
      headers.join(','),
      ...previewData.data.map(row => headers.map(header => JSON.stringify(row[header] || '')).join(','))
    ];
    
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${previewData.id}_report_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Report downloaded successfully.');
  };

  return (
    <div className="space-y-10 animate-in slide-in-from-bottom-8 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tighter text-slate-900 uppercase italic">Reports Hub</h1>
          <p className="text-muted-foreground font-bold text-xs uppercase tracking-widest opacity-70 italic">Export accurate reports and history logs.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {reportTypes.map((report) => (
          <Card key={report.id} className="border-none shadow-2xl rounded-[2.5rem] bg-white group hover:scale-[1.02] transition-all duration-500 overflow-hidden ring-1 ring-slate-100">
            <CardContent className="p-10">
              <div className="flex items-start justify-between mb-8">
                  <div className={`p-5 rounded-3xl bg-${report.color}-50 text-${report.color}-600 group-hover:rotate-12 transition-all duration-500`}>
                    <report.icon className="h-10 w-10" />
                  </div>
                  <Badge className={`bg-${report.color}-500/10 text-${report.color}-600 border-none font-black text-[9px] uppercase tracking-widest px-4`}>
                    {report.stats}
                  </Badge>
              </div>

              <div className="space-y-4 mb-8">
                  <h3 className="text-2xl font-black tracking-tighter italic uppercase text-slate-800">{report.title}</h3>
                  <p className="text-slate-400 font-medium text-sm leading-relaxed">{report.description}</p>
              </div>

              <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                  <div className="flex gap-2">
                    <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400">CSV</div>
                    <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400">RAW</div>
                  </div>
                  <Button 
                    onClick={() => handleGenerateReport(report)}
                    disabled={loading}
                    className="h-12 px-8 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black uppercase text-[10px] tracking-widest flex gap-3 group/btn"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
                    Preview & Export
                  </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* REPORT PREVIEW MODAL */}
      <Dialog open={!!previewData} onOpenChange={() => setPreviewData(null)}>
        <DialogContent className="sm:max-w-[1000px] h-[80vh] flex flex-col p-0 border-none rounded-[3rem] overflow-hidden shadow-2xl">
          <DialogHeader className="p-8 bg-slate-900 text-white shrink-0">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center text-white">
                      <TableIcon className="h-6 w-6" />
                   </div>
                   <div>
                      <DialogTitle className="text-2xl font-black italic tracking-tighter uppercase">{previewData?.title} Preview</DialogTitle>
                      <p className="text-white/40 text-[10px] uppercase font-bold tracking-[0.2em] mt-1">Found {previewData?.data?.length || 0} records</p>
                   </div>
                </div>
                <Button 
                  onClick={downloadCSV}
                  className="bg-emerald-500 hover:bg-emerald-600 h-12 rounded-xl font-black uppercase text-[10px] tracking-widest gap-2"
                >
                   <Download className="h-4 w-4" /> Download Export (.CSV)
                </Button>
             </div>
          </DialogHeader>
          
          <div className="flex-1 overflow-auto p-8">
             <Table>
                <TableHeader>
                   <TableRow className="border-slate-100 h-14 hover:bg-transparent">
                      {previewData?.data?.[0] && Object.keys(previewData.data[0]).slice(0, 6).map(key => (
                         <TableHead key={key} className="font-black uppercase text-[10px] tracking-widest text-slate-400">{key}</TableHead>
                      ))}
                   </TableRow>
                </TableHeader>
                <TableBody>
                   {previewData?.data?.slice(0, 20).map((row, i) => (
                      <TableRow key={i} className="border-slate-50 h-14 hover:bg-slate-50/50 transition-colors">
                         {Object.keys(row).slice(0, 6).map(key => (
                            <TableCell key={key} className="text-xs font-bold text-slate-700 uppercase">
                               {String(row[key] || 'N/A')}
                            </TableCell>
                         ))}
                      </TableRow>
                   ))}
                   {(!previewData?.data || previewData.data.length === 0) && (
                     <TableRow>
                        <TableCell colSpan={6} className="text-center py-20 italic text-slate-300">No data found in current cluster.</TableCell>
                     </TableRow>
                   )}
                </TableBody>
             </Table>
             {previewData?.data?.length > 20 && (
               <div className="py-4 text-center border-t border-slate-50">
                  <p className="text-[10px] font-black uppercase text-slate-300">Showing first 20 records. Download full report for complete audit.</p>
               </div>
             )}
          </div>
        </DialogContent>
      </Dialog>

      <Card className="border-none shadow-2xl bg-indigo-600 p-12 rounded-[3.5rem] relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:opacity-20 transition-opacity">
            <ShieldCheck className="h-64 w-64 text-white" />
         </div>
         <div className="relative z-10 space-y-8">
            <div className="space-y-3">
               <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
                  <span className="text-[10px] font-black text-white/50 uppercase tracking-[0.3em]">Compliance Protocol</span>
               </div>
               <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">Automated Report History</h2>
               <p className="text-indigo-100/60 max-w-xl font-medium leading-relaxed italic">System automatically generates records for institutional compliance. All exports are timestamped and verified.</p>
            </div>
         </div>
      </Card>
    </div>
  );
};

export default ReportsList;
