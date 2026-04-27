import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  UserMinus, 
  Search, 
  MoreVertical, 
  CheckCircle, 
  XSquare, 
  Clock,
  Eye,
  CheckCircle2,
  AlertCircle,
  FileText
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import resignationService from '@/services/resignationService';
import { toast } from 'sonner';

const ResignationList = () => {
  const { isAdmin } = useAuth();
  const [resignations, setResignations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResignation, setSelectedResignation] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ 
    noticePeriod: '', 
    lastWorkingDate: '',
    finalSettlementAmount: 0,
    settlementStatus: 'pending',
    settlementBreakdown: {
      basicSalary: 0,
      hra: 0,
      leaveEncashment: 0,
      bonus: 0,
      professionalTax: 0,
      tds: 0,
      otherDeductions: 0
    }
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchResignations();
  }, []);

  const fetchResignations = async () => {
    try {
      const res = await resignationService.getResignations();
      setResignations(res.data);
    } catch (error) {
      toast.error('Failed to fetch resignations');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await resignationService.updateStatus(id, status);
      toast.success(`Resignation ${status.toLowerCase()} successfully`);
      fetchResignations();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleUpdateChecklist = async (itemId, status) => {
    try {
      await resignationService.updateChecklistItem(itemId, { status });
      toast.success('Checklist updated');
      fetchResignations();
      // Update selected resignation in modal if open
      if (selectedResignation) {
        const updatedChecklist = selectedResignation.checklistItems.map(item => 
          item.id === itemId ? { ...item, status } : item
        );
        setSelectedResignation({ ...selectedResignation, checklistItems: updatedChecklist });
      }
    } catch (error) {
      toast.error('Failed to update checklist');
    }
  };

  const handleCompleteExit = async (id) => {
    try {
      await resignationService.completeExit(id);
      toast.success('Employee exit completed and login disabled');
      fetchResignations();
      setIsDetailsOpen(false);
    } catch (error) {
      toast.error(error.message || 'Failed to complete exit');
    }
  };

  const handleUpdateResignation = async () => {
    setSaving(true);
    try {
      const updatedData = {
        ...editData,
        // Auto-calculate total from breakdown if it was changed
        finalSettlementAmount: 
          Number(editData.settlementBreakdown.basicSalary || 0) + 
          Number(editData.settlementBreakdown.hra || 0) + 
          Number(editData.settlementBreakdown.leaveEncashment || 0) + 
          Number(editData.settlementBreakdown.bonus || 0) - 
          Number(editData.settlementBreakdown.professionalTax || 0) - 
          Number(editData.settlementBreakdown.tds || 0) - 
          Number(editData.settlementBreakdown.otherDeductions || 0)
      };
      await resignationService.updateResignation(selectedResignation.id, updatedData);
      toast.success('Resignation terms updated');
      fetchResignations();
      setIsEditing(false);
      setSelectedResignation({ ...selectedResignation, ...updatedData });
    } catch (error) {
      toast.error('Failed to update resignation details');
    } finally {
      setSaving(false);
    }
  };

  const handleRecoverAsset = async (assetId) => {
    try {
      await resignationService.recoverAsset(assetId);
      toast.success('Asset marked as recovered');
      fetchResignations(); // Refresh everything
      
      // Also update selected resignation local state to reflect changes
      if (selectedResignation) {
        const updatedAssets = selectedResignation.employee.assets.map(a => 
          a.id === assetId ? { ...a, status: 'RETURNED' } : a
        );
        setSelectedResignation({
          ...selectedResignation,
          employee: { ...selectedResignation.employee, assets: updatedAssets }
        });
      }
    } catch (error) {
      toast.error('Failed to recover asset');
    }
  };

  const handleCancelResignation = async (id) => {
    if (!window.confirm('Are you sure you want to CANCEL this resignation? This will revert the employee to ACTIVE status.')) return;
    
    setSaving(true);
    try {
      await resignationService.cancelResignation(id);
      toast.success('Resignation cancelled successfully');
      setIsDetailsOpen(false);
      fetchResignations();
    } catch (error) {
      toast.error('Failed to cancel resignation');
    } finally {
      setSaving(false);
    }
  };

  const filteredResignations = (resignations || []).filter(res => {
    const fullName = `${res.employee?.firstName || ''} ${res.employee?.lastName || ''}`.toLowerCase();
    const employeeCode = (res.employee?.employeeCode || '').toLowerCase();
    return fullName.includes(searchTerm.toLowerCase()) || employeeCode.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center justify-between px-2">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-slate-800 dark:text-slate-100">Offboarding & Resignations</h1>
          <p className="text-muted-foreground font-medium italic dark:text-slate-400">Manage employee exits, approvals and checklists.</p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search employee..." 
            className="pl-10 h-11 bg-white dark:bg-slate-800 border-none shadow-sm rounded-xl dark:text-slate-100"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card className="border-none shadow-xl shadow-slate-200/50 dark:shadow-none rounded-2xl overflow-hidden bg-white/70 dark:bg-slate-900/70 backdrop-blur-md">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-bold py-6 pl-8 dark:text-slate-300">Employee</TableHead>
                <TableHead className="font-bold py-6 dark:text-slate-300">Reason</TableHead>
                <TableHead className="font-bold py-6 dark:text-slate-300">Last Working Day</TableHead>
                <TableHead className="font-bold py-6 text-center dark:text-slate-300">Status</TableHead>
                <TableHead className="font-bold py-6 text-right pr-8 dark:text-slate-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-20 text-slate-400 font-medium">Loading resignations...</TableCell></TableRow>
              ) : filteredResignations.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-20 text-slate-400 dark:text-slate-500 font-medium">No resignation requests found.</TableCell></TableRow>
              ) : filteredResignations.map((res) => (
                <TableRow key={res.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 group transition-all">
                  <TableCell className="py-6 pl-8">
                    <div className="font-bold text-slate-800 dark:text-slate-200">
                      {res.employee?.firstName || 'Unknown'} {res.employee?.lastName || 'Employee'}
                    </div>
                    <div className="flex flex-col gap-0.5 mt-1">
                      <div className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                        {res.employee?.employeeCode || 'N/A'}
                      </div>
                      <div className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase">
                        {res.employee?.designation?.name || 'No Designation'} • {res.employee?.department?.name || 'No Dept'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-6 text-slate-600 dark:text-slate-400 max-w-xs truncate font-medium">{res.reason}</TableCell>
                  <TableCell className="py-6 font-bold text-red-500">
                    {res.lastWorkingDate ? new Date(res.lastWorkingDate).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell className="text-center py-6">
                    <Badge className={`rounded-full px-4 py-1 border-none font-bold ${
                      res.status === 'approved' ? 'bg-green-100 text-green-700' : 
                      res.status === 'pending' ? 'bg-amber-100 text-amber-700' : 
                      res.status === 'completed' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                    }`}>
                       {res.status?.toUpperCase() || 'PENDING'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right py-6 pr-8">
                     <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-full text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                           onClick={() => {
                            console.log("Viewing resignation:", res.id);
                            setSelectedResignation(res);
                            setIsEditing(false); // Reset editing state
                            setEditData({ 
                              noticePeriod: res.noticePeriod || 30, 
                              lastWorkingDate: res.lastWorkingDate || '',
                              finalSettlementAmount: res.finalSettlementAmount || 0,
                              settlementStatus: res.settlementStatus || 'pending',
                              settlementBreakdown: res.settlementBreakdown || {
                                basicSalary: 0, hra: 0, leaveEncashment: 0, bonus: 0,
                                professionalTax: 0, tds: 0, otherDeductions: 0
                              }
                            });
                            setIsDetailsOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-slate-400">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44 rounded-xl shadow-2xl border-none">
                             {res.status === 'pending' && (
                               <>
                                 <DropdownMenuItem className="gap-2 py-3 text-green-600 font-bold" onClick={() => handleUpdateStatus(res.id, 'approved')}>
                                    <CheckCircle className="h-4 w-4" /> Approve
                                 </DropdownMenuItem>
                                 <DropdownMenuItem className="gap-2 py-3 text-red-600 font-bold" onClick={() => handleUpdateStatus(res.id, 'rejected')}>
                                    <XSquare className="h-4 w-4" /> Reject
                                 </DropdownMenuItem>
                               </>
                             )}
                             <DropdownMenuItem 
                               className="gap-2 py-3 text-slate-600 font-bold" 
                               onSelect={(e) => {
                                 e.preventDefault();
                                 console.log("Viewing resignation from menu:", res.id);
                                 setSelectedResignation(res);
                                 setIsEditing(false); // Reset editing state
                                 setEditData({ 
                                   noticePeriod: res.noticePeriod || 30, 
                                   lastWorkingDate: res.lastWorkingDate || '',
                                   finalSettlementAmount: res.finalSettlementAmount || 0,
                                   settlementStatus: res.settlementStatus || 'pending',
                                   settlementBreakdown: res.settlementBreakdown || {
                                     basicSalary: 0, hra: 0, leaveEncashment: 0, bonus: 0,
                                     professionalTax: 0, tds: 0, otherDeductions: 0
                                   }
                                 });
                                 setIsDetailsOpen(true);
                               }}
                             >
                                <FileText className="h-4 w-4" /> View Details
                             </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                     </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Details & Checklist Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl rounded-3xl border-none shadow-2xl p-0 overflow-hidden">
          {selectedResignation && (
            <>
              <DialogHeader className="bg-slate-900 text-white p-8">
                <div className="flex justify-between items-start">
                  <div>
                    <DialogTitle className="text-2xl font-black">Resignation Details</DialogTitle>
                    <div className="flex flex-col mt-1">
                       <p className="text-white font-bold">
                        {selectedResignation.employee?.firstName || 'Unknown'} {selectedResignation.employee?.lastName || 'Employee'}
                      </p>
                      <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">
                        {selectedResignation.employee?.employeeCode || 'N/A'} • {selectedResignation.employee?.designation?.name || 'Staff'} • {selectedResignation.employee?.department?.name || 'General'}
                      </p>
                    </div>
                  </div>
                   <Badge className="bg-white/10 hover:bg-white/20 text-white border-none font-bold px-4 py-1 rounded-full">
                    {selectedResignation.status?.toUpperCase() || 'PENDING'}
                  </Badge>
                </div>
              </DialogHeader>

              <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="space-y-1">
                    <Label className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Resignation Date</Label>
                    <p className="font-bold text-slate-700">
                      {selectedResignation.resignationDate ? new Date(selectedResignation.resignationDate).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Notice Period (Days)</Label>
                    {isEditing ? (
                      <Input 
                        type="number"
                        className="h-8 rounded-lg"
                        value={editData.noticePeriod}
                        onChange={(e) => setEditData({ ...editData, noticePeriod: e.target.value })}
                      />
                    ) : (
                      <p className="font-bold text-slate-700">{selectedResignation.noticePeriod || '30'}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Last Working Day</Label>
                    {isEditing ? (
                      <Input 
                        type="date"
                        className="h-8 rounded-lg"
                        value={editData.lastWorkingDate}
                        onChange={(e) => setEditData({ ...editData, lastWorkingDate: e.target.value })}
                      />
                    ) : (
                      <p className="font-bold text-red-500">
                        {selectedResignation.lastWorkingDate ? new Date(selectedResignation.lastWorkingDate).toLocaleDateString() : 'N/A'}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Reason</Label>
                  <p className="font-medium text-slate-600 italic">"{selectedResignation.reason}"</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6 border-y border-slate-100 dark:border-slate-800">
                   <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="h-5 w-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                        </div>
                        <h4 className="text-xs font-black uppercase text-slate-800 dark:text-slate-200">Financial Settlement</h4>
                      </div>
                      
                      <div className="space-y-3 pl-7">
                        {isEditing ? (
                          <div className="space-y-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <Label className="text-[9px] text-slate-400 font-bold uppercase">Basic Salary</Label>
                                <Input type="number" className="h-8 text-xs" value={editData.settlementBreakdown.basicSalary} onChange={(e) => setEditData({...editData, settlementBreakdown: {...editData.settlementBreakdown, basicSalary: Number(e.target.value) || 0}})} />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-[9px] text-slate-400 font-bold uppercase">HRA / Allowances</Label>
                                <Input type="number" className="h-8 text-xs" value={editData.settlementBreakdown.hra} onChange={(e) => setEditData({...editData, settlementBreakdown: {...editData.settlementBreakdown, hra: Number(e.target.value) || 0}})} />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-[9px] text-slate-400 font-bold uppercase">Leave Encashment</Label>
                                <Input type="number" className="h-8 text-xs" value={editData.settlementBreakdown.leaveEncashment} onChange={(e) => setEditData({...editData, settlementBreakdown: {...editData.settlementBreakdown, leaveEncashment: Number(e.target.value) || 0}})} />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-[9px] text-slate-400 font-bold uppercase">Tax / TDS (-)</Label>
                                <Input type="number" className="h-8 text-xs text-red-500" value={editData.settlementBreakdown.tds} onChange={(e) => setEditData({...editData, settlementBreakdown: {...editData.settlementBreakdown, tds: Number(e.target.value) || 0}})} />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-[9px] text-slate-400 font-bold uppercase">Other Deductions (-)</Label>
                                <Input type="number" className="h-8 text-xs text-red-500" value={editData.settlementBreakdown.otherDeductions} onChange={(e) => setEditData({...editData, settlementBreakdown: {...editData.settlementBreakdown, otherDeductions: Number(e.target.value)}})} />
                              </div>
                            </div>
                            <div className="pt-2 border-t border-slate-200 dark:border-slate-600">
                              <Label className="text-[10px] text-slate-500 font-black">CALCULATED NET PAYABLE</Label>
                              <p className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                                ₹{(editData.settlementBreakdown.basicSalary + editData.settlementBreakdown.leaveEncashment - editData.settlementBreakdown.tds - editData.settlementBreakdown.otherDeductions).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="space-y-2 mb-4">
                              <div className="flex justify-between text-[11px]">
                                <span className="text-slate-500">Salary & Allowances</span>
                                <span className="font-bold text-slate-700 dark:text-slate-300">₹{(selectedResignation.settlementBreakdown?.basicSalary || 0).toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between text-[11px]">
                                <span className="text-slate-500">Leave Encashment</span>
                                <span className="font-bold text-slate-700 dark:text-slate-300">₹{(selectedResignation.settlementBreakdown?.leaveEncashment || 0).toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between text-[11px] text-red-500">
                                <span>Total Deductions</span>
                                <span className="font-bold">-₹{((selectedResignation.settlementBreakdown?.tds || 0) + (selectedResignation.settlementBreakdown?.otherDeductions || 0)).toLocaleString()}</span>
                              </div>
                            </div>
                            
                            <div className="space-y-1">
                              <Label className="text-[10px] text-slate-400 font-bold uppercase">Net F&F Payable</Label>
                              <p className="font-black text-indigo-600 dark:text-indigo-400 text-2xl">
                                ₹{(selectedResignation.finalSettlementAmount || '0.00').toLocaleString()}
                              </p>
                            </div>
                          </>
                        )}
                        
                        <div className="space-y-1 mt-4">
                          <Label className="text-[10px] text-slate-400 font-bold uppercase">Payment Status</Label>
                          {isEditing ? (
                            <select 
                              className="w-full h-8 rounded-lg bg-slate-50 dark:bg-slate-800 border-none text-xs font-bold px-2"
                              value={editData.settlementStatus}
                              onChange={(e) => setEditData({ ...editData, settlementStatus: e.target.value })}
                            >
                              <option value="pending">PENDING</option>
                              <option value="credited">CREDITED</option>
                              <option value="on-hold">ON HOLD</option>
                            </select>
                          ) : (
                            <Badge className={`text-[10px] font-black uppercase border-none ${
                              selectedResignation.settlementStatus === 'credited' ? 'bg-green-500 text-white' : 'bg-amber-500 text-white'
                            }`}>
                              {selectedResignation.settlementStatus || 'PENDING'}
                            </Badge>
                          )}
                        </div>
                      </div>
                   </div>

                   <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="h-5 w-5 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                          <FileText className="h-3 w-3 text-blue-600" />
                        </div>
                        <h4 className="text-xs font-black uppercase text-slate-800 dark:text-slate-200">Asset Recovery</h4>
                      </div>
                      
                      <div className="space-y-2 pl-7">
                        {selectedResignation.employee?.assets?.filter(a => a.status === 'ASSIGNED').length > 0 ? (
                          selectedResignation.employee.assets.filter(a => a.status === 'ASSIGNED').map(asset => (
                            <div key={asset.id} className="flex items-center justify-between text-xs p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg group/asset">
                              <span className="font-bold text-slate-600 dark:text-slate-400">{asset.assetName}</span>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={() => handleRecoverAsset(asset.id)}
                                className="h-6 px-2 text-[9px] font-black bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white rounded-md border border-slate-100 dark:border-slate-600 opacity-0 group-hover/asset:opacity-100 transition-opacity"
                              >
                                COLLECTED
                              </Button>
                            </div>
                          ))
                        ) : (
                          <div className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl">
                            <CheckCircle2 className="h-5 w-5 text-emerald-500 mb-1" />
                            <p className="text-[10px] text-slate-400 font-bold uppercase">All Assets Recovered</p>
                          </div>
                        )}
                      </div>
                   </div>
                </div>

                {selectedResignation.checklistItems?.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Clearance Checklist Tracker</Label>
                      <Badge variant="outline" className="text-[10px] font-black">
                        {selectedResignation.checklistItems.filter(i => i.status === 'completed').length} / {selectedResignation.checklistItems.length} DONE
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      {selectedResignation.checklistItems.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <span className={`font-bold text-sm ${item.status === 'completed' ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{item.task}</span>
                          <div className="flex items-center gap-2">
                            {item.status !== 'completed' ? (
                              <Button 
                                size="sm" 
                                className="h-7 px-3 bg-green-600 hover:bg-green-700 text-white rounded-full text-[10px] font-bold"
                                onClick={() => handleUpdateChecklist(item.id, 'completed')}
                              >
                                Mark Done
                              </Button>
                            ) : (
                              <Badge className="bg-green-100 text-green-700 border-none h-6"><CheckCircle2 className="h-3 w-3 mr-1" /> COMPLETED</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedResignation.status === 'approved' && (
                  <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3 text-blue-800 text-sm">
                    <AlertCircle className="h-5 w-5 shrink-0 text-blue-500" />
                    <p>Once all checklist items are completed, you can finalize the exit. This will disable the employee's login access.</p>
                  </div>
                )}
              </div>

              <DialogFooter className="p-8 bg-slate-50 border-t gap-3">
                {isEditing ? (
                  <>
                    <Button variant="ghost" onClick={() => setIsEditing(false)} className="rounded-xl font-bold">Cancel</Button>
                    <Button onClick={handleUpdateResignation} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold px-8">
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" onClick={() => {
                      setEditData({ 
                        noticePeriod: selectedResignation.noticePeriod || 30, 
                        lastWorkingDate: selectedResignation.lastWorkingDate,
                        finalSettlementAmount: selectedResignation.finalSettlementAmount || 0,
                        settlementStatus: selectedResignation.settlementStatus || 'pending',
                        settlementBreakdown: selectedResignation.settlementBreakdown || {
                          basicSalary: 0, hra: 0, leaveEncashment: 0, bonus: 0,
                          professionalTax: 0, tds: 0, otherDeductions: 0
                        }
                      });
                      setIsEditing(true);
                    }} className="rounded-xl font-bold border-slate-200 dark:border-slate-700">
                      Edit Terms
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => handleCancelResignation(selectedResignation.id)}
                      disabled={saving}
                      className="rounded-xl font-bold border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900/30 dark:hover:bg-red-900/20"
                    >
                      Cancel Resignation
                    </Button>
                    <Button variant="ghost" onClick={() => setIsDetailsOpen(false)} className="rounded-xl font-bold">Close</Button>
                  </>
                )}
                {selectedResignation.status === 'approved' && (
                  <Button 
                    className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold px-8 shadow-lg shadow-slate-200"
                    onClick={() => handleCompleteExit(selectedResignation.id)}
                    disabled={selectedResignation.checklistItems?.some(i => i.status === 'pending')}
                  >
                    Finalize Exit & Disable Access
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ResignationList;
