import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Layers,
} from "lucide-react";
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
  Line,
  Legend,
  LabelList,
} from "recharts";
import { apiFetch } from "@/services/api";

const ProjectDashboard = () => {
  const [data, setData] = useState({
    projects: [],
    loading: true,
    stats: {
      total: 0,
      active: 0,
      completed: 0,
      onHold: 0,
      resourceUtilization: 78, // Mocked for now
    },
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await apiFetch("/project");
        const projects = Array.isArray(res?.data || res)
          ? res?.data || res
          : [];

        setData({
          projects,
          loading: false,
          stats: {
            total: projects.length,
            active: projects.filter((p) => p.projectStatus === "IN_PROGRESS")
              .length,
            completed: projects.filter((p) => p.projectStatus === "COMPLETED")
              .length,
            onHold: projects.filter((p) => p.projectStatus === "ON_HOLD")
              .length,
            resourceUtilization: 65 + Math.floor(Math.random() * 20),
          },
        });
      } catch (error) {
        console.error("Failed to load project dashboard data");
      }
    };
    fetchDashboardData();
  }, []);

  const projectStatusData = [
    { name: "Active", value: data.stats.active, color: "#4f46e5" },
    { name: "Completed", value: data.stats.completed, color: "#10b981" },
  ];

  const totalChartValue =
    projectStatusData.reduce((acc, curr) => acc + curr.value, 0) || 1;

  const workloadData = [
    { week: "W1", development: 45, design: 30, testing: 25 },
    { week: "W2", development: 52, design: 35, testing: 30 },
    { week: "W3", development: 48, design: 40, testing: 35 },
    { week: "W4", development: 61, design: 38, testing: 42 },
  ];

  if (data.loading) {
    return (
      <div className="h-[80vh] flex items-center justify-center font-black text-slate-200 text-6xl italic animate-pulse">
        ORCHESTRATING...
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tighter text-slate-900 italic uppercase">
            Project Board
          </h1>
          <p className="text-muted-foreground font-bold italic tracking-tight">
            Track project progress and resource status across the company.
          </p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border flex items-center gap-3">
            <Activity className="h-5 w-5 text-indigo-600 animate-pulse" />
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">
              System Status: Active
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          {
            label: "Total Projects",
            value: data.stats.total,
            icon: Briefcase,
            color: "text-blue-600",
            bg: "bg-blue-500/10",
          },
          {
            label: "Active Projects",
            value: data.stats.active,
            icon: TrendingUp,
            color: "text-indigo-600",
            bg: "bg-indigo-500/10",
          },
          {
            label: "Workforce Hub",
            value: `${data.stats.resourceUtilization}%`,
            icon: Users,
            color: "text-emerald-600",
            bg: "bg-emerald-500/10",
          },
          {
            label: "System status",
            value: "Live",
            icon: CheckCircle2,
            color: "text-purple-600",
            bg: "bg-purple-500/10",
          },
        ].map((stat, i) => (
          <Card
            key={i}
            className="border-none shadow-xl rounded-3xl p-6 bg-white transition-all hover:-translate-y-1 hover:shadow-2xl"
          >
            <div className="flex items-center gap-4">
              <div
                className={`h-12 w-12 rounded-2xl ${stat.bg} flex items-center justify-center ${stat.color}`}
              >
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">
                  {stat.label}
                </p>
                <h4 className="text-2xl font-black tracking-tight">
                  {stat.value}
                </h4>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Status Distribution */}
        <Card className="border-none shadow-2xl rounded-[2.5rem] bg-white overflow-hidden p-8">
          <CardHeader className="p-0 mb-8 flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-black uppercase tracking-tighter italic">
              Project Status
            </CardTitle>
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
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-black uppercase tracking-tight text-slate-500">
                        {item.name}
                      </span>
                      <span className="text-sm font-black">
                        {Math.round((item.value / totalChartValue) * 100) || 0}%
                      </span>
                    </div>
                    <div className="h-1 w-full bg-slate-100 rounded-full mt-1 overflow-hidden">
                      <div
                        className="h-full"
                        style={{
                          width: `${(item.value / totalChartValue) * 100 || 0}%`,
                          backgroundColor: item.color,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Workload Telemetry */}
        <Card className="border border-white/10 shadow-[0_20px_50px_rgba(0,_0,_0,_0.2)] rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden p-8 relative group">
          <div className="absolute top-0 right-0 h-64 w-64 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-emerald-500/20 transition-all duration-1000" />
          <CardHeader className="p-0 mb-8 flex flex-row items-center justify-between relative z-10">
            <div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <CardTitle className="text-2xl font-black uppercase tracking-tighter italic text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300">
                  Workload Status
                </CardTitle>
              </div>
              <p className="text-slate-400 text-[10px] font-bold tracking-widest uppercase mt-1">
                Resource allocation timeline
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md transition-transform duration-500 group-hover:scale-110">
              <TrendingUp className="h-5 w-5 text-emerald-400" />
            </div>
          </CardHeader>
          <div className="h-[350px] relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={workloadData}
                margin={{ top: 30, right: 30, left: 10, bottom: 10 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#ffffff10"
                />
                <XAxis
                  dataKey="week"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 800 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 11, fontWeight: 700 }}
                  dx={-10}
                  width={40}
                  domain={[0, "dataMax + 15"]}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "16px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    backgroundColor: "rgba(15, 23, 42, 0.9)",
                    color: "#f8fafc",
                    boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
                    fontWeight: "bold",
                  }}
                  itemStyle={{ color: "#fff" }}
                />
                <Legend
                  iconType="circle"
                  wrapperStyle={{
                    fontSize: "11px",
                    fontWeight: "bold",
                    paddingTop: "10px",
                  }}
                />
                <Line
                  name="Development"
                  type="monotone"
                  dataKey="development"
                  stroke="#818cf8"
                  strokeWidth={4}
                  dot={{ r: 4, fill: "#818cf8", strokeWidth: 0 }}
                  activeDot={{
                    r: 8,
                    fill: "#fff",
                    stroke: "#818cf8",
                    strokeWidth: 2,
                  }}
                >
                  <LabelList
                    dataKey="development"
                    position="top"
                    fill="#818cf8"
                    fontSize={11}
                    fontWeight="bold"
                    offset={10}
                  />
                </Line>
                <Line
                  name="Design"
                  type="monotone"
                  dataKey="design"
                  stroke="#34d399"
                  strokeWidth={4}
                  dot={{ r: 4, fill: "#34d399", strokeWidth: 0 }}
                  activeDot={{
                    r: 8,
                    fill: "#fff",
                    stroke: "#34d399",
                    strokeWidth: 2,
                  }}
                >
                  <LabelList
                    dataKey="design"
                    position="bottom"
                    fill="#34d399"
                    fontSize={11}
                    fontWeight="bold"
                    offset={10}
                  />
                </Line>
                <Line
                  name="Testing"
                  type="monotone"
                  dataKey="testing"
                  stroke="#fbbf24"
                  strokeWidth={4}
                  dot={{ r: 4, fill: "#fbbf24", strokeWidth: 0 }}
                  activeDot={{
                    r: 8,
                    fill: "#fff",
                    stroke: "#fbbf24",
                    strokeWidth: 2,
                  }}
                >
                  <LabelList
                    dataKey="testing"
                    position="bottom"
                    fill="#fbbf24"
                    fontSize={11}
                    fontWeight="bold"
                    offset={10}
                  />
                </Line>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="w-full">
        <Card className="border border-white/10 shadow-[0_20px_50px_rgba(8,_112,_184,_0.15)] rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white p-8 relative overflow-hidden group">
          {/* Ambient Background Glow */}
          <div className="absolute -top-40 -right-40 h-96 w-96 bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none group-hover:bg-indigo-500/30 transition-all duration-1000" />

          <div className="flex justify-between items-start mb-10 relative z-10">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
                <h3 className="text-3xl font-black italic uppercase tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-200">
                  Project Progress
                </h3>
              </div>
              <p className="text-indigo-200/60 text-xs font-bold tracking-widest uppercase">
                Real-time Completion Status Across Active Projects
              </p>
            </div>
            <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-xl shadow-inner group-hover:scale-110 transition-transform duration-500">
              <BarChart3 className="h-7 w-7 text-indigo-400" />
            </div>
          </div>

          <div className="h-[300px] relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.projects
                  .slice(0, 10)
                  .map((p) => ({
                    name: p.projectName || "Project",
                    velocity: p.progressPercentage || 0,
                  }))}
                margin={{ top: 20, right: 0, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="colorVelocity"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#818cf8" stopOpacity={1} />
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity={1} />
                  </linearGradient>
                  <linearGradient
                    id="colorVelocityAlt"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity={1} />
                    <stop offset="100%" stopColor="#0ea5e9" stopOpacity={1} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#ffffff15"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "#94a3b8",
                    fontSize: 12,
                    fontWeight: 800,
                    textTransform: "uppercase",
                  }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 11, fontWeight: 700 }}
                  dx={-10}
                />
                <Tooltip
                  cursor={{ fill: "#ffffff0a" }}
                  contentStyle={{
                    borderRadius: "20px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    backgroundColor: "rgba(15, 23, 42, 0.9)",
                    color: "#f8fafc",
                    backdropFilter: "blur(10px)",
                    fontWeight: "black",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                  }}
                  itemStyle={{ color: "#818cf8" }}
                />
                <Bar dataKey="velocity" radius={[12, 12, 0, 0]} maxBarSize={50}>
                  {data.projects.slice(0, 10).map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        index % 2 === 0
                          ? "url(#colorVelocity)"
                          : "url(#colorVelocityAlt)"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ProjectDashboard;
