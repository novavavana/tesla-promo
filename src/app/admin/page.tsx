'use client';

import { useState, useEffect } from 'react';
import { LogOut, RefreshCw, Search, Download, X, Eye, Trash2 } from 'lucide-react';
import Papa from 'papaparse';

type Applicant = {
  id: string;
  full_name: string;
  email_address: string;
  phone_number: string;
  residential_address?: string;
  registration_timestamp: string;
  consent_timestamp?: string;
  sms_delivery_status: string;
  selection_status: string;
};

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);

  useEffect(() => {
    fetch('/api/admin/login')
      .then(res => res.json())
      .then(data => {
        setIsAuthenticated(!!data.authenticated);
        setLoading(false);
        if (data.authenticated) fetchApplicants();
      })
      .catch(() => setLoading(false));
  }, []);

  const fetchApplicants = async () => {
    try {
      const res = await fetch('/api/admin/applicants');
      if (res.ok) {
        const data = await res.json();
        setApplicants(data.applicants || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        setIsAuthenticated(true);
        fetchApplicants();
      } else {
        setLoginError(data.error || 'Invalid credentials');
      }
    } catch {
      setLoginError('Network error');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/login', { method: 'DELETE' });
    setIsAuthenticated(false);
    setApplicants([]);
  };

  const updateStatus = async (id: string, status: string) => {
    await fetch('/api/admin/applicants', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, selectionStatus: status })
    });
    fetchApplicants();
  };

  const deleteApplicant = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete applicant "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch('/api/admin/applicants', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });

      if (res.ok) {
        if (selectedApplicant?.id === id) {
          setSelectedApplicant(null);
        }
        fetchApplicants();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete applicant');
      }
    } catch {
      alert('Network error while deleting applicant');
    }
  };

  const retrySms = async (id: string, phone: string, name: string) => {
    alert(`In a real app, this would call an API route to retry SMS to ${phone} for ${name}`);
    // A real implementation would POST to /api/admin/retry-sms
  };

  const exportCSV = () => {
    const csv = Papa.unparse(applicants);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `applicants_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredApplicants = applicants.filter(a => 
    a.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.email_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.phone_number.includes(searchTerm)
  );

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-center mb-6">Admin Login</h2>
          {loginError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded text-sm text-center">
              {loginError}
            </div>
          )}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-black focus:border-black"
                placeholder="admin@tesla.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-black focus:border-black"
                required
              />
            </div>
            <button type="submit" className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800">
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
          <button onClick={handleLogout} className="flex items-center text-sm text-gray-600 hover:text-black">
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email or phone..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-black focus:border-black"
            />
          </div>
          <div className="flex space-x-3 w-full sm:w-auto">
            <button onClick={fetchApplicants} className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md text-sm hover:bg-gray-50">
              <RefreshCw className="w-4 h-4 mr-2" /> Refresh
            </button>
            <button onClick={exportCSV} className="flex items-center px-4 py-2 bg-black text-white rounded-md text-sm hover:bg-gray-800">
              <Download className="w-4 h-4 mr-2" /> Export CSV
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SMS Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Selection Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredApplicants.map((applicant) => (
                  <tr key={applicant.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{applicant.full_name}</div>
                      <div className="text-sm text-gray-500">{applicant.email_address}</div>
                      <div className="text-sm text-gray-500">{applicant.phone_number}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(applicant.registration_timestamp).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        applicant.sms_delivery_status === 'sent' ? 'bg-green-100 text-green-800' : 
                        applicant.sms_delivery_status === 'failed' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {applicant.sms_delivery_status}
                      </span>
                      {applicant.sms_delivery_status === 'failed' && (
                        <button onClick={() => retrySms(applicant.id, applicant.phone_number, applicant.full_name)} className="ml-2 text-xs text-blue-600 hover:underline">
                          Retry
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <select 
                        value={applicant.selection_status} 
                        onChange={(e) => updateStatus(applicant.id, e.target.value)}
                        className="rounded border-gray-300 text-sm focus:ring-black focus:border-black py-1"
                      >
                        <option value="Pending Review">Pending Review</option>
                        <option value="Selected">Selected</option>
                        <option value="Not Selected">Not Selected</option>
                        <option value="Contacted">Contacted</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          onClick={() => setSelectedApplicant(applicant)}
                          className="inline-flex items-center text-xs font-semibold uppercase tracking-wider text-black bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1 text-gray-500" />
                          View
                        </button>
                        <button 
                          onClick={() => deleteApplicant(applicant.id, applicant.full_name)}
                          className="inline-flex items-center text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 p-1.5 rounded transition-colors"
                          title="Delete applicant"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredApplicants.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      No applicants found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Applicant Details Modal */}
      {selectedApplicant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 relative">
            <div className="flex justify-between items-start pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{selectedApplicant.full_name}</h3>
                <p className="text-xs text-gray-400 font-mono mt-0.5">Ref: #{selectedApplicant.id.split('-')[0].toUpperCase()}</p>
              </div>
              <button 
                onClick={() => setSelectedApplicant(null)} 
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Email</label>
                  <a href={`mailto:${selectedApplicant.email_address}`} className="text-blue-600 hover:underline break-all font-medium">
                    {selectedApplicant.email_address}
                  </a>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Phone Number</label>
                  <p className="font-medium text-gray-800">{selectedApplicant.phone_number}</p>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Residential Address</label>
                <p className="p-3 bg-gray-50 rounded-lg text-gray-800 border border-gray-100 text-sm leading-relaxed whitespace-pre-wrap">
                  {selectedApplicant.residential_address || 'No address provided'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Registered On</label>
                  <p className="text-gray-700 text-xs">
                    {new Date(selectedApplicant.registration_timestamp).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">SMS Delivery</label>
                  <span className={`px-2.5 py-0.5 inline-flex text-xs font-semibold rounded-full ${
                    selectedApplicant.sms_delivery_status === 'sent' ? 'bg-green-100 text-green-800' : 
                    selectedApplicant.sms_delivery_status === 'failed' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {selectedApplicant.sms_delivery_status}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Selection Status</label>
                <select 
                  value={selectedApplicant.selection_status} 
                  onChange={(e) => {
                    updateStatus(selectedApplicant.id, e.target.value);
                    setSelectedApplicant({ ...selectedApplicant, selection_status: e.target.value });
                  }}
                  className="w-full rounded-lg border border-gray-300 py-2 px-3 text-sm focus:ring-black focus:border-black font-medium"
                >
                  <option value="Pending Review">Pending Review</option>
                  <option value="Selected">Selected</option>
                  <option value="Not Selected">Not Selected</option>
                  <option value="Contacted">Contacted</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <a
                  href={`https://wa.me/${selectedApplicant.phone_number.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${selectedApplicant.full_name}, regarding your Tesla Promotion application (Ref: #${selectedApplicant.id.split('-')[0].toUpperCase()})...`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-4 py-2.5 bg-[#25D366] hover:bg-[#20ba59] text-black font-semibold text-xs uppercase tracking-wider rounded-lg transition-colors shadow-sm"
                >
                  Chat on WhatsApp
                </a>
                <button
                  onClick={() => deleteApplicant(selectedApplicant.id, selectedApplicant.full_name)}
                  className="inline-flex items-center justify-center px-3 py-2.5 text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 font-semibold text-xs uppercase tracking-wider rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  Delete
                </button>
              </div>
              <button
                onClick={() => setSelectedApplicant(null)}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-xs uppercase tracking-wider rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
