import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Check, Play, MapPin, LogOut, Clock, Briefcase, CheckCircle2, ListFilter } from 'lucide-react';

export default function TechDashboard() {
  const { profile, signOut } = useAuth();
  const [issues, setIssues] = useState([]);
  const [filter, setFilter] = useState('ACTIVE'); 

  const fetchMyTasks = async () => {
    if (!profile?.id) return;
    try {
      const res = await api.get('/issues', {
        headers: { 'User-ID': profile.id }
      });
      setIssues(res.data);
    } catch (err) {
      console.error("Error fetching tech tasks", err);
    }
  };

  useEffect(() => {
    fetchMyTasks();
  }, [profile]);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await api.patch(`/issues/${id}/status?status=${newStatus}`);
      fetchMyTasks();
    } catch (err) {
      alert("Error updating status");
    }
  };

  if (!profile) return null;

  // Filter logic: ACTIVE = Assigned or WIP. COMPLETED = Resolved or Closed.
  const filteredIssues = issues.filter(issue => {
    if (filter === 'ACTIVE') return ['ASSIGNED', 'WORK_IN_PROGRESS', 'RESOLVED'].includes(issue.status);
    return ['CLOSED'].includes(issue.status);
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* COMPACT TOP NAV */}
      <nav className="bg-slate-900 text-white p-4 sticky top-0 z-10 shadow-lg">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500 p-2 rounded-lg">
              <Briefcase size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">Tech Console</h1>
              <p className="text-[10px] opacity-70 uppercase tracking-widest">{profile.full_name}</p>
            </div>
          </div>
          <button onClick={signOut} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <LogOut size={20} className="text-red-400" />
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto p-4 md:p-6">
        {/* TASK SUMMARY BAR */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button 
            onClick={() => setFilter('ACTIVE')}
            className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 ${
              filter === 'ACTIVE' 
              ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm' 
              : 'bg-white border-transparent text-gray-500'
            }`}
          >
            <span className="text-2xl font-black">{issues.filter(i => ['ASSIGNED', 'WORK_IN_PROGRESS','RESOLVED'].includes(i.status)).length}</span>
            <span className="text-[10px] font-bold uppercase tracking-tighter">Active Tasks</span>
          </button>
          <button 
            onClick={() => setFilter('COMPLETED')}
            className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 ${
              filter === 'COMPLETED' 
              ? 'bg-green-50 border-green-500 text-green-700 shadow-sm' 
              : 'bg-white border-transparent text-gray-500'
            }`}
          >
            <span className="text-2xl font-black">{issues.filter(i => ['CLOSED'].includes(i.status)).length}</span>
            <span className="text-[10px] font-bold uppercase tracking-tighter">Completed</span>
          </button>
        </div>

        {/* TASK LIST */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <ListFilter size={14} /> {filter} Queue
          </h2>

          {filteredIssues.length === 0 && (
            <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-gray-200">
              <CheckCircle2 size={48} className="mx-auto text-gray-200 mb-4" />
              <p className="text-gray-400 font-medium">No {filter.toLowerCase()} tasks found.</p>
            </div>
          )}

          {filteredIssues.map(issue => (
            <div key={issue.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-tighter ${
                    issue.status === 'WORK_IN_PROGRESS' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                  }`}>
                    {issue.status.replace(/_/g, ' ')}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-gray-800 mb-1">{issue.title}</h3>
                <p className="text-gray-500 text-sm mb-4 line-clamp-2">{issue.description}</p>
                
                <div className="flex flex-wrap gap-4 text-xs text-gray-400 border-t pt-4">
                  <span className="flex items-center gap-1"><MapPin size={14} /> {issue.location}</span>
                  <span className="flex items-center gap-1"><Clock size={14} /> {new Date(issue.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* ACTION AREA */}
              <div className="bg-gray-50 p-3 flex justify-end gap-2 border-t border-gray-100">
                {issue.status === 'ASSIGNED' && (
                  <button 
                    onClick={() => handleUpdateStatus(issue.id, 'WORK_IN_PROGRESS')}
                    className="w-full sm:w-auto flex items-center justify-center bg-blue-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-blue-700 active:scale-95 transition-all shadow-md shadow-blue-100"
                  >
                    <Play size={16} className="mr-2 fill-current"/> Start Task
                  </button>
                )}

                {issue.status === 'WORK_IN_PROGRESS' && (
                  <button 
                    onClick={() => handleUpdateStatus(issue.id, 'RESOLVED')}
                    className="w-full sm:w-auto flex items-center justify-center bg-green-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-green-700 active:scale-95 transition-all shadow-md shadow-green-100"
                  >
                    <Check size={18} className="mr-2 stroke-[3px]"/> Mark as Fixed
                  </button>
                )}

                {issue.status === 'RESOLVED' && (
                  <div className="flex items-center gap-2 text-green-600 font-bold text-xs py-2 px-4 italic">
                    <Clock size={14} /> Awaiting user confirmation
                  </div>
                )}

                {issue.status === 'CLOSED' && (
                  <div className="flex items-center gap-2 text-gray-400 font-bold text-xs py-2 px-4">
                    <CheckCircle2 size={14} /> Job Complete
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}