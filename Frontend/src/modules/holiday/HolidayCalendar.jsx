import React, { useState, useEffect, useCallback } from "react";
import {
  Calendar as CalendarIcon,
  Plus,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Edit2,
  Loader2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/services/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const HolidayCalendar = () => {
  const { canEdit } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState(null);
  const [formData, setFormData] = useState({
    holidayName: "",
    holidayDate: "",
    description: "",
    type: "HOLIDAY",
  });

  const fetchHolidays = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiFetch("/holiday");
      setHolidays(res?.data || []);
    } catch (e) {
      toast.error("Failed to sync holiday registry");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHolidays();
  }, [fetchHolidays]);

  const syncDefaults = async () => {
    try {
      setLoading(true);
      await apiFetch("/holiday/populate-defaults", {
        method: "POST",
        body: JSON.stringify({ year: currentDate.getFullYear() }),
      });
      toast.success("Standard holiday registry synchronized");
      fetchHolidays();
    } catch (e) {
      toast.error("Failed to sync standard policies");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const url = editingHoliday
        ? `/holiday/${editingHoliday.id}`
        : "/holiday/create";
      const method = editingHoliday ? "PUT" : "POST";

      await apiFetch(url, {
        method,
        body: JSON.stringify(formData),
      });

      toast.success(
        editingHoliday ? "Holiday redefined" : "Holiday instantiated",
      );
      setIsModalOpen(false);
      setEditingHoliday(null);
      setFormData({ holidayName: "", holidayDate: "", description: "", type: "HOLIDAY" });
      fetchHolidays();
    } catch (error) {
      toast.error(error.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this holiday?"))
      return;
    try {
      await apiFetch(`/holiday/${id}`, { method: "DELETE" });
      toast.success("Holiday deleted successfully");
      fetchHolidays();
    } catch (e) {
      toast.error("Failed to delete holiday");
    }
  };

  const openAddModal = (dateStr) => {
    setEditingHoliday(null);
    setFormData({ holidayName: "", holidayDate: dateStr, description: "", type: "HOLIDAY" });
    setIsModalOpen(true);
  };

  const openEditModal = (h) => {
    setEditingHoliday(h);
    setFormData({
      holidayName: h.holidayName,
      holidayDate: h.holidayDate,
      description: h.description || "",
      type: h.type || "HOLIDAY",
    });
    setIsModalOpen(true);
  };

  // --- CALENDAR LOGIC ---
  const daysInMonth = (date) =>
    new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = (date) =>
    new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const prevMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1),
    );
  const nextMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1),
    );

  const holidayMap = holidays.reduce((acc, h) => {
    acc[h.holidayDate] = h;
    return acc;
  }, {});

  const renderDays = () => {
    const totalDays = daysInMonth(currentDate);
    const startDay = firstDayOfMonth(currentDate);
    const cells = [];

    // Empty cells for alignment
    for (let i = 0; i < startDay; i++) {
      cells.push(
        <div
          key={`empty-${i}`}
          className="h-24 border-slate-50 dark:border-slate-800 border bg-slate-50/20 dark:bg-slate-800/20"
        />,
      );
    }

    for (let day = 1; day <= totalDays; day++) {
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, "0");
      const dayStr = String(day).padStart(2, "0");
      const fullDateStr = `${year}-${month}-${dayStr}`;
      const dayEntry = holidayMap[fullDateStr];
      const isSunday = new Date(year, month - 1, day).getDay() === 0;

      const today = new Date();
      const isToday = 
        year === today.getFullYear() && 
        currentDate.getMonth() === today.getMonth() && 
        day === today.getDate();

      cells.push(
        <div
          key={day}
          onClick={() => canEdit && !dayEntry && openAddModal(fullDateStr)}
          className={cn(
            "h-24 border border-slate-100 dark:border-slate-800 p-2 transition-all group relative",
            canEdit && "cursor-pointer",
            dayEntry
              ? (dayEntry.type === 'EVENT' ? "bg-blue-50 dark:bg-blue-950/20" : "bg-amber-50 dark:bg-amber-950/20")
              : isSunday
                ? "bg-slate-50/80 dark:bg-slate-900/50"
                : isToday
                  ? "bg-blue-50/50 dark:bg-blue-950/20"
                  : "bg-white dark:bg-slate-900",
            isToday && "ring-1 ring-inset ring-blue-200 dark:ring-blue-800/50",
            canEdit && !dayEntry && "hover:bg-slate-100 dark:hover:bg-slate-800/50",
          )}
        >
          <div className="flex items-center justify-between">
            <span
              className={cn(
                "text-sm font-bold",
                dayEntry
                  ? (dayEntry.type === 'EVENT' ? "text-blue-600" : "text-amber-600")
                  : isSunday
                    ? "text-slate-400 opacity-60"
                    : isToday
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-slate-400",
              )}
            >
              {day}
            </span>
            {isToday && (
              <div className="flex items-center gap-1">
                <span className="text-[8px] font-black uppercase text-blue-500 tracking-tighter opacity-80">Today</span>
                <div className="h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400 animate-blink-dot shadow-[0_0_8px_rgba(37,99,235,0.6)]" />
              </div>
            )}
          </div>

          {isSunday && !dayEntry && (
            <div className="mt-1">
              <span className="text-[8px] font-bold text-[#D97706] uppercase tracking-tighter">
                Weekly Off
              </span>
            </div>
          )}

          {dayEntry && (
            <div className="mt-1">
              <div className={cn(
                "px-2 py-1 rounded border shadow-sm relative group/item",
                dayEntry.type === 'EVENT' 
                  ? "bg-blue-100 dark:bg-blue-950/30 text-blue-900 dark:text-blue-200 border-blue-200 dark:border-blue-800"
                  : "bg-amber-100 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 border-amber-200 dark:border-amber-800"
              )}>
                <p className="text-[10px] font-bold uppercase truncate">
                  {dayEntry.holidayName}
                </p>
                {canEdit && (
                  <div className="flex gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(dayEntry);
                      }}
                      className={dayEntry.type === 'EVENT' ? "text-blue-700 hover:text-blue-900" : "text-amber-700 hover:text-amber-900"}
                    >
                      <Edit2 className="h-2.5 w-2.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(dayEntry.id);
                      }}
                      className={dayEntry.type === 'EVENT' ? "text-blue-700 hover:text-blue-900" : "text-amber-700 hover:text-amber-900"}
                    >
                      <Trash2 className="h-2.5 w-2.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {canEdit && !dayEntry && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <Plus className="h-5 w-5 text-slate-300" />
            </div>
          )}
        </div>,
      );
    }

    return cells;
  };

  const getMonthStats = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const totalDays = new Date(year, month + 1, 0).getDate();
    let sundays = 0;

    for (let i = 1; i <= totalDays; i++) {
      if (new Date(year, month, i).getDay() === 0) sundays++;
    }

    const currentMonthHolidays = holidays.filter((h) => {
      const [hy, hm, hd] = h.holidayDate.split("-").map(Number);
      const hDate = new Date(hy, hm - 1, hd);
      return (
        hDate.getFullYear() === year &&
        hDate.getMonth() === month &&
        hDate.getDay() !== 0 &&
        h.type !== "EVENT"
      );
    });

    return {
      totalDays,
      sundays,
      holidayCount: currentMonthHolidays.length,
      workingDays: totalDays - sundays - currentMonthHolidays.length,
    };
  };

  const stats = getMonthStats();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between px-2 gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">
            Calendar
          </h1>
          <p className="text-muted-foreground font-medium text-xs uppercase tracking-wide opacity-70">
            {canEdit
              ? "Manage company holidays and office leave dates."
              : "View upcoming company holidays and scheduled office closures."}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-4 px-6 py-2 bg-slate-100 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="flex flex-col border-r border-slate-200 dark:border-slate-700 pr-4">
              <span className="text-[9px] font-bold uppercase text-slate-500">
                Working Days
              </span>
              <span className="text-lg font-bold text-slate-900 dark:text-white">
                {stats.workingDays}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-bold uppercase text-slate-500">
                Holidays
              </span>
              <span className="text-lg font-bold text-slate-900 dark:text-white">
                {stats.holidayCount}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
            <Button
              onClick={prevMonth}
              variant="ghost"
              size="icon"
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-bold uppercase tracking-tight text-xs w-28 text-center text-slate-900 dark:text-white">
              {currentDate.toLocaleString("default", {
                month: "long",
                year: "numeric",
              })}
            </span>
            <Button
              onClick={nextMonth}
              variant="ghost"
              size="icon"
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <Card className="border border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl overflow-hidden bg-white dark:bg-card">
        <CardContent className="p-0">
          <div className="grid grid-cols-7 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-3 text-center">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <span
                key={d}
                className="text-[10px] font-bold uppercase tracking-wider text-slate-500"
              >
                {d}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {loading ? (
              <div className="col-span-7 h-[60vh] flex items-center justify-center italic text-slate-300 dark:text-slate-700 font-bold">
                Loading Holidays...
              </div>
            ) : (
              renderDays()
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[650px] rounded-[2rem] border-none shadow-2xl">
          <DialogHeader>
            <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-2">
              <CalendarIcon className="h-5 w-5" />
            </div>
            <DialogTitle className="text-2xl font-black tracking-tighter uppercase italic">
              {editingHoliday ? "Edit Holiday" : "Add New Holiday"}
            </DialogTitle>
            <DialogDescription className="text-xs font-bold uppercase tracking-widest italic text-blue-400">
              Manage holiday details
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateOrUpdate} className="space-y-6 pt-4">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                Entry Type
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="radio"
                    name="type"
                    value="HOLIDAY"
                    checked={formData.type === "HOLIDAY"}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="hidden"
                  />
                  <div className={cn(
                    "px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-sm border",
                    formData.type === "HOLIDAY" 
                      ? "bg-amber-100 text-amber-600 border-amber-200 shadow-amber-200/20" 
                      : "bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100"
                  )}>
                    Holiday
                  </div>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="radio"
                    name="type"
                    value="EVENT"
                    checked={formData.type === "EVENT"}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="hidden"
                  />
                  <div className={cn(
                    "px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-sm border",
                    formData.type === "EVENT" 
                      ? "bg-blue-100 text-blue-600 border-blue-200 shadow-blue-200/20" 
                      : "bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100"
                  )}>
                    Event
                  </div>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                {formData.type === 'EVENT' ? 'Event Name' : 'Holiday Name'}
              </label>
              <Input
                required
                placeholder={formData.type === 'EVENT' ? "Ex: Annual Meetup" : "Ex: Independence Day"}
                value={formData.holidayName}
                onChange={(e) =>
                  setFormData({ ...formData, holidayName: e.target.value })
                }
                className="h-12 rounded-xl bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 font-bold italic"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                Scheduled Date
              </label>
              <Input
                type="date"
                required
                value={formData.holidayDate}
                onChange={(e) =>
                  setFormData({ ...formData, holidayDate: e.target.value })
                }
                className="h-12 rounded-xl bg-slate-50 border-slate-100 font-bold italic"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                Description
              </label>
              <Input
                placeholder="Brief details..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="h-12 rounded-xl bg-slate-50 border-slate-100 font-bold italic"
              />
            </div>

            <DialogFooter className="pt-4 gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl font-bold uppercase text-[10px]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-[11px] tracking-widest shadow-xl shadow-blue-200"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : editingHoliday ? (
                  "Save Changes"
                ) : formData.type === 'EVENT' ? (
                  "Add Event"
                ) : (
                  "Add Holiday"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HolidayCalendar;
