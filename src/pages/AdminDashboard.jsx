import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { 
  UserPlus, 
  Clock, 
  MapPin, 
  LogOut, 
  TrendingUp, 
  LayoutDashboard, 
  CheckCircle2,
  Filter
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function AdminDashboard() {
  const { signOut } = useAuth();
  const [issues, setIssues] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [selectedTechs, setSelectedTechs] = useState({});
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('PENDING'); // PENDING, ASSIGNED, COMPLETED

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  const fetchData = async () => {
    try {
      const [statsRes, issuesRes, techRes] = await Promise.all([
        api.get('/issues/stats'),
        api.get('/issues'),
        api.get('/issues/technicians')
      ]);
      setStats(statsRes.data);
      setIssues(issuesRes.data);
      setTechnicians(techRes.data);
    } catch (err) {
      console.error("Error fetching admin data", err);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchData();

    // Set up an interval to refresh data every 10 seconds
    const interval = setInterval(() => {
      fetchData();
    }, 10000); 

    // Clean up the interval when the admin leaves the page
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleAssign = async (issueId) => {
    const techId = selectedTechs[issueId];
    if (!techId) return alert("Please select a technician first");

    try {
      await api.patch(`/issues/${issueId}/assign`, null, {
        params: { technicianId: techId }
      });
      alert("Technician Assigned!");
      fetchData();
    } catch (err) {
      alert("Assignment failed");
    }
  };

  // Tab Filtering Logic
  const filteredIssues = issues.filter(issue => {
    if (activeTab === 'PENDING') return issue.status === 'REPORTED';
    if (activeTab === 'ASSIGNED') return ['ASSIGNED', 'WORK_IN_PROGRESS','RESOLVED'].includes(issue.status);
    return ['CLOSED'].includes(issue.status);
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* UNIFIED NAV BAR */}
      <nav className="bg-slate-900 text-white p-4 sticky top-0 z-10 shadow-lg">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500 p-2 rounded-lg">
              <LayoutDashboard className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">Admin Console</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Smart Campus</p>
            </div>
          </div>
          <button onClick={signOut} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <LogOut size={20} className="text-red-400" />
          </button>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        
        {/* ANALYTICS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
          
          {/* Stat Cards */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <p className="text-slate-400 text-xs font-bold uppercase mb-2">Total Tickets</p>
              <p className="text-3xl font-black text-slate-800">{stats?.totalIssues || 0}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <p className="text-emerald-500 text-xs font-bold uppercase mb-2">Resolved</p>
              <p className="text-3xl font-black text-slate-800">{stats?.resolvedIssues || 0}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <p className="text-amber-500 text-xs font-bold uppercase mb-2">Pending</p>
              <p className="text-3xl font-black text-slate-800">{stats?.openIssues || 0}</p>
            </div>
            {/* Speed Banner */}
            <div className="sm:col-span-3 bg-slate-900 p-6 rounded-2xl shadow-lg text-white flex justify-between items-center overflow-hidden relative">
               <div className="relative z-10">
                  <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-1">System Efficiency</p>
                  <p className="text-3xl font-black">{stats?.avgResolutionTime || '0.0'} <span className="text-lg font-normal opacity-60">Avg. Hours to Fix</span></p>
               </div>
               <TrendingUp size={80} className="absolute -right-4 -bottom-4 text-white opacity-10" />
            </div>
          </div>

          {/* Chart Card */}
          <div className="lg:col-span-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center">
            <h3 className="font-bold text-slate-800 mb-4 self-start flex items-center gap-2">
               <Filter size={16} className="text-blue-600" /> Category Split
            </h3>
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={Object.entries(stats?.categoryData || {}).map(([name, value]) => ({ name, value }))} 
                    cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={8} dataKey="value"
                  >
                    {Object.keys(stats?.categoryData || {}).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-3 mt-4">
               {Object.keys(stats?.categoryData || {}).map((cat, i) => (
                  <div key={cat} className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase">
                     <div className="w-2 h-2 rounded-full" style={{backgroundColor: COLORS[i % COLORS.length]}}></div>
                     {cat.replace('_', ' ')}
                  </div>
               ))}
            </div>
          </div>
        </div>

        {/* TAB NAVIGATION */}
        <div className="flex bg-slate-200/50 p-1 rounded-xl w-fit mb-8">
          {['PENDING', 'ASSIGNED', 'COMPLETED'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === tab 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ISSUE QUEUE */}
        <div className="space-y-4">
          {filteredIssues.length === 0 ? (
            <div className="bg-white p-16 rounded-2xl border-2 border-dashed border-slate-200 text-center">
              <CheckCircle2 className="mx-auto text-slate-200 mb-4" size={48} />
              <p className="text-slate-400 font-medium">No tickets found in this category.</p>
            </div>
          ) : (
            filteredIssues.map(issue => (
              <div key={issue.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-200 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded tracking-widest uppercase ${
                      issue.status === 'REPORTED' ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {issue.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-1">{issue.title}</h3>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1.5"><MapPin size={14} /> {issue.location}</span>
                    <span className="flex items-center gap-1.5"><Clock size={14} /> {new Date(issue.createdAt).toLocaleDateString()}</span>
                    <span className="bg-slate-50 text-slate-500 px-2 py-0.5 rounded border border-slate-100 font-bold text-[10px]">{issue.category}</span>
                  </div>
                </div>

                {/* ASSIGNMENT AREA */}
                {activeTab === 'PENDING' ? (
                  <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-100">
                    <select 
                      className="bg-transparent p-2 text-sm font-medium text-slate-600 outline-none min-w-[140px]"
                      onChange={(e) => setSelectedTechs({...selectedTechs, [issue.id]: e.target.value})}
                      defaultValue=""
                    >
                      <option value="" disabled>Select Tech</option>
                      {technicians.map(tech => (
                        <option key={tech.id} value={tech.id}>{tech.fullName}</option>
                      ))}
                    </select>
                    <button 
                      onClick={() => handleAssign(issue.id)}
                      className="bg-blue-600 text-white p-2.5 rounded-lg hover:bg-blue-700 transition shadow-md shadow-blue-100"
                    >
                      <UserPlus size={18} />
                    </button>
                  </div>
                ) : (
                  <div className="text-right">
                     <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Assigned To</p>
                     <p className="text-sm font-bold text-slate-700">{technicians.find(t => t.id === issue.assignedTo)?.fullName || 'Technician'}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}