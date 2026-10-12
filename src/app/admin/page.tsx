'use client';

import { useState, useEffect } from 'react';
import { LogOut, RefreshCw, Search, Download } from 'lucide-react';
import Papa from 'papaparse';

type Applicant = {
  id: string;
  full_name: string;
  email_address: string;
  phone_number: string;
  registration_timestamp: string;
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
                      <button className="text-black hover:text-gray-700">View</button>
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
    </div>
  );
}
