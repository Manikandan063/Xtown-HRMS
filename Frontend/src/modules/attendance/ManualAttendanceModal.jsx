import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { apiFetch } from '@/services/api';
import { toast } from 'sonner';
import { UserPlus, Loader2, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * ManualAttendanceModal allows administrators to manually record attendance
 * for employees when automated systems (biometric/facial recognition) fail.
 */
const ManualAttendanceModal = ({ onSuccess, editMode = false, initialLog = null, trigger = null }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    employeeId: '',
    date: new Date().toISOString().split('T')[0],
    checkInTime: '09:00',
    checkOutTime: '', // Default to empty
    status: 'PRESENT',
    reason: 'Face recognition issue'
  });

  useEffect(() => {
    if (open) {
      if (editMode && initialLog) {
        // Ensure date is in YYYY-MM-DD format
        const recordDate = initialLog.date ? new Date(initialLog.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
        
        // Helper to extract HH:mm in local time
        const getLocalTimeStr = (dateStr) => {
          if (!dateStr) return '';
          const d = new Date(dateStr);
          if (isNaN(d.getTime())) return '';
          return d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
        };

        setFormData({
          employeeId: initialLog.employeeId,
          date: recordDate,
          checkInTime: getLocalTimeStr(initialLog.firstIn) || '09:00',
          checkOutTime: getLocalTimeStr(initialLog.lastOut),
          status: initialLog.status,
          reason: initialLog.reason || 'Record Correction'
        });
      }
      fetchEmployees();
    }
  }, [open, editMode, initialLog]);

  const fetchEmployees = async () => {
    try {
      const res = await apiFetch('/employees');
      const data = res.data || res || [];
      setEmployees(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Failed to load employees for manual entry");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.employeeId) return toast.error("Please select an employee starting node");

    try {
      setLoading(true);
      const url = editMode ? `/attendance/${initialLog.id}` : '/attendance/manual-attendance';
      const method = editMode ? 'PUT' : 'POST';
      
      const payload = {
        ...formData,
        // Only construct ISO strings if the time is actually provided
        checkInTime: (!['ABSENT', 'LEAVE', 'HOLIDAY'].includes(formData.status) && formData.checkInTime) 
          ? new Date(`${formData.date}T${formData.checkInTime}:00`).toISOString() 
          : null,
        checkOutTime: (!['ABSENT', 'LEAVE', 'HOLIDAY'].includes(formData.status) && formData.checkOutTime) 
          ? new Date(`${formData.date}T${formData.checkOutTime}:00`).toISOString() 
          : null
      };


      await apiFetch(url, {
        method,
        body: JSON.stringify(payload)
      });
      toast.success(editMode ? "Attendance node synchronized." : "Biometric override complete. Attendance recorded.");
      setOpen(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(error.message || "Manual override failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="rounded-2xl h-11 px-6 shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 font-black uppercase text-[10px] tracking-widest gap-2">
             <UserPlus className="h-4 w-4" /> Manual Entry
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[650px] rounded-[2rem] bg-card border-none shadow-2xl p-8 outline-none">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black italic tracking-tighter uppercase text-primary">
            {editMode ? 'Edit Attendance' : 'Add Manual Attendance'}
          </DialogTitle>
          <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] italic pt-1 opacity-60">
            Administrative correction for attendance record.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-4">
            {/* Employee Selector */}
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1">Select Employee</Label>
              <Select 
                value={formData.employeeId} 
                onValueChange={(val) => setFormData({...formData, employeeId: val})}
              >
                <SelectTrigger className="h-12 rounded-xl bg-muted border-none ring-offset-background focus:ring-1 focus:ring-primary shadow-inner">
                  <SelectValue placeholder="Search employee..." />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border shadow-2xl bg-card">
                  {employees.map(emp => (
                    <SelectItem key={emp.id} value={emp.id} className="font-bold py-3 hover:bg-muted text-foreground cursor-pointer transition-colors">
                      {emp.firstName} {emp.lastName} <span className="text-muted-foreground ml-2">#{emp.employeeCode}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Date Selector */}
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1">Date</Label>
                <Input 
                  type="date"
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                  className="h-12 rounded-xl bg-muted border-none ring-offset-background focus:ring-1 focus:ring-primary shadow-inner font-bold text-foreground"
                />
              </div>
              
              {/* Status Selector */}
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(val) => setFormData({...formData, status: val})}
                >
                  <SelectTrigger className="h-12 rounded-xl bg-muted border-none ring-offset-background focus:ring-1 focus:ring-primary shadow-inner">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border shadow-2xl bg-card font-bold">
                    <SelectItem value="PRESENT" className="text-emerald-500 font-black">PRESENT</SelectItem>
                    <SelectItem value="HALF_DAY" className="text-amber-500 font-black">HALF DAY</SelectItem>
                    <SelectItem value="ABSENT" className="text-rose-500 font-black">ABSENT</SelectItem>
                    <SelectItem value="LEAVE" className="text-blue-500 font-black">LEAVE</SelectItem>
                    <SelectItem value="HOLIDAY" className="text-purple-500 font-black">HOLIDAY</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* In/Out Times (Conditional) */}
            {!['ABSENT', 'LEAVE', 'HOLIDAY'].includes(formData.status) && (
              <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1">In Time</Label>
                  <Input 
                    type="time"
                    value={formData.checkInTime}
                    onChange={e => setFormData({...formData, checkInTime: e.target.value})}
                    className="h-12 rounded-xl bg-muted border-none ring-offset-background focus:ring-1 focus:ring-primary shadow-inner font-black text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1">Out Time</Label>
                  <Input 
                    type="time"
                    value={formData.checkOutTime}
                    onChange={e => setFormData({...formData, checkOutTime: e.target.value})}
                    className="h-12 rounded-xl bg-muted border-none ring-offset-background focus:ring-1 focus:ring-primary shadow-inner font-black text-foreground"
                  />
                </div>
              </div>
            )}

            {/* Justification */}
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1">Reason</Label>
              <Input 
                value={formData.reason}
                onChange={e => setFormData({...formData, reason: e.target.value})}
                placeholder="Reason for manual entry..."
                className="h-12 rounded-xl bg-muted border-none ring-offset-background focus:ring-1 focus:ring-primary shadow-inner font-bold placeholder:font-normal text-foreground"
              />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full h-12 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest shadow-lg shadow-primary/20 gap-2 transition-all active:scale-95"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calendar className="h-4 w-4" />}
              {loading ? 'Saving...' : 'Save Attendance'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ManualAttendanceModal;
