import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Search, 
  Building2, 
  Users, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Loader2,
  Eye
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
import DepartmentModal from './DepartmentModal';
import { Pagination } from '@/components/ui/pagination';

const DepartmentList = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiFetch(`/departments?page=${page}&limit=${limit}&search=${searchQuery}`);
      setDepartments(res?.data || []);
      setTotalPages(Math.ceil((res?.total || 0) / limit) || 1);
    } catch (error) {
      toast.error(error.message || 'Failed to fetch departments');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData, page]); // Fetch on page change

  const filtered = departments; // Search handled by backend

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-muted-foreground font-bold tracking-widest uppercase text-xs">Loading Departments...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tighter text-foreground uppercase italic">Departments</h1>
          <p className="text-muted-foreground font-medium italic opacity-70 text-sm">Manage your company's departments.</p>
        </div>
        
        <DepartmentModal onSuccess={fetchData} />
      </div>

      <div className="flex items-center gap-4 bg-card/50 backdrop-blur-md p-4 rounded-3xl border border-border shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name or code..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 border-none bg-muted rounded-2xl font-bold"
          />
        </div>
      </div>

      <Card className="border-none shadow-2xl rounded-3xl overflow-hidden bg-card/70 backdrop-blur-xl ring-1 ring-border">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent border-none font-black uppercase text-[10px] tracking-widest">
                <TableHead className="pl-8 py-6">Dept Code</TableHead>
                <TableHead className="py-6">Department Name</TableHead>
                <TableHead className="py-6">Head of Dept</TableHead>
                <TableHead className="py-6 text-center">Team Count</TableHead>
                <TableHead className="pr-8 py-6 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-20 text-muted-foreground italic font-medium uppercase tracking-tighter">
                    No departments found.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((dept, idx) => (
                  <TableRow key={dept.id} className="group hover:bg-primary/5 transition-all border-border">
                    <TableCell className="pl-8 py-6 font-mono font-bold text-primary">{dept.code || `D-${(idx + 1).toString().padStart(3, '0')}`}</TableCell>
                    <TableCell className="py-6">
                       <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-card group-hover:text-primary transition-colors border border-border">
                             <Building2 className="h-5 w-5" />
                          </div>
                          <span className="font-bold text-foreground">{dept.name}</span>
                       </div>
                    </TableCell>
                    <TableCell className="py-6 font-bold text-foreground">
                      {dept.head ? `${dept.head.firstName} ${dept.head.lastName}` : 'Not Assigned'}
                    </TableCell>
                    <TableCell className="py-6 text-center">
                       <Badge variant="outline" className="rounded-full shadow-none border-border bg-card font-bold px-3">
                          <Users className="h-3 w-3 mr-1.5 opacity-50" />
                          {dept.employeeCount || 0}
                       </Badge>
                    </TableCell>
                    <TableCell className="pr-8 py-6 text-right">
                       <div className="flex justify-end gap-2">
                         <DepartmentModal 
                            department={dept} 
                            onSuccess={fetchData} 
                            trigger={
                                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-card border-transparent hover:border-border">
                                    <Eye className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                </Button>
                            } 
                         />
                         <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-9 w-9 rounded-full hover:bg-card border-transparent hover:border-border"
                         >
                            <Trash2 className="h-4 w-4 text-muted-foreground group-hover:text-red-500 transition-colors" />
                         </Button>
                       </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
        <Pagination 
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          loading={loading}
        />
      </Card>
    </div>
  );
};

export default DepartmentList;
