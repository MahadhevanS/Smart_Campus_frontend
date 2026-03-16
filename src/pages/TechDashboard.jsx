import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Check, Play, MapPin } from 'lucide-react';

export default function TechDashboard() {
  const { profile, signOut } = useAuth();
  const [issues, setIssues] = useState([]);

  const fetchMyTasks = async () => {
    if (!profile?.id) return;
    try {
      // Filter issues by the logged-in technician's ID
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
      fetchMyTasks(); // Refresh list
    } catch (err) {
      alert("Error updating status");
    }
  };

  if (!profile) return null;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Technician Panel</h1>
          <p className="text-gray-500 text-sm">Logged in as: {profile.fullName}</p>
        </div>
        <button onClick={signOut} className="text-red-500 font-medium">Logout</button>
      </div>

      <div className="grid gap-4">
        {issues.length === 0 && <p className="text-center py-10 text-gray-400">No tasks assigned to you yet.</p>}
        
        {issues.map(issue => (
          <div key={issue.id} className="bg-white p-5 rounded-xl border shadow-sm flex justify-between items-center">
            <div className="space-y-1">
              <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded">
                {issue.category}
              </span>
              <h3 className="text-lg font-bold text-gray-800">{issue.title}</h3>
              <p className="text-gray-600 text-sm flex items-center"><MapPin size={14} className="mr-1"/> {issue.location}</p>
              <p className="text-gray-500 text-sm">{issue.description}</p>
            </div>

            <div className="flex gap-2">
              
              {issue.status === 'ASSIGNED' && (
                <button 
                  onClick={() => handleUpdateStatus(issue.id, 'WORK_IN_PROGRESS')}
                  className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  <Play size={16} className="mr-2"/> Start Work
                </button>
              )}

              {issue.status === 'WORK_IN_PROGRESS' && (
                <button 
                  onClick={() => handleUpdateStatus(issue.id, 'RESOLVED')}
                  className="flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                >
                  <Check size={16} className="mr-2"/> Mark Resolved
                </button>
              )}

              {issue.status === 'RESOLVED' && (
                <span className="text-green-600 font-bold px-4 flex items-center">
                  <Check size={16} className="mr-1"/> Waiting for Raiser to Close
                </span>
              )}

              {issue.status === 'CLOSED' && (
                <span className="text-gray-400 font-bold px-4 italic">Task Completed</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}