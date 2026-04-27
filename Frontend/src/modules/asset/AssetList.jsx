import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Monitor,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Trash2,
  Edit3,
  User,
  CheckCircle2,
  XCircle,
  Clock,
  Laptop,
  Smartphone,
  HardDrive,
  Usb,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiFetch } from "@/services/api";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const AssetList = () => {
  const { isAdmin, isHR } = useAuth();
  const [assets, setAssets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);

  const [formData, setFormData] = useState({
    employeeId: "",
    assetName: "",
    assetCategory: "LAPTOP",
    assetCode: "",
    serialNumber: "",
    assignedDate: new Date().toISOString().split("T")[0],
    status: "ASSIGNED",
    remarks: "",
  });

  const categories = [
    "LAPTOP",
    "MOBILE",
    "PEN_DRIVE",
    "SIM_CARD",
    "ID_CARD",
    "VEHICLE",
    "OTHER",
  ];

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const res = await apiFetch(`/assets?search=${search}`);
      setAssets(res?.data || []);
    } catch (err) {
      toast.error("Failed to load asset inventory");
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await apiFetch("/employees?limit=1000");
      setEmployees(res?.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAssets();
    fetchEmployees();
  }, [search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = editingAsset ? "PUT" : "POST";
      const url = editingAsset ? `/assets/${editingAsset.id}` : "/assets";

      await apiFetch(url, {
        method,
        body: JSON.stringify(formData),
      });

      toast.success(
        editingAsset ? "Asset record updated" : "Asset assigned successfully",
      );
      setIsModalOpen(false);
      setEditingAsset(null);
      setFormData({
        employeeId: "",
        assetName: "",
        assetCategory: "LAPTOP",
        assetCode: "",
        serialNumber: "",
        assignedDate: new Date().toISOString().split("T")[0],
        status: "ASSIGNED",
        remarks: "",
      });
      fetchAssets();
    } catch (err) {
      toast.error(err.message || "Action failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this asset record?"))
      return;
    try {
      await apiFetch(`/assets/${id}`, { method: "DELETE" });
      toast.success("Asset record removed");
      fetchAssets();
    } catch (err) {
      toast.error("Failed to delete asset");
    }
  };

  const openEditModal = (asset) => {
    setEditingAsset(asset);
    setFormData({
      employeeId: asset.employeeId,
      assetName: asset.assetName,
      assetCategory: asset.assetCategory,
      assetCode: asset.assetCode || "",
      serialNumber: asset.serialNumber || "",
      assignedDate: asset.assignedDate || "",
      status: asset.status,
      remarks: asset.remarks || "",
    });
    setIsModalOpen(true);
  };

  const handleQuickReturn = async (asset) => {
     if (!window.confirm(`Are you sure you want to mark ${asset.assetName} as RETURNED?`)) return;

     try {
        await apiFetch(`/assets/${asset.id}`, {
           method: "PUT",
           body: JSON.stringify({
              ...asset,
              status: "RETURNED",
              returnDate: new Date().toISOString().split("T")[0]
           })
        });
        toast.success(`${asset.assetName} successfully marked as returned`);
        fetchAssets();
     } catch (err) {
        toast.error("Failed to update asset status");
     }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "LAPTOP":
        return <Laptop className="h-4 w-4" />;
      case "MOBILE":
        return <Smartphone className="h-4 w-4" />;
      case "PEN_DRIVE":
        return <Usb className="h-4 w-4" />;
      case "SIM_CARD":
        return <HardDrive className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "ASSIGNED":
        return (
          <Badge className="bg-blue-500/10 text-blue-600 border-none font-black text-[9px]">
            ASSIGNED
          </Badge>
        );
      case "RETURNED":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 border-none font-black text-[9px]">
            RETURNED
          </Badge>
        );
      case "LOST":
        return (
          <Badge className="bg-rose-500/10 text-rose-600 border-none font-black text-[9px]">
            LOST
          </Badge>
        );
      case "DAMAGED":
        return (
          <Badge className="bg-orange-500/10 text-orange-600 border-none font-black text-[9px]">
            DAMAGED
          </Badge>
        );
      default:
        return (
          <Badge className="bg-slate-500/10 text-slate-600 border-none font-black text-[9px]">
            {status}
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-top-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tighter text-foreground flex items-center gap-3 uppercase italic">
            <div className="h-12 w-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-2xl shadow-primary/20">
              <Monitor className="h-7 w-7" />
            </div>
            Asset Management
          </h1>
          <p className="text-muted-foreground font-bold italic text-sm tracking-tight opacity-70 pl-1">
            Inventory control and terminal assignment tracking system.
          </p>
        </div>

        <div className="flex gap-4">
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingAsset(null);
                  setFormData({
                    employeeId: "",
                    assetName: "",
                    assetCategory: "LAPTOP",
                    assetCode: "",
                    serialNumber: "",
                    assignedDate: new Date().toISOString().split("T")[0],
                    status: "ASSIGNED",
                    remarks: "",
                  });
                }}
                className="h-12 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase text-[11px] tracking-widest shadow-2xl shadow-primary/20 transition-all flex gap-3"
              >
                <Plus className="h-5 w-5" /> Assign New Asset
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px] border-border shadow-2xl rounded-[2rem] p-0 overflow-hidden bg-card">
              <DialogHeader className="p-8 pb-4 bg-muted/50 border-b border-border">
                <DialogTitle className="text-2xl font-black uppercase tracking-tighter italic">
                  {editingAsset ? "Update Assignment" : "New Asset Assignment"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                      Assign to Employee
                    </label>
                    <select
                      value={formData.employeeId}
                      required
                      onChange={(e) =>
                        setFormData({ ...formData, employeeId: e.target.value })
                      }
                      className="w-full h-12 bg-muted border-none rounded-xl px-4 text-xs font-bold focus:ring-2 ring-primary/20 outline-none appearance-none"
                    >
                      <option value="">Select Employee...</option>
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.firstName} {emp.lastName} ({emp.employeeCode})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                        Asset Name
                      </label>
                      <Input
                        value={formData.assetName}
                        required
                        placeholder="e.g. MacBook Pro"
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            assetName: e.target.value,
                          })
                        }
                        className="h-12 bg-muted border-none rounded-xl font-bold text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                        Category
                      </label>
                      <select
                        value={formData.assetCategory}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            assetCategory: e.target.value,
                          })
                        }
                        className="w-full h-12 bg-muted border-none rounded-xl px-4 text-xs font-bold focus:ring-2 ring-primary/20 outline-none appearance-none"
                      >
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                        Serial Number
                      </label>
                      <Input
                        value={formData.serialNumber}
                        placeholder="SN-XXXXX"
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            serialNumber: e.target.value,
                          })
                        }
                        className="h-12 bg-muted border-none rounded-xl font-bold text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                        Asset ID Code
                      </label>
                      <Input
                        value={formData.assetCode}
                        placeholder="AST-001"
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            assetCode: e.target.value,
                          })
                        }
                        className="h-12 bg-muted border-none rounded-xl font-bold text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                        Assigned Date
                      </label>
                      <Input
                        type="date"
                        value={formData.assignedDate}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            assignedDate: e.target.value,
                          })
                        }
                        className="h-12 bg-muted border-none rounded-xl font-bold text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                        Current Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) =>
                          setFormData({ ...formData, status: e.target.value })
                        }
                        className="w-full h-12 bg-muted border-none rounded-xl px-4 text-xs font-bold focus:ring-2 ring-primary/20 outline-none appearance-none"
                      >
                        <option value="ASSIGNED">ASSIGNED</option>
                        <option value="RETURNED">RETURNED</option>
                        <option value="LOST">LOST</option>
                        <option value="DAMAGED">DAMAGED</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                      Remarks
                    </label>
                    <textarea
                      value={formData.remarks}
                      onChange={(e) =>
                        setFormData({ ...formData, remarks: e.target.value })
                      }
                      className="w-full min-h-[80px] bg-muted border-none rounded-xl p-4 text-xs font-bold focus:ring-2 ring-primary/20 outline-none"
                      placeholder="Condition notes..."
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 h-12 rounded-xl font-black uppercase text-[10px] tracking-widest"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 h-12 rounded-xl bg-primary text-white font-black uppercase text-[10px] tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                  >
                    {editingAsset ? "Update Alignment" : "Confirm Assignment"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-card/50 backdrop-blur-xl ring-1 ring-border">
        <CardHeader className="px-10 py-8 border-b border-border flex flex-row items-center justify-between bg-card">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
            <Input
              placeholder="Search inventory by Name, Serial or Code..."
              className="pl-12 h-12 bg-muted/50 border-none rounded-2xl font-bold text-xs w-full ring-offset-0 focus-visible:ring-1 focus-visible:ring-primary/20"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-4">
            <Button
              variant="outline"
              className="h-12 w-12 rounded-2xl border-border bg-card p-0"
            >
              <Filter className="h-5 w-5 text-muted-foreground" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Asset Identity
                  </TableHead>
                  <TableHead className="py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Assigned Node
                  </TableHead>
                  <TableHead className="py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Temporal Data
                  </TableHead>
                  <TableHead className="py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">
                    Protocol Status
                  </TableHead>
                  <TableHead className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-48 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Clock className="h-8 w-8 text-muted-foreground/20 animate-spin" />
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/30">
                          Synchronizing Vault...
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : assets.length > 0 ? (
                  assets.map((asset) => (
                    <TableRow
                      key={asset.id}
                      className="hover:bg-muted/20 transition-colors border-b border-border group"
                    >
                      <TableCell className="px-10 py-6">
                        <div className="flex items-center gap-5">
                          <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center text-foreground shadow-xl shadow-black/5 group-hover:scale-110 transition-all border border-border">
                            {getCategoryIcon(asset.assetCategory)}
                          </div>
                          <div>
                            <p className="text-sm font-black uppercase tracking-tight text-foreground">
                              {asset.assetName}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Badge
                                variant="outline"
                                className="rounded-md px-1.5 h-4 border-border text-[8px] font-bold text-muted-foreground uppercase tracking-tighter"
                              >
                                {asset.assetCode || "NO-CODE"}
                              </Badge>
                              <span className="text-[9px] font-mono text-muted-foreground/60 font-bold">
                                {asset.serialNumber}
                              </span>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-6">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-[10px] font-black text-muted-foreground">
                            {asset.employee?.firstName?.charAt(0)}
                          </div>
                          <div>
                            <p className="text-xs font-black text-foreground">
                              {asset.employee?.firstName}{" "}
                              {asset.employee?.lastName}
                            </p>
                            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                              {asset.employee?.employeeCode}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-6">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground">
                            <Clock className="h-3 w-3 text-primary/50" />{" "}
                            {asset.assignedDate}
                          </div>
                          <p className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-tighter pl-4.5 italic">
                            Assignment Timestamp
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="py-6 text-center">
                        {getStatusBadge(asset.status)}
                      </TableCell>
                      <TableCell className="px-10 py-6 text-right">
                        <div className="flex items-center justify-end gap-2 pr-2">
                          {asset.status !== "RETURNED" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleQuickReturn(asset)}
                              className="h-9 w-9 rounded-xl hover:bg-emerald-500/10 hover:text-emerald-600 transition-all text-muted-foreground/50"
                              title="Mark as Returned"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditModal(asset)}
                            className="h-9 w-9 rounded-xl hover:bg-primary/10 hover:text-primary transition-all text-muted-foreground/50"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(asset.id)}
                            className="h-9 w-9 rounded-xl hover:bg-rose-500/10 hover:text-rose-600 transition-all text-muted-foreground/50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-64 text-center">
                      <div className="flex flex-col items-center gap-4 opacity-20">
                        <Monitor className="h-16 w-16" />
                        <p className="text-sm font-black uppercase tracking-widest italic">
                          No asset nodes detected in terminal registry.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssetList;
