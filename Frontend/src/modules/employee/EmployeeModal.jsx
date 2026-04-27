import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Loader2, 
  User, 
  IdCard, 
  Phone, 
  GraduationCap, 
  Award, 
  Monitor, 
  FileText, 
  HeartPulse, 
  CreditCard, 
  Briefcase,
  Edit3,
  Mail,
  MapPin,
  Calendar,
  Layers
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/services/api';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const EmployeeModal = ({ onSuccess, employee = null, trigger = null, mode = 'view' }) => {
  const { isSuperAdmin } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState(mode === 'view');
  const [activeTab, setActiveTab] = useState('general');
  const [imgError, setImgError] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const isEdit = !!employee;

  const [formData, setFormData] = useState({
    general: { firstName: '', lastName: '', officialEmail: '', employeeCode: '', phone: '', departmentId: '', designationId: '', reportingManagerId: '', dateOfJoining: new Date().toISOString().split('T')[0] },
    personal: { dateOfBirth: '', gender: '', maritalStatus: '', bloodGroup: '', nationality: '' },
    contact: { personalEmail: '', alternatePhone: '', currentAddress: '', permanentAddress: '', city: '', state: '', pincode: '' },
    bank: { bankName: '', accountNumber: '', ifscCode: '', branchName: '', accountHolderName: '', accountType: 'SALARY' },
    legal: { panNumber: '', aadhaarNumber: '', pfNumber: '', esiNumber: '', taxCategory: '' },
    emergency: { contactName: '', relationship: '', phoneNumber: '', email: '' },
    education: { degree: '', institutionName: '', university: '', startDate: '', endDate: '', percentageOrCGPA: '' },
    salary: { basicSalary: 0, netSalary: 0, effectiveFrom: new Date().toISOString().split('T')[0] },
  });

  const fetchData = async () => {
    try {
      const [deptRes, desigRes, empRes] = await Promise.all([
        apiFetch('/departments'),
        apiFetch('/designations'),
        apiFetch('/employees?limit=1000')
      ]);
      setDepartments(deptRes?.data || deptRes || []);
      setDesignations(desigRes?.data || desigRes || []);
      setAllEmployees((empRes?.data || empRes || []).filter(e => e.id !== employee?.id));
      
      if (employee?.id) {
        const fullProfile = await apiFetch(`/employees/${employee.id}`);
        const data = fullProfile?.data || fullProfile;
        setFormData({
          general: {
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            officialEmail: data.officialEmail || '',
            employeeCode: data.employeeCode || '',
            phone: data.officialPhone || '',
            departmentId: data.departmentId || '',
            designationId: data.designationId || '',
            reportingManagerId: data.reportingManagerId || '',
            dateOfJoining: data.dateOfJoining ? data.dateOfJoining.split('T')[0] : ''
          },
          personal: {
            dateOfBirth: data.personalDetail?.dateOfBirth?.split('T')[0] || '',
            gender: data.personalDetail?.gender || '',
            maritalStatus: data.personalDetail?.maritalStatus || '',
            bloodGroup: data.personalDetail?.bloodGroup || '',
            nationality: data.personalDetail?.nationality || ''
          },
          contact: {
            personalEmail: data.contactDetail?.personalEmail || '',
            alternatePhone: data.contactDetail?.alternatePhone || '',
            currentAddress: data.contactDetail?.currentAddress || '',
            permanentAddress: data.contactDetail?.permanentAddress || '',
            city: data.contactDetail?.city || '',
            state: data.contactDetail?.state || '',
            pincode: data.contactDetail?.pincode || ''
          },
          bank: {
            bankName: data.bankDetail?.bankName || '',
            accountNumber: data.bankDetail?.accountNumber || '',
            ifscCode: data.bankDetail?.ifscCode || '',
            branchName: data.bankDetail?.branchName || '',
            accountHolderName: data.bankDetail?.accountHolderName || '',
            accountType: data.bankDetail?.accountType || 'SALARY'
          },
          legal: {
            panNumber: data.legalDetail?.panNumber || '',
            aadhaarNumber: data.legalDetail?.aadhaarNumber || '',
            pfNumber: data.legalDetail?.pfNumber || '',
            esiNumber: data.legalDetail?.esiNumber || '',
            taxCategory: data.legalDetail?.taxCategory || ''
          },
          emergency: {
            contactName: data.emergencyContacts?.[0]?.contactName || '',
            relationship: data.emergencyContacts?.[0]?.relationship || '',
            phoneNumber: data.emergencyContacts?.[0]?.phoneNumber || '',
            email: data.emergencyContacts?.[0]?.email || ''
          },
          education: {
            degree: data.educations?.[0]?.degree || '',
            institutionName: data.educations?.[0]?.institutionName || '',
            university: data.educations?.[0]?.university || '',
            startDate: data.educations?.[0]?.startDate?.split('T')[0] || '',
            endDate: data.educations?.[0]?.endDate?.split('T')[0] || '',
            percentageOrCGPA: data.educations?.[0]?.percentageOrCGPA || ''
          },
            salary: {
              basicSalary: data.salary?.basicSalary || 0,
              netSalary: data.salary?.netSalary || 0,
              effectiveFrom: data.salary?.effectiveFrom?.split('T')[0] || ''
            }
          });
          setProjects(data.projects || []);
        }
    } catch (e) {
      console.error('Failed to load employee data', e);
    }
  };

  useEffect(() => {
    if (open) {
      setImgError(false);
      fetchData();
      setViewMode(mode === 'view' && !!employee);
      if (!employee) {
        setViewMode(false);
        setFormData({
            general: { firstName: '', lastName: '', officialEmail: '', employeeCode: '', phone: '', departmentId: '', designationId: '', reportingManagerId: '', dateOfJoining: new Date().toISOString().split('T')[0] },
            personal: { dateOfBirth: '', gender: '', maritalStatus: '', bloodGroup: '', nationality: '' },
            contact: { personalEmail: '', alternatePhone: '', currentAddress: '', permanentAddress: '', city: '', state: '', pincode: '' },
            bank: { bankName: '', accountNumber: '', ifscCode: '', branchName: '', accountHolderName: '', accountType: 'SALARY' },
            legal: { panNumber: '', aadhaarNumber: '', pfNumber: '', esiNumber: '', taxCategory: '' },
            emergency: { contactName: '', relationship: '', phoneNumber: '', email: '' },
            education: { degree: '', institutionName: '', university: '', startDate: '', endDate: '', percentageOrCGPA: '' },
            salary: { basicSalary: 0, netSalary: 0, effectiveFrom: new Date().toISOString().split('T')[0] },
        });
        setProjects([]);
      }
    }
  }, [open, employee, mode]);

  const handleUpdate = async (bulk = false) => {
    if (viewMode) return;
    try {
      setLoading(true);

      if (!isEdit) {
        // Create only handles 'general' section
        const body = { ...formData.general };
        if (body.departmentId === '') delete body.departmentId;
        if (body.designationId === '') delete body.designationId;
        if (body.reportingManagerId === '') body.reportingManagerId = null;

        if (!body.firstName || !body.lastName) return toast.error("Name fields cannot be empty");
        if (!body.officialEmail.includes('@')) return toast.error("Invalid email format");
        
        // Map phone to officialPhone for backend compatibility
        if (body.phone) body.officialPhone = body.phone;
        delete body.phone;

        await apiFetch('/employees', {
          method: 'POST',
          body: JSON.stringify(body)
        });
        toast.success("Employee created successfully");
        setOpen(false);
        if (onSuccess) onSuccess();
        return;
      }

      // 🔹 BULK UPDATE LOGIC FOR EXISTING EMPLOYEES
      let body = {};
      let url = `/employees/${employee.id}`;

      if (bulk) {
        body = {
          ...formData.general,
          personalDetail: formData.personal,
          contactDetail: formData.contact,
          bankDetail: formData.bank,
          legalDetail: formData.legal,
          salary: formData.salary,
        };
      } else {
        const section = activeTab;
        body = { ...formData[section] };
        
        if (section !== 'general') {
            url = `/employees/${employee.id}/${section}`;
        }
      }

      // Map phone to officialPhone for backend compatibility
      if (body.phone) {
          body.officialPhone = body.phone;
          delete body.phone;
      }

      // Sanitize UUIDs and nulls
      if (body.departmentId === '') delete body.departmentId;
      if (body.designationId === '') delete body.designationId;
      if (body.reportingManagerId === '') body.reportingManagerId = null;

      await apiFetch(url, {
        method: 'PUT',
        body: JSON.stringify(body)
      });

      toast.success(bulk ? "Full Profile synchronized successfully" : `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} updated successfully`);
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(error.message || `Update failed`);
    } finally {
      setLoading(false);
    }
  };

  const handlePincodeLookup = async (pincode) => {
    if (pincode.length === 6) {
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
        const data = await res.json();
        if (data?.[0]?.Status === 'Success') {
          const postOffice = data[0].PostOffice[0];
          // Use Division as it represents the regional hub more accurately for users (e.g. Tirupur instead of Erode/Coimbatore for 641605)
          const cityName = postOffice.Division || postOffice.District;
          
          setFormData(prev => ({
            ...prev,
            contact: {
              ...prev.contact,
              city: cityName,
              state: postOffice.State,
              pincode: pincode
            }
          }));
        }
      } catch (err) {
        console.error('Pincode lookup failed');
      }
    }
  };

  const renderField = (section, name, label, type = "text", placeholder = "", options = []) => {

    return (
      <div className="space-y-1.5 flex-1 min-w-[200px]">
        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-0.5">{label}</label>
        {type === "select" ? (
          <select
            value={formData[section][name]}
            disabled={viewMode}
            onChange={(e) => setFormData({ ...formData, [section]: { ...formData[section], [name]: e.target.value } })}
            className="w-full h-11 bg-slate-50 border-none rounded-xl px-4 text-xs font-bold outline-none ring-primary/10 focus:ring-2 appearance-none disabled:opacity-60"
          >
            <option value="">Select {label}...</option>
            {options.map(opt => <option key={opt.id || opt.value || opt} value={opt.id || opt.value || opt}>{opt.name || opt.label || opt}</option>)}
          </select>
        ) : (
          <Input
            type={type}
            placeholder={placeholder}
            value={formData[section][name]}
            disabled={viewMode}
            maxLength={name === 'aadhaarNumber' ? 12 : name === 'panNumber' ? 10 : undefined}
            onChange={(e) => {
              let val = e.target.value;
              
              // 🔹 Strict Validation based on field type
              if (name === 'firstName' || name === 'lastName') {
                val = val.replace(/[^a-zA-Z\s]/g, '');
              } else if (name === 'officialEmail' || name === 'personalEmail') {
                val = val.replace(/[^a-zA-Z0-9@._-]/g, '');
              } else if (name === 'phone' || name === 'alternatePhone' || name === 'phoneNumber') {
                val = val.replace(/[^0-9+]/g, '');
              } else if (name === 'aadhaarNumber') {
                val = val.replace(/\D/g, '');
              }

              // 🔹 Auto-uppercase for PAN
              if (name === 'panNumber') val = val.toUpperCase();

              setFormData({ ...formData, [section]: { ...formData[section], [name]: val } });
              if (name === 'pincode') handlePincodeLookup(val);
            }}
            className={cn(
              "h-11 border-none bg-slate-50 rounded-xl font-bold text-xs uppercase transition-all",
              name === 'panNumber' && "uppercase"
            )}
            style={name === 'panNumber' ? { textTransform: 'uppercase' } : {}}
          />
        )}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="h-12 px-8 rounded-2xl shadow-xl shadow-primary/25 flex gap-3 font-black uppercase text-[11px] tracking-widest bg-primary hover:bg-blue-600 transition-all border-none">
            <Plus className="h-5 w-5" />
            Add New Employee
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[1000px] h-[85vh] p-0 overflow-hidden border-none shadow-2xl rounded-[2rem] bg-white">
        <DialogHeader className="sr-only">
          <DialogTitle>Employee Profile Editor</DialogTitle>
          <DialogDescription>
            Manage comprehensive employee information including personal, financial, and professional details.
          </DialogDescription>
        </DialogHeader>
        <div className="flex h-full">
          {/* Sidebar Tabs */}
          <div className="w-[280px] bg-slate-50 border-r border-slate-100 flex flex-col p-6 overflow-y-auto shrink-0">
            <div className="mb-8 px-2">
                <div className="h-20 w-20 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4 overflow-hidden border border-slate-200 shadow-inner">
                    {employee?.profileImage && !imgError ? (
                      <img 
                        key={employee.profileImage}
                        src={`${(import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080').replace('127.0.0.1', window.location.hostname)}${employee.profileImage}`} 
                        alt="Profile" 
                        className="h-full w-full object-cover" 
                        onError={() => setImgError(true)}
                      />
                    ) : (
                      employee?.firstName?.charAt(0) || <User className="h-10 w-10" />
                    )}
                </div>
                <h3 className="text-xl font-black tracking-widest uppercase text-slate-900 leading-none">{isEdit ? 'Edit Profile' : 'New Employee'}</h3>
                <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest leading-relaxed mt-2">Employee Profile Details</p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} orientation="vertical" className="flex-1 w-full space-y-1">
              <TabsList className="flex flex-col bg-transparent h-auto p-0 gap-1">
                {[
                  { value: 'general', label: 'General Info', icon: User },
                  { value: 'personal', label: 'Personal Details', icon: HeartPulse, hide: isSuperAdmin },
                  { value: 'contact', label: 'Contact Details', icon: Mail },
                  { value: 'bank', label: 'Financial Data', icon: CreditCard },
                  { value: 'legal', label: 'Compliance & Legal', icon: IdCard, hide: isSuperAdmin },
                  { value: 'education', label: 'Education', icon: GraduationCap },
                  { value: 'emergency', label: 'Emergency Contacts', icon: Phone, hide: isSuperAdmin },
                  { value: 'salary', label: 'Compensation', icon: Briefcase },
                  { value: 'assets', label: 'Company Assets', icon: Monitor },
                  { value: 'documents', label: 'Documents', icon: FileText },
                  { value: 'projects', label: 'My Projects', icon: Layers },
                ].filter(tab => !tab.hide).map(tab => (
                  <TabsTrigger 
                    key={tab.value}
                    value={tab.value} 
                    className={cn(
                        "w-full justify-start gap-4 px-4 py-4 rounded-2xl border-none transition-all duration-300 font-bold text-[11px] uppercase tracking-widest group shadow-none",
                        activeTab === tab.value ? "bg-white text-primary shadow-sm ring-1 ring-slate-100" : "text-slate-400 hover:bg-white/50 hover:text-slate-600"
                    )}
                  >
                    <tab.icon className={cn("h-4 w-4 transition-colors", activeTab === tab.value ? "text-primary" : "text-slate-300 group-hover:text-slate-400")} />
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            
            {isEdit && viewMode && (
                <Button 
                    variant="outline" 
                    onClick={() => setViewMode(false)}
                    className="mt-6 w-full rounded-2xl h-12 flex gap-3 font-black text-[10px] uppercase tracking-[0.2em] border-primary/20 text-primary hover:bg-primary/5 shadow-none"
                >
                    <Edit3 className="h-4 w-4" /> Edit Profile
                </Button>
            )}
          </div>

          {/* Content Area */}
          <div className="flex-1 flex flex-col min-w-0 bg-white relative">
            <div className="p-10 pb-4 shrink-0">
               <div className="flex items-center justify-between mb-2">
                 <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-black uppercase tracking-widest text-slate-900 leading-none">
                           {activeTab === 'general' ? 'General Information' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1) + ' Details'}
                        </h2>
                    </div>
                    {isEdit && viewMode && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setViewMode(false)}
                        className="absolute top-10 right-10 h-11 w-11 rounded-2xl bg-primary text-white hover:bg-primary/90 transition-all shadow-xl shadow-primary/25 z-50 flex items-center justify-center border-none"
                        title="Edit Profile"
                      >
                        <Edit3 className="h-5 w-5" />
                      </Button>
                    )}
                    <p className="text-xs font-medium text-slate-400 italic">Configure the employee's official records.</p>
                 </div>
                 {!viewMode && !['assets', 'documents', 'projects'].includes(activeTab) && (
                    (!isSuperAdmin || !['personal', 'emergency', 'legal'].includes(activeTab)) && (
                      <div className="flex gap-3">
                        {isEdit && (
                          <Button 
                            onClick={() => handleUpdate(true)} 
                            variant="outline"
                            className="h-11 px-8 rounded-xl border-primary text-primary hover:bg-primary/5 font-bold flex gap-2 transition-all min-w-[180px]"
                            disabled={loading}
                          >
                            {loading ? <Loader2 className="animate-spin h-4 w-4" /> : 'Sync Full Profile'}
                          </Button>
                        )}
                        <Button 
                           onClick={() => handleUpdate(false)} 
                           className="h-11 px-8 rounded-xl shadow-lg shadow-primary/20 bg-primary hover:bg-blue-600 font-bold flex gap-2 transition-all min-w-[150px]"
                           disabled={loading}
                        >
                           {loading ? <Loader2 className="animate-spin h-4 w-4" /> : (isEdit ? `Update ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}` : 'Create Employee')}
                        </Button>
                      </div>
                    )
                 )}
               </div>
            </div>

            <div className="flex-1 overflow-y-auto px-10">
              <Tabs value={activeTab} className="w-full mb-20">
                <TabsContent value="general" className="mt-0 space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    {renderField('general', 'firstName', 'First Name', 'text', 'John')}
                    {renderField('general', 'lastName', 'Last Name', 'text', 'Doe')}
                    {renderField('general', 'officialEmail', 'Official Email', 'email', 'john@company.com')}
                    {renderField('general', 'phone', 'Official Phone', 'text', '+91')}
                    {renderField('general', 'employeeCode', 'Employee ID', 'text', isEdit ? '' : 'AUTO-GENERATED')}
                    {renderField('general', 'departmentId', 'Department', 'select', '', departments)}
                    {renderField('general', 'designationId', 'Designation', 'select', '', designations)}
                    {renderField('general', 'reportingManagerId', 'Reporting Manager', 'select', '', allEmployees.map(e => ({ id: e.id, name: `${e.firstName} ${e.lastName} (${e.employeeCode})` })))}
                    {renderField('general', 'dateOfJoining', 'Joining Date', 'date')}
                  </div>
                </TabsContent>

                <TabsContent value="personal" className="mt-0 space-y-6">
                   <div className="grid grid-cols-2 gap-6">
                     {renderField('personal', 'dateOfBirth', 'Date of Birth', 'date')}
                     {renderField('personal', 'gender', 'Gender', 'select', '', ['MALE', 'FEMALE', 'OTHER'])}
                     {renderField('personal', 'maritalStatus', 'Marital Status', 'select', '', ['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED'])}
                     {renderField('personal', 'bloodGroup', 'Blood Group', 'text', 'A+ / B-')}
                     {renderField('personal', 'nationality', 'Nationality', 'text', 'Indian')}
                   </div>
                </TabsContent>

                <TabsContent value="contact" className="mt-0 space-y-6">
                   <div className="grid grid-cols-2 gap-6 text-slate-700">
                     {renderField('contact', 'personalEmail', 'Personal Email', 'email')}
                     {renderField('contact', 'alternatePhone', 'Alt Phone')}
                     {renderField('contact', 'city', 'City')}
                     {renderField('contact', 'state', 'State')}
                     {renderField('contact', 'pincode', 'Pincode')}
                   </div>
                   <div className="space-y-4 pt-2">
                     {renderField('contact', 'currentAddress', 'Current Address')}
                     {renderField('contact', 'permanentAddress', 'Permanent Address')}
                   </div>
                </TabsContent>

                <TabsContent value="bank" className="mt-0 space-y-6">
                   <div className="grid grid-cols-2 gap-6">
                     {renderField('bank', 'bankName', 'Bank Name')}
                     {renderField('bank', 'accountNumber', 'Account Number')}
                     {renderField('bank', 'ifscCode', 'IFSC Code')}
                     {renderField('bank', 'branchName', 'Branch')}
                     {renderField('bank', 'accountHolderName', 'Holder Name')}
                     {renderField('bank', 'accountType', 'Account Type', 'select', '', ['SAVINGS', 'CURRENT', 'SALARY'])}
                   </div>
                </TabsContent>

                <TabsContent value="legal" className="mt-0 space-y-6">
                   <div className="grid grid-cols-2 gap-6">
                     {renderField('legal', 'panNumber', 'PAN Number')}
                     {renderField('legal', 'aadhaarNumber', 'Aadhaar Number')}
                     {renderField('legal', 'pfNumber', 'PF Number')}
                     {renderField('legal', 'esiNumber', 'ESI Number')}
                     {renderField('legal', 'taxCategory', 'Tax Category')}
                   </div>
                </TabsContent>

                <TabsContent value="education" className="mt-0 space-y-6">
                   <div className="grid grid-cols-2 gap-6">
                     {renderField('education', 'degree', 'Degree')}
                     {renderField('education', 'institutionName', 'Institution')}
                     {renderField('education', 'university', 'University')}
                     {renderField('education', 'startDate', 'Start Date', 'date')}
                     {renderField('education', 'endDate', 'End Date', 'date')}
                     {renderField('education', 'percentageOrCGPA', 'Score')}
                   </div>
                </TabsContent>

                <TabsContent value="emergency" className="mt-0 space-y-6">
                   <div className="grid grid-cols-2 gap-6">
                     {renderField('emergency', 'contactName', 'Contact Name')}
                     {renderField('emergency', 'relationship', 'Relationship')}
                     {renderField('emergency', 'phoneNumber', 'Phone Number')}
                     {renderField('emergency', 'email', 'Email')}
                   </div>
                </TabsContent>

                <TabsContent value="salary" className="mt-0 space-y-6">
                   <div className="grid grid-cols-2 gap-6">
                     {renderField('salary', 'basicSalary', 'Basic Salary', 'number')}
                     {renderField('salary', 'netSalary', 'Net Salary', 'number')}
                     {renderField('salary', 'effectiveFrom', 'Effective From', 'date')}
                   </div>
                </TabsContent>

                <TabsContent value="assets" className="mt-0 space-y-4">
                  <div className="space-y-3">
                    {employee?.assets?.length > 0 ? (
                      employee.assets.map((asset, i) => (
                        <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-primary shadow-sm"><Monitor className="h-5 w-5" /></div>
                            <div>
                              <p className="text-[11px] font-black uppercase tracking-tight">{asset.assetName}</p>
                              <p className="text-[10px] text-muted-foreground font-mono">{asset.serialNumber || 'No Serial'}</p>
                            </div>
                          </div>
                          <Badge className="bg-emerald-500/10 text-emerald-600 border-none font-black text-[9px]">{asset.status || 'ASSIGNED'}</Badge>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-10 opacity-30 italic text-sm font-medium">No assets assigned yet.</div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="documents" className="mt-0 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {employee?.documents?.length > 0 ? (
                      employee.documents.map((doc, i) => (
                        <div key={i} className="p-4 rounded-2xl border border-slate-100 flex items-center gap-4 hover:bg-slate-50 transition-colors cursor-pointer group">
                           <div className="h-10 w-10 rounded-xl bg-primary/5 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all"><FileText className="h-5 w-5" /></div>
                           <div className="flex-1 min-w-0">
                             <p className="text-[11px] font-black uppercase truncate">{doc.documentType}</p>
                             <p className="text-[9px] text-muted-foreground font-bold">{doc.verificationStatus || 'PENDING'}</p>
                           </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-2 text-center py-10 opacity-30 italic text-sm font-medium">No documents found.</div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="projects" className="mt-0 space-y-4">
                  <div className="space-y-3">
                    {projects.length > 0 ? (
                      projects.map((proj, i) => (
                        <div key={i} className="p-4 rounded-2xl bg-indigo-50/30 border border-indigo-100/50 flex items-center justify-between">
                           <div className="flex items-center gap-4">
                             <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-indigo-600 shadow-sm"><Layers className="h-5 w-5" /></div>
                             <div>
                               <p className="text-[11px] font-black uppercase tracking-tight">{proj.projectName || 'Enterprise Project'}</p>
                               <p className="text-[10px] text-indigo-400 font-bold uppercase">{proj.projectStatus || 'ACTIVE'}</p>
                             </div>
                           </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-10 opacity-30 italic text-sm font-medium">No project assignments yet.</div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeModal;
