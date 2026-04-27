import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  Users, 
  UserMinus, 
  Clock, 
  CheckCircle2, 
  TrendingUp,
  FileText
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import resignationService from '@/services/resignationService';
import { toast } from 'sonner';

const ExitDashboard = () => {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inNotice: 0,
    completed: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await resignationService.getStats();
      setStats(res.data);
    } catch (error) {
      toast.error('Failed to fetch dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const chartData = [
    { name: 'Pending', value: stats.pending, color: '#f59e0b' },
    { name: 'In Notice', value: stats.inNotice, color: '#10b981' },
    { name: 'Completed', value: stats.completed, color: '#3b82f6' }
  ];

  const pieData = [
    { name: 'Pending', value: stats.pending },
    { name: 'In Notice', value: stats.inNotice },
    { name: 'Completed', value: stats.completed }
  ];

  const COLORS = ['#f59e0b', '#10b981', '#3b82f6'];

  const statCards = [
    { title: 'Total Resignations', value: stats.total, icon: FileText, color: 'text-slate-600 dark:text-slate-300', bg: 'bg-slate-50 dark:bg-slate-800/50' },
    { title: 'Pending Approval', value: stats.pending, icon: Clock, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { title: 'In Notice Period', value: stats.inNotice, icon: TrendingUp, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { title: 'Completed Exits', value: stats.completed, icon: CheckCircle2, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' }
  ];

  if (loading) return <div className="p-8 text-center">Loading dashboard...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="space-y-1">
        <h1 className="text-3xl font-black tracking-tight text-slate-800 dark:text-slate-100">Exit Analytics Dashboard</h1>
        <p className="text-muted-foreground font-medium italic dark:text-slate-400">Overview of employee turnover and offboarding status.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <Card key={index} className="border-none shadow-xl shadow-slate-200/40 dark:shadow-none rounded-3xl overflow-hidden bg-white dark:bg-slate-900 group hover:scale-[1.02] transition-transform duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className={`${card.bg} p-3 rounded-2xl`}>
                  <card.icon className={`h-6 w-6 ${card.color}`} />
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{card.title}</p>
                  <p className="text-3xl font-black text-slate-800 dark:text-slate-100">{card.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-none shadow-2xl rounded-3xl overflow-hidden bg-white/70 dark:bg-slate-900/70 backdrop-blur-md">
          <CardHeader className="border-b dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 p-6">
            <CardTitle className="text-lg font-bold dark:text-slate-200">Resignation Status Distribution</CardTitle>
          </CardHeader>
          <CardContent className="p-8 h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.1} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontWeight: 600}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontWeight: 600}} />
                <Tooltip 
                  cursor={{fill: 'rgba(255,255,255,0.05)'}} 
                  contentStyle={{backgroundColor: '#0f172a', borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.3)', color: '#f8fafc'}}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-2xl rounded-3xl overflow-hidden bg-white/70 dark:bg-slate-900/70 backdrop-blur-md">
          <CardHeader className="border-b dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 p-6">
            <CardTitle className="text-lg font-bold dark:text-slate-200">Offboarding Progress Ratio</CardTitle>
          </CardHeader>
          <CardContent className="p-8 h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}}
                />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ExitDashboard;
