import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { UserPlus, Clock, MapPin, ClipboardList } from 'lucide-react';

export default function AdminDashboard() {
  const { signOut } = useAuth();
  const [issues, setIssues] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [selectedTechs, setSelectedTechs] = useState({}); // Track selection per issue

  const fetchData = async () => {
    try {
      // 1. Fetch all issues
      const issuesRes = await api.get('/issues');
      setIssues(issuesRes.data);

      // 2. Fetch all technicians for the dropdown
      const techRes = await api.get('/issues/technicians');
      setTechnicians(techRes.data);
    } catch (err) {
      console.error("Error fetching admin data", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssign = async (issueId) => {
    const techId = selectedTechs[issueId];
    if (!techId) return alert("Please select a technician first");

    try {
      await api.patch(`/issues/${issueId}/assign`, null, {
        params: { technicianId: techId }
      });
      alert("Technician Assigned!");
      fetchData(); // Refresh list
    } catch (err) {
      alert("Assignment failed");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Admin Command Center</h1>
        <button onClick={signOut} className="text-red-500 font-medium">Logout</button>
      </div>

      <div className="space-y-6">
        <h2 className="text-lg font-semibold flex items-center">
          <ClipboardList className="mr-2" /> Open Complaints Queue
        </h2>

        {issues.filter(i => i.status === 'REPORTED').map(issue => (
          <div key={issue.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded">NEW</span>
                <span className="text-gray-400 text-xs">#{issue.id}</span>
              </div>
              <h3 className="text-lg font-bold">{issue.title}</h3>
              <p className="text-gray-500 text-sm mb-2">{issue.description}</p>
              <div className="flex items-center text-gray-400 text-sm gap-4">
                <span className="flex items-center"><MapPin size={14} className="mr-1"/> {issue.location}</span>
                <span className="flex items-center"><Clock size={14} className="mr-1"/> {new Date(issue.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <select 
                className="p-2 border rounded-lg text-sm bg-gray-50"
                onChange={(e) => setSelectedTechs({...selectedTechs, [issue.id]: e.target.value})}
                defaultValue=""
              >
                <option value="" disabled>Select Technician</option>
                {technicians.map(tech => (
                  <option key={tech.id} value={tech.id}>
                    {tech.fullName} ({tech.specialization || 'General'})
                  </option>
                ))}
              </select>
              <button 
                onClick={() => handleAssign(issue.id)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center transition"
              >
                <UserPlus size={16} className="mr-2"/> Assign
              </button>
            </div>
          </div>
        ))}

        {issues.filter(i => i.status === 'REPORTED').length === 0 && (
          <div className="text-center py-10 bg-gray-50 rounded-xl border-2 border-dashed">
            <p className="text-gray-500">All caught up! No new issues to assign.</p>
          </div>
        )}
      </div>
    </div>
  );
}