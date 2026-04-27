import React, { useState, useEffect, useCallback } from 'react';
import { 
  Clock, 
  Plus, 
  Search, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Loader2,
  CalendarDays
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { apiFetch } from '@/services/api';
import { toast } from 'sonner';
import ShiftModal from './ShiftModal';
import ShiftAssignmentModal from './ShiftAssignmentModal';
import { UserPlus } from 'lucide-react';

const ShiftList = () => {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchShifts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/shift');
      setShifts(res?.data || res || []);
    } catch (error) {
      toast.error(error.message || 'Failed to sync shift schedules');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchShifts();
  }, [fetchShifts]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this shift? Employees won\'t be able to use it anymore.')) return;

    try {
      await apiFetch(`/shift/${id}`, { method: 'DELETE' });
      toast.success('Shift policy archived');
      fetchShifts();
    } catch (error) {
      toast.error(error.message || 'Failed to archive shift');
    }
  };

  const filtered = shifts.filter(s => 
    s.shiftName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-muted-foreground font-black tracking-widest uppercase text-xs italic">Loading Shift Schedules...</p>
      </div>

    );
  }

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white uppercase italic">Duty Shifts</h1>
          <p className="text-muted-foreground font-medium italic opacity-70 text-sm">Manage working hours and shift timings for employees.</p>
        </div>
        
        <ShiftModal onSuccess={fetchShifts} />
      </div>

      <div className="flex items-center gap-4 bg-white/50 backdrop-blur-md p-4 rounded-3xl border shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search Shift Name..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 border-none bg-slate-100/50 rounded-2xl font-bold"
          />
        </div>
      </div>

      <Card className="border-none shadow-2xl rounded-3xl overflow-hidden bg-white/70 backdrop-blur-xl">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent border-none font-black uppercase text-[10px] tracking-widest">
                <TableHead className="pl-8 py-6">Shift Name</TableHead>
                <TableHead className="py-6">Working Hours</TableHead>
                <TableHead className="py-6">Allowed Late Time</TableHead>
                <TableHead className="py-6 text-center">Shift Status</TableHead>
                <TableHead className="pr-8 py-6 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-20 text-muted-foreground italic font-medium uppercase tracking-tighter">
                    No shifts found.
                  </TableCell>
                </TableRow>

              ) : (
                filtered.map((shift) => (
                  <TableRow key={shift.id} className="group hover:bg-primary/5 transition-all border-slate-50">
                    <TableCell className="pl-8 py-6">
                       <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-white transition-colors border border-transparent group-hover:border-blue-100">
                             <Clock className="h-5 w-5" />
                          </div>
                          <span className="font-bold text-slate-800">{shift.shiftName}</span>
                       </div>
                    </TableCell>
                    <TableCell className="py-6 font-black text-xs text-slate-500 italic">
                       {shift.startTime} — {shift.endTime}
                    </TableCell>
                    <TableCell className="py-6">
                       <Badge variant="outline" className="rounded-md font-bold text-[10px] bg-slate-50 border-slate-100">
                          {shift.graceMinutes || 15} mins
                       </Badge>
                    </TableCell>
                    <TableCell className="py-6 text-center">
                       <span className="font-black text-slate-300 group-hover:text-blue-600 transition-colors">Active</span>
                    </TableCell>

                    <TableCell className="pr-8 py-6 text-right">
                       <div className="flex justify-end gap-2">
                         <ShiftAssignmentModal 
                            shift={shift}
                            trigger={
                              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-blue-50 border-transparent hover:border-blue-100 transition-all text-blue-600">
                                 <UserPlus className="h-4 w-4" />
                              </Button>
                            }
                         />
                         <ShiftModal 
                            shift={shift} 
                            onSuccess={fetchShifts}
                            trigger={
                              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-white border-transparent hover:border-slate-100 transition-all">
                                 <Edit2 className="h-4 w-4 text-slate-400 group-hover:text-primary transition-colors" />
                              </Button>
                            }
                         />
                         <Button 
                            onClick={() => handleDelete(shift.id)}
                            variant="ghost" 
                            size="icon" 
                            className="h-9 w-9 rounded-full hover:bg-white border-transparent hover:border-slate-100 transition-all"
                         >
                            <Trash2 className="h-4 w-4 text-slate-400 group-hover:text-red-500 transition-colors" />
                         </Button>
                       </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShiftList;
