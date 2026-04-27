import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Briefcase, 
  Users, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  BarChart3,
  PieChart as PieIcon,
  Activity,
  Calendar,
  Layers
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie,
  LineChart,
  Line
} from 'recharts';
import { apiFetch } from '@/services/api';

const ProjectDashboard = () => {
  const [data, setData] = useState({
    projects: [],
    loading: true,
    stats: {
      total: 0,
      active: 0,
      completed: 0,
      onHold: 0,
      resourceUtilization: 78 // Mocked for now
    }
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await apiFetch('/project');
        const projects = Array.isArray(res?.data || res) ? (res?.data || res) : [];
        
        setData({
          projects,
          loading: false,
          stats: {
            total: projects.length,
            active: projects.filter(p => p.projectStatus === 'IN_PROGRESS').length,
            completed: projects.filter(p => p.projectStatus === 'COMPLETED').length,
            onHold: projects.filter(p => p.projectStatus === 'ON_HOLD').length,
            resourceUtilization: 65 + Math.floor(Math.random() * 20)
          }
        });
      } catch (error) {
        console.error('Failed to load project dashboard data');
      }
    };
    fetchDashboardData();
  }, []);

  const projectStatusData = [
    { name: 'Active', value: data.stats.active, color: '#4f46e5' },
    { name: 'Completed', value: data.stats.completed, color: '#10b981' },
    { name: 'On Hold', value: data.stats.onHold, color: '#f59e0b' },
    { name: 'New', value: data.projects.filter(p => p.projectStatus === 'NOT_STARTED').length, color: '#94a3b8' }
  ];

  const workloadData = [
    { week: 'W1', development: 45, design: 30, testing: 25 },
    { week: 'W2', development: 52, design: 35, testing: 30 },
    { week: 'W3', development: 48, design: 40, testing: 35 },
    { week: 'W4', development: 61, design: 38, testing: 42 },
  ];

  if (data.loading) {
    return <div className="h-[80vh] flex items-center justify-center font-black text-slate-200 text-6xl italic animate-pulse">ORCHESTRATING...</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tighter text-slate-900 italic uppercase">Project Board</h1>
          <p className="text-muted-foreground font-bold italic tracking-tight">Track project progress and resource status across the company.</p>
        </div>
        <div className="flex gap-4">
           <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border flex items-center gap-3">
              <Activity className="h-5 w-5 text-indigo-600 animate-pulse" />
               <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">System Status: Active</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Projects', value: data.stats.total, icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-500/10' },
          { label: 'Active Projects', value: data.stats.active, icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-500/10' },
          { label: 'Workforce Hub', value: `${data.stats.resourceUtilization}%`, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
          { label: 'System status', value: 'Live', icon: CheckCircle2, color: 'text-purple-600', bg: 'bg-purple-500/10' },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-xl rounded-3xl p-6 bg-white transition-all hover:-translate-y-1 hover:shadow-2xl">
            <div className="flex items-center gap-4">
               <div className={`h-12 w-12 rounded-2xl ${stat.bg} flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
               </div>
               <div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                  <h4 className="text-2xl font-black tracking-tight">{stat.value}</h4>
               </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Status Distribution */}
        <Card className="border-none shadow-2xl rounded-[2.5rem] bg-white overflow-hidden p-8">
          <CardHeader className="p-0 mb-8 flex flex-row items-center justify-between">
             <CardTitle className="text-xl font-black uppercase tracking-tighter italic">Project Status</CardTitle>
             <PieIcon className="h-6 w-6 text-slate-300" />
          </CardHeader>
          <div className="h-[350px] flex items-center gap-8">
             <ResponsiveContainer width="60%" height="100%">
                <PieChart>
                   <Pie
                      data={projectStatusData}
                      innerRadius={80}
                      outerRadius={120}
                      paddingAngle={8}
                      dataKey="value"
                   >
                      {projectStatusData.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                   </Pie>
                   <Tooltip />
                </PieChart>
             </ResponsiveContainer>
             <div className="flex-1 space-y-4">
                {projectStatusData.map((item, i) => (
                   <div key={i} className="flex items-center gap-3">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <div className="flex-1">
                         <div className="flex justify-between items-center">
                            <span className="text-[11px] font-black uppercase tracking-tight text-slate-500">{item.name}</span>
                            <span className="text-sm font-black">{Math.round((item.value / data.stats.total) * 100) || 0}%</span>
                         </div>
                         <div className="h-1 w-full bg-slate-100 rounded-full mt-1 overflow-hidden">
                            <div className="h-full" style={{ width: `${(item.value / data.stats.total) * 100 || 0}%`, backgroundColor: item.color }} />
                         </div>
                      </div>
                   </div>
                ))}
             </div>
          </div>
        </Card>

        {/* Workload Telemetry */}
        <Card className="border-none shadow-2xl rounded-[2.5rem] bg-white overflow-hidden p-8">
        <CardHeader className="p-0 mb-8 flex flex-row items-center justify-between">
             <CardTitle className="text-xl font-black uppercase tracking-tighter italic">Workload Status</CardTitle>
             <TrendingUp className="h-6 w-6 text-slate-300" />
          </CardHeader>
          <div className="h-[350px]">
             <ResponsiveContainer width="100%" height="100%">
                <LineChart data={workloadData}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                   <XAxis 
                     dataKey="week" 
                     axisLine={false} 
                     tickLine={false} 
                     tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }} 
                   />
                   <YAxis hide />
                   <Tooltip 
                     contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', fontStyle: 'italic', fontWeight: 'bold' }}
                   />
                   <Line type="monotone" dataKey="development" stroke="#4f46e5" strokeWidth={4} dot={{ r: 6, fill: '#4f46e5', strokeWidth: 0 }} activeDot={{ r: 8 }} />
                   <Line type="monotone" dataKey="design" stroke="#10b981" strokeWidth={4} dot={{ r: 6, fill: '#10b981', strokeWidth: 0 }} activeDot={{ r: 8 }} />
                   <Line type="monotone" dataKey="testing" stroke="#f59e0b" strokeWidth={4} dot={{ r: 6, fill: '#f59e0b', strokeWidth: 0 }} activeDot={{ r: 8 }} />
                </LineChart>
             </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <Card className="col-span-2 border-none shadow-2xl rounded-[2.5rem] bg-slate-900 text-white p-8">
            <div className="flex justify-between items-start mb-10">
               <div>
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter">Project Progress</h3>
                  <p className="text-slate-400 text-xs font-medium italic">Tracking delivery speeds across active mission groups.</p>
               </div>
               <BarChart3 className="h-8 w-8 text-indigo-500 opacity-50" />
            </div>
            <div className="h-[250px]">
               <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={data.projects.slice(0, 6).map(p => ({ name: (p.projectName || 'Project').split(' ')[0], velocity: p.progressPercentage }))}>
                     <XAxis dataKey="name" hide />
                     <Bar dataKey="velocity" radius={[20, 20, 0, 0]}>
                        {data.projects.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#4f46e5' : '#818cf8'} />
                        ))}
                     </Bar>
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </Card>

         <Card className="border-none shadow-2xl rounded-[2.5rem] bg-indigo-600 text-white p-8 group overflow-hidden relative">
            <Layers className="absolute -bottom-10 -right-10 h-64 w-64 text-white/5 rotate-12 group-hover:rotate-0 transition-transform duration-1000" />
            <div className="relative z-10 flex flex-col h-full justify-between">
               <div className="space-y-4">
                  <div className="h-14 w-14 rounded-3xl bg-white/10 flex items-center justify-center">
                     <Calendar className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-3xl font-black uppercase tracking-tighter italic leading-none">Milestone<br />Schedules</h3>
                  <p className="text-indigo-100 text-sm italic font-medium opacity-80">Next synchronization window opens in 14 hours across all nodes.</p>
               </div>
               <button className="w-full h-14 bg-white text-indigo-600 rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-indigo-700/50 mt-8">
                   Sync Data
               </button>
            </div>
         </Card>
      </div>
    </div>
  );
};

export default ProjectDashboard;
