import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { 
  PlusCircle, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  LogOut, 
  AlertCircle,
  User,
  Tag
} from 'lucide-react';

const StatusBadge = ({ status }) => {
  const styles = {
    REPORTED: "bg-rose-100 text-rose-700 border-rose-200",
    ASSIGNED: "bg-sky-100 text-sky-700 border-sky-200",
    WORK_IN_PROGRESS: "bg-amber-100 text-amber-700 border-amber-200",
    RESOLVED: "bg-emerald-100 text-emerald-700 border-emerald-200",
    CLOSED: "bg-slate-100 text-slate-700 border-slate-200",
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold border ${styles[status] || styles.REPORTED}`}>
      {status?.replace(/_/g, ' ')}
    </span>
  );
};

export default function StudentDashboard() {
  const { profile, signOut } = useAuth();
  const [issues, setIssues] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    category: 'IT_INFRA'
  });

  const fetchMyIssues = async () => {
    if (!profile?.id) return;
    try {
      const res = await api.get('/issues', {
        headers: { 'User-ID': profile.id }
      });
      setIssues(res.data);
    } catch (err) {
      console.error("Error fetching issues", err);
    }
  };

  const handleCloseIssue = async (id) => {
    try {
      await api.patch(`/issues/${id}/close`);
      alert("Issue marked as closed. Thank you for the feedback!");
      fetchMyIssues();
    } catch (err) {
      alert("Failed to close issue");
    }
  };

  useEffect(() => {
    if (profile) fetchMyIssues();
  }, [profile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/issues', formData, {
        headers: { 'User-ID': profile.id }
      });
      setFormData({ title: '', description: '', location: '', category: 'IT_INFRA' });
      fetchMyIssues();
      alert("Issue Reported Successfully!");
    } catch (err) {
      alert("Failed to report issue");
    }
  };

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* MODERN NAV BAR */}
      <nav className="bg-slate-900 text-white p-4 sticky top-0 z-10 shadow-lg">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500 p-2 rounded-lg">
              <User className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">{profile.full_name}</h1>
              <p className="text-[10px] opacity-70 uppercase tracking-widest">SmartCampus</p>
            </div>
            
          </div>
          <button onClick={signOut} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <LogOut size={20} className="text-red-400" />
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT: REPORT FORM */}
          <div className="lg:col-span-4">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 sticky top-24">
              <h2 className="text-lg font-bold mb-5 flex items-center gap-2 text-slate-800">
                <PlusCircle className="text-blue-600" size={20} />
                Report New Issue
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1 block ml-1">Title</label>
                  <input 
                    type="text" placeholder="Short description" 
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required 
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1 block ml-1">Location</label>
                  <input 
                    type="text" placeholder="Block / Room No." 
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} required 
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1 block ml-1">Category</label>
                  <select 
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none appearance-none"
                    value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                  >
                    <option value="IT_INFRA">IT Infrastructure</option>
                    <option value="ELECTRICAL">Electrical</option>
                    <option value="PLUMBING">Plumbing</option>
                    <option value="CIVIL">Civil</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1 block ml-1">Description</label>
                  <textarea 
                    rows="3" placeholder="Additional details..." 
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                  />
                </div>

                <button className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-[0.98]">
                  Submit Report
                </button>
              </form>
            </div>
          </div>

          {/* RIGHT: LIST */}
          <div className="lg:col-span-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800">My Activity</h2>
              <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2.5 py-1 rounded-full">
                {issues.length} Issues
              </span>
            </div>

            <div className="space-y-4">
              {issues.length === 0 ? (
                <div className="bg-white p-12 rounded-2xl border-2 border-dashed border-slate-200 text-center">
                  <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="text-slate-300" size={32} />
                  </div>
                  <p className="text-slate-500 font-medium italic">No issues reported yet. Everything looks good!</p>
                </div>
              ) : (
                issues.map(issue => (
                  <div key={issue.id} className="group bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 mb-1">
                          <StatusBadge status={issue.status} />
                        </div>
                        <h3 className="font-bold text-slate-800 text-lg leading-tight group-hover:text-blue-600 transition-colors">
                          {issue.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-slate-500 text-xs">
                          <span className="flex items-center gap-1.5">
                            <MapPin size={14} className="text-slate-400" /> {issue.location}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Tag size={14} className="text-slate-400" /> {issue.category.replace('_', ' ')}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock size={14} className="text-slate-400" /> {new Date(issue.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="w-full sm:w-auto">
                      {/* 1. If RESOLVED: Show the action button to close it */}
                      {issue.status === 'RESOLVED' && (
                        <button 
                          onClick={() => handleCloseIssue(issue.id)}
                          className="w-full sm:w-auto bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-700 shadow-md shadow-emerald-100 transition-all flex items-center justify-center gap-2"
                        >
                          <CheckCircle2 size={16} />
                          Confirm Fix
                        </button>
                      )}

                      {/* 2. If CLOSED: Show a permanent success tick mark */}
                      {issue.status === 'CLOSED' && (
                        <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100">
                          <CheckCircle2 size={18} />
                        </div>
                      )}

                      {/* 3. For all other states (REPORTED, ASSIGNED, WIP): Show the waiting icon */}
                      {!['RESOLVED', 'CLOSED'].includes(issue.status) && (
                        <div className="text-slate-300 hidden sm:block pr-4">
                          <Clock size={20} />
                        </div>
                      )}
                    </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}