import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings2, Plus, Trash2, Loader2, CheckCircle2 } from "lucide-react";
import { apiFetch } from "@/services/api";
import { toast } from "sonner";

const ManageLeaveTypesModal = ({ onUpdate }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [newType, setNewType] = useState({ leaveName: "", maxDaysPerYear: 12 });

  const fetchTypes = async () => {
    try {
      setLoading(true);
      const data = await apiFetch("/leave/type");
      setLeaveTypes(data?.data || data || []);
    } catch (e) {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) fetchTypes();
  }, [open]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newType.leaveName) return;
    try {
      setSaving(true);
      await apiFetch("/leave/type", {
        method: "POST",
        body: JSON.stringify(newType),
      });
      toast.success("Category added");
      setNewType({ leaveName: "", maxDaysPerYear: 12 });
      fetchTypes();
      if (onUpdate) onUpdate();
    } catch (e) {
      toast.error(e.message || "Failed to add");
    } finally {
      setSaving(false);
    }
  };

  const seedDefaults = async () => {
    try {
      setSaving(true);
      const defaults = [
        { leaveName: "Casual Leave", maxDaysPerYear: 12 },
        { leaveName: "Sick Leave", maxDaysPerYear: 10 },
      ];

      for (const item of defaults) {
        await apiFetch("/leave/type", {
          method: "POST",
          body: JSON.stringify(item),
        });
      }
      toast.success("Default protocols initialized");
      fetchTypes();
      if (onUpdate) onUpdate();
    } catch (e) {
      toast.error("Initialization failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this category?")) return;
    try {
      await apiFetch(`/leave/type/${id}`, { method: "DELETE" });
      toast.success("Category removed");
      fetchTypes();
      if (onUpdate) onUpdate();
    } catch (e) {
      toast.error("Failed to remove category");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="flex gap-2 rounded-xl h-11 border-border text-foreground font-bold hover:bg-muted transition-all"
        >
          <Settings2 className="h-5 w-5" /> Manage Categories
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden">
        <div className="bg-slate-900 p-8 text-white relative">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black italic tracking-tighter uppercase leading-none flex items-center gap-3">
              <CheckCircle2 className="h-7 w-7 text-blue-400" />
              Leave Architecture
            </DialogTitle>
            <DialogDescription className="text-white/40 font-bold uppercase tracking-widest text-[9px] mt-2">
              Configure global leave classifications and allocation rules.
            </DialogDescription>
          </DialogHeader>

          {leaveTypes.length === 0 && !loading && (
            <Button
              onClick={seedDefaults}
              disabled={saving}
              className="absolute top-8 right-8 h-9 rounded-lg bg-blue-500/20 hover:bg-blue-500 text-blue-400 hover:text-white border border-blue-500/30 text-[9px] font-black uppercase tracking-widest px-4 transition-all shadow-xl"
            >
              Initialize Defaults
            </Button>
          )}
        </div>

        <div className="p-8 space-y-8 bg-white">
          <form
            onSubmit={handleAdd}
            className="space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-100 shadow-inner"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-blue-600 uppercase tracking-widest ml-1">
                  New Category Name
                </label>
                <Input
                  placeholder="e.g. Sick Leave"
                  value={newType.leaveName}
                  onChange={(e) =>
                    setNewType({ ...newType, leaveName: e.target.value })
                  }
                  className="h-11 rounded-xl bg-white border-none shadow-sm font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-blue-600 uppercase tracking-widest ml-1">
                  Yearly Quota (Days)
                </label>
                <Input
                  type="number"
                  value={newType.maxDaysPerYear}
                  onChange={(e) =>
                    setNewType({ ...newType, maxDaysPerYear: e.target.value })
                  }
                  className="h-11 rounded-xl bg-white border-none shadow-sm font-bold"
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={saving}
              className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-[10px] tracking-widest shadow-lg shadow-blue-500/20"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" /> Establish Category
                </>
              )}
            </Button>
          </form>

          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
              Active Classifications
            </h4>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {loading ? (
                <div className="py-10 flex justify-center">
                  <Loader2 className="h-6 w-6 text-primary animate-spin" />
                </div>
              ) : leaveTypes.length === 0 ? (
                <p className="text-center py-10 text-slate-400 text-[10px] font-bold uppercase tracking-widest italic border-2 border-dashed border-slate-100 rounded-2xl">
                  No classifications defined yet.
                </p>
              ) : (
                leaveTypes.map((type) => (
                  <div
                    key={type.id}
                    className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl group hover:shadow-lg hover:shadow-slate-100 transition-all"
                  >
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800 text-sm">
                        {type.leaveName}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        {type.maxDaysPerYear} Days / Year
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDelete(type.id)}
                        className="h-8 w-8 rounded-lg text-rose-500 hover:bg-rose-50"
                      >
                         <Trash2 className="h-4 w-4" />
                      </Button>
                      <div
                        className={`h-2 w-2 rounded-full ${type.isActive ? "bg-emerald-500" : "bg-slate-300"}`}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ManageLeaveTypesModal;
