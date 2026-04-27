import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserPlus, Loader2, ShieldCheck } from 'lucide-react';
import { apiFetch } from '@/services/api';
import { toast } from 'sonner';

const ProvisionAdminModal = ({ onSuccess, admin = null, open, setOpen }) => {
  const [loading, setLoading] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(!!admin);
  const [companies, setCompanies] = useState([]);
  const [roles, setRoles] = useState([]);
  const isEdit = !!admin;
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: 'Admin@123',
    roleId: '',
    companyId: '',
    designation: 'HR'
  });

  useEffect(() => {
    if (open) {
      fetchContext();
      if (admin) {
        setFormData({
          name: admin.name || '',
          email: admin.email || '',
          password: '', // Don't show password for existing
          roleId: admin.roleId || admin.role?.id || '',
          companyId: admin.companyId || admin.company?.id || '',
          designation: admin.designation || 'HR'
        });
        setIsReadOnly(true);
      } else {
        setFormData({ name: '', email: '', password: 'Admin@123', roleId: '', companyId: '', designation: 'HR' });
        setIsReadOnly(false);
      }
    }
  }, [open, admin]);

  const fetchContext = async () => {
    try {
      const [companyData, roleData] = await Promise.all([
        apiFetch('/companies'),
        apiFetch('/users/roles')
      ]);
      const comps = companyData?.data || companyData || [];
      setCompanies(comps);
      
      const allRoles = roleData?.data || roleData || [];
      setRoles(allRoles);
      
      if (!admin) {
        const adminRole = allRoles.find(r => r.name?.toLowerCase() === 'admin');
        if (adminRole) {
          setFormData(prev => ({ ...prev, roleId: adminRole.id }));
        }
      }
    } catch (error) {
      toast.error('Failed to load system context');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isReadOnly) return;

    if (!formData.companyId) return toast.error('Assign a company node');
    if (!formData.roleId) return toast.error('Authority level required');

    try {
      setLoading(true);
      const url = isEdit ? `/users/${admin.id}` : '/users';
      const method = isEdit ? 'PUT' : 'POST';
      
      // Remove password if empty during edit
      const payload = { ...formData };
      if (isEdit && !payload.password) delete payload.password;

      await apiFetch(url, {
        method,
        body: JSON.stringify(payload)
      });
      
      toast.success(isEdit ? 'Administrative protocol updated' : 'Authority provisioned');
      setOpen(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(error.message || 'Transmission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[450px] rounded-[2rem] border-none shadow-2xl bg-white dark:bg-slate-900">
        <DialogHeader className="px-6 pt-4">
          <div className="flex justify-between items-start">
            <DialogTitle className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white uppercase italic flex items-center gap-3">
              <ShieldCheck className="h-7 w-7 text-indigo-600" /> {isEdit ? (isReadOnly ? 'Admin Data' : 'Revise Authority') : 'Provision Authority'}
            </DialogTitle>
            {isEdit && isReadOnly && (
              <Button 
                onClick={() => setIsReadOnly(false)}
                variant="outline" 
                className="rounded-full h-8 px-3 text-[8px] font-black uppercase tracking-widest border-indigo-100 text-indigo-600"
              >
                Unlock Account
              </Button>
            )}
          </div>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest opacity-80 pt-1">
            Node ID: {admin?.id?.slice(0, 8) || 'NEW_ADMIN'}
          </p>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-indigo-600 ml-1">Full Name</label>
              <Input 
                name="name" 
                disabled={isReadOnly}
                required 
                value={formData.name}
                onChange={handleChange}
                className="h-11 rounded-xl bg-indigo-50/30 border-none font-bold shadow-inner"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-indigo-600 ml-1">Identity Email</label>
              <Input 
                name="email" 
                disabled={isReadOnly}
                type="email" 
                required 
                value={formData.email}
                onChange={handleChange}
                className="h-11 rounded-xl bg-indigo-50/30 border-none font-bold shadow-inner"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-indigo-600 ml-1">Designation</label>
              <Input 
                name="designation" 
                disabled={isReadOnly}
                value={formData.designation}
                onChange={handleChange}
                className="h-11 rounded-xl bg-indigo-50/30 border-none font-bold shadow-inner"
              />
            </div>

            {!isReadOnly && (
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-indigo-600 ml-1">
                   {isEdit ? 'Update Access Key (Optional)' : 'Initial Access Key'}
                </label>
                <Input 
                  name="password" 
                  disabled={isReadOnly}
                  type="text"
                  placeholder={isEdit ? "Enter new password to reset" : "Admin@123"} 
                  value={formData.password}
                  onChange={handleChange}
                  className="h-11 rounded-xl bg-indigo-50/30 border-none font-mono text-sm shadow-inner"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-indigo-600 ml-1">Company Node</label>
                <select 
                  name="companyId"
                  disabled={isReadOnly}
                  value={formData.companyId}
                  onChange={handleChange}
                  className="w-full h-11 px-3 border-none rounded-xl bg-indigo-50/30 text-[10px] font-black uppercase tracking-widest outline-none shadow-inner"
                >
                  <option value="">Select Company</option>
                  {companies.map(c => (
                    <option key={c.id} value={c.id}>{c.companyName || c.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-indigo-600 ml-1">Priority Level</label>
                <select 
                  name="roleId"
                  disabled={isReadOnly}
                  value={formData.roleId}
                  onChange={handleChange}
                  className="w-full h-11 px-3 border-none rounded-xl bg-indigo-50/30 text-[10px] font-black uppercase tracking-widest outline-none shadow-inner"
                >
                  <option value="">Select Priority</option>
                  {roles.filter(r => !r.name?.toLowerCase().includes('super')).map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-slate-50 gap-3">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="rounded-xl font-black uppercase text-[10px] tracking-widest text-slate-400">Close</Button>
            {!isReadOnly && (
              <Button type="submit" disabled={loading} className="px-8 h-11 rounded-xl shadow-lg shadow-indigo-600/30 bg-indigo-600 hover:bg-indigo-700 min-w-[150px] font-black uppercase text-[10px] tracking-widest">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (isEdit ? 'Sync Authority' : 'Provision')}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProvisionAdminModal;
