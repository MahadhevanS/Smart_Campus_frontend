import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

// 1. PLACE StatusBadge HERE (Outside the main function)
const StatusBadge = ({ status }) => {
  const styles = {
    REPORTED: "bg-red-100 text-red-700",
    ASSIGNED: "bg-blue-100 text-blue-700",
    WORK_IN_PROGRESS: "bg-orange-100 text-orange-700",
    RESOLVED: "bg-green-100 text-green-700",
    CLOSED: "bg-gray-100 text-gray-700",
  };

  return (
    <span className={`px-2 py-1 rounded text-xs font-bold ${styles[status] || styles.REPORTED}`}>
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

  // 2. PLACE handleCloseIssue HERE (Inside the component)
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

  if (!profile) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Campus Issue Tracker</h1>
        <button onClick={signOut} className="text-red-500 font-medium hover:underline">Logout</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-fit">
          <h2 className="text-lg font-semibold mb-4 text-blue-600">Report New Issue</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input 
              type="text" placeholder="Title (e.g. Fan not working)" 
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required 
            />
            <textarea 
              placeholder="Description" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
            />
            <input 
              type="text" placeholder="Location (e.g. I-Block 302)" 
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} required 
            />
            <select 
              className="w-full p-2 border rounded-lg bg-white"
              value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
            >
              <option value="IT_INFRA">IT Infrastructure</option>
              <option value="ELECTRICAL">Electrical</option>
              <option value="PLUMBING">Plumbing</option>
              <option value="CIVIL">Civil</option>
            </select>
            <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition duration-200">
              Submit Report
            </button>
          </form>
        </div>

        <div className="md:col-span-2">
          <h2 className="text-lg font-semibold mb-4">My Reported Issues</h2>
          <div className="space-y-4">
            {issues.length === 0 && <p className="text-gray-500 italic">No issues reported yet.</p>}
            {issues.map(issue => (
              <div key={issue.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center hover:border-gray-300 transition">
                <div>
                  <h3 className="font-bold text-gray-700">{issue.title}</h3>
                  <p className="text-sm text-gray-500">{issue.location} • {issue.category}</p>
                </div>
                <div className="flex items-center gap-4">
                  {issue.status === 'RESOLVED' && (
                    <button 
                      onClick={() => handleCloseIssue(issue.id)}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-green-700 transition"
                    >
                      Confirm Fix & Close
                    </button>
                  )}
                  <StatusBadge status={issue.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}