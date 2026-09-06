import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { Employee } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Users, AlertCircle, RefreshCw, ShieldOff, Mail, Phone, ArrowLeft, ChevronDown, Search } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import { motion } from 'framer-motion';

const StaffDirectory: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'ADMIN';

  const [data, setData] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState<string>('ALL');
  const [isDeptDropdownOpen, setIsDeptDropdownOpen] = useState(false);
  const [deptSearch, setDeptSearch] = useState('');
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get<Employee[]>('/employees');
      setData(response.data);
      setError('');
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError('Access denied. Admin privileges required.');
      } else {
        setError('Failed to fetch staff data. Please ensure the backend is running.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [isAdmin]);

  // ── Access Denied Screen ──
  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="max-w-md w-full"
        >
          <GlassCard heavy className="p-10 text-center relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-red-500/10 blur-[80px] pointer-events-none" />
            
            <div className="relative z-10">
              {/* Icon */}
              <div className="mx-auto w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6">
                <ShieldOff className="h-10 w-10 text-red-400" strokeWidth={1.5} />
              </div>

              <h2 className="text-xl font-bold text-white mb-2">Administrator Access Required</h2>
              <p className="text-sm text-white/40 leading-relaxed mb-2">
                The Staff Directory contains sensitive HR information including employee records, salary grades, and contact details.
              </p>
              <p className="text-xs text-white/25 mb-8">
                Current role: <span className="font-mono text-white/40">{user?.role?.replace('_', ' ')}</span>
              </p>

              <GlassButton
                onClick={() => navigate('/dashboard/inventory')}
                variant="primary"
                leftIcon={<ArrowLeft className="h-4 w-4" strokeWidth={1.75} />}
                size="md"
              >
                Return to Dashboard
              </GlassButton>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    );
  }

  // ── Admin View ──

  // Compute departments for filter pills
  const departments = Array.from(new Set(data.map(e => e.department))).sort();

  // Apply filters
  const filtered = data.filter(emp => {
    const matchesDept = deptFilter === 'ALL' || emp.department === deptFilter;
    const matchesSearch = search === '' || 
      emp.empName.toLowerCase().includes(search.toLowerCase()) ||
      emp.empId.toLowerCase().includes(search.toLowerCase()) ||
      emp.role.toLowerCase().includes(search.toLowerCase()) ||
      emp.department.toLowerCase().includes(search.toLowerCase()) ||
      (emp.email && emp.email.toLowerCase().includes(search.toLowerCase()));
    return matchesDept && matchesSearch;
  });

  const ITEMS_PER_PAGE = 25;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedData = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // Reset page when filters change
  useEffect(() => { setCurrentPage(1); }, [deptFilter, search]);

  // Stats
  const activeCount = data.filter(e => e.status === 'Active').length;
  const onLeaveCount = data.filter(e => e.status === 'On Leave').length;
  const deptCount = departments.length;

  // Build a name lookup for reportingTo
  const nameMap = new Map(data.map(e => [e.empId, e.empName]));

  const statusBadge = (status: string | null) => {
    if (status === 'Active') return 'badge-success';
    if (status === 'On Leave') return 'badge-warning';
    if (status === 'Terminated') return 'badge-danger';
    return 'badge-neutral';
  };

  const shiftBadge = (shift: string | null) => {
    if (shift === 'Day') return 'badge-accent';
    if (shift === 'Night') return 'badge-neutral';
    if (shift === 'Rotational') return 'badge-warning';
    return 'badge-neutral';
  };

  return (
    <div className="space-y-6" onClick={() => setIsDeptDropdownOpen(false)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header">
            <Users className="page-header-icon" strokeWidth={1.75} />
            Staff Directory
          </h1>
          <p className="text-sm text-white/30 mt-1 ml-11">Employee records across all departments</p>
        </div>
        <GlassButton onClick={fetchData} isLoading={loading} leftIcon={<RefreshCw className="h-4 w-4" strokeWidth={1.75} />} size="sm">
          Refresh
        </GlassButton>
      </div>

      {/* Stats */}
      {!loading && data.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <GlassCard className="stat-card">
            <p className="stat-label">Total Staff</p>
            <p className="stat-value">{data.length}</p>
          </GlassCard>
          <GlassCard className="stat-card">
            <p className="stat-label">Active</p>
            <p className="stat-value text-emerald-400">{activeCount}</p>
          </GlassCard>
          <GlassCard className="stat-card">
            <p className="stat-label">On Leave</p>
            <p className="stat-value text-amber-400">{onLeaveCount}</p>
          </GlassCard>
          <GlassCard className="stat-card">
            <p className="stat-label">Departments</p>
            <p className="stat-value">{deptCount}</p>
          </GlassCard>
        </div>
      )}

      {error && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <GlassCard className="p-4 bg-red-500/5 border-red-500/20 flex items-start gap-3">
            <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" strokeWidth={1.75} />
            <p className="text-sm text-red-300/80">{error}</p>
          </GlassCard>
        </motion.div>
      )}

      {/* Search + Department Filter */}
      {!loading && data.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, ID, role, or email..."
              className="glass-input w-full px-4 py-2.5 text-sm pl-10"
            />
            <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25 pointer-events-none" strokeWidth={1.75} />
          </div>
          {/* Department Dropdown */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setIsDeptDropdownOpen(!isDeptDropdownOpen)}
              className="glass-input h-[42px] px-4 flex items-center justify-between gap-3 min-w-[200px] text-sm hover:bg-white/[0.06]"
            >
              <span className={deptFilter === 'ALL' ? 'text-white/60' : 'text-indigo-300'}>
                {deptFilter === 'ALL' ? 'All Departments' : deptFilter}
              </span>
              <ChevronDown className={`h-4 w-4 text-white/40 transition-transform ${isDeptDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDeptDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col">
                <div className="p-2 border-b border-white/10 bg-white/[0.02]">
                  <div className="relative">
                    <input
                      type="text"
                      value={deptSearch}
                      onChange={(e) => setDeptSearch(e.target.value)}
                      placeholder="Search departments..."
                      className="w-full bg-white/[0.04] border border-white/10 rounded-lg py-2 pl-9 pr-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 focus:bg-white/[0.08]"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                  </div>
                </div>
                <div className="max-h-64 overflow-y-auto p-1 scrollbar-thin">
                  <button
                    onClick={() => {
                      setDeptFilter('ALL');
                      setIsDeptDropdownOpen(false);
                      setDeptSearch('');
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      deptFilter === 'ALL' ? 'bg-indigo-500/20 text-indigo-300' : 'text-white/70 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    All Departments
                  </button>
                  {departments
                    .filter(d => d.toLowerCase().includes(deptSearch.toLowerCase()))
                    .map((dept) => (
                      <button
                        key={dept}
                        onClick={() => {
                          setDeptFilter(dept);
                          setIsDeptDropdownOpen(false);
                          setDeptSearch('');
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          deptFilter === dept ? 'bg-indigo-500/20 text-indigo-300' : 'text-white/70 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        {dept}
                      </button>
                    ))}
                  {departments.filter(d => d.toLowerCase().includes(deptSearch.toLowerCase())).length === 0 && (
                    <div className="px-3 py-4 text-center text-sm text-white/40">
                      No departments found
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <GlassCard className="overflow-hidden">
        {loading && data.length === 0 ? (
          <SkeletonLoader rows={12} columns={7} />
        ) : (
          <div className="flex flex-col">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Department</th>
                    <th>Role</th>
                    <th>Shift</th>
                    <th>Grade</th>
                    <th>Status</th>
                    <th>Contact</th>
                    <th>Reports To</th>
                    <th>Hire Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-16 text-center">
                        <Users className="h-10 w-10 mx-auto text-white/10 mb-3" strokeWidth={1.5} />
                        <p className="text-sm font-medium text-white/40">
                          {search || deptFilter !== 'ALL' ? 'No employees match your filters' : 'No Staff Records'}
                        </p>
                        <p className="text-xs mt-1 text-white/20">
                          {search || deptFilter !== 'ALL' ? 'Try adjusting your search or department filter.' : 'Employee records will appear once added.'}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    paginatedData.map((emp, idx) => (
                      <motion.tr
                        key={emp.empId}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.02 }}
                      >
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500/60 to-violet-600/60 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-lg shadow-indigo-500/10">
                              {emp.empName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-white/90">{emp.empName}</div>
                              <div className="text-[11px] text-white/30 font-mono mt-0.5">{emp.empId}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="text-sm text-white/60">{emp.department}</span>
                        </td>
                        <td>
                          <span className="text-sm text-white/50">{emp.role}</span>
                        </td>
                        <td>
                          <span className={`badge ${shiftBadge(emp.shift)}`}>{emp.shift || '—'}</span>
                        </td>
                        <td>
                          <span className="text-sm font-mono font-medium text-indigo-300/70">{emp.salaryGrade || '—'}</span>
                        </td>
                        <td>
                          <span className={`badge ${statusBadge(emp.status)}`}>{emp.status || '—'}</span>
                        </td>
                        <td>
                          <div className="space-y-1">
                            {emp.email && (
                              <div className="flex items-center gap-1.5 text-white/35">
                                <Mail className="h-3 w-3 shrink-0" strokeWidth={1.75} />
                                <span className="text-[11px] font-mono truncate max-w-[160px]">{emp.email}</span>
                              </div>
                            )}
                            {emp.phone && (
                              <div className="flex items-center gap-1.5 text-white/35">
                                <Phone className="h-3 w-3 shrink-0" strokeWidth={1.75} />
                                <span className="text-[11px] font-mono">{emp.phone}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td>
                          {emp.reportingTo ? (
                            <div>
                              <span className="text-sm text-white/50">{nameMap.get(emp.reportingTo) || emp.reportingTo}</span>
                              <div className="text-[10px] text-white/20 font-mono mt-0.5">{emp.reportingTo}</div>
                            </div>
                          ) : (
                            <span className="text-xs text-white/20">—</span>
                          )}
                        </td>
                        <td>
                          <span className="text-sm text-white/35 font-mono tabular-nums">{emp.hireDate}</span>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {totalPages > 1 && (
              <div className="pagination-bar">
                <span>{((currentPage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}</span>
                <div className="flex gap-2">
                  <GlassButton onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} size="sm">Previous</GlassButton>
                  <GlassButton onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} size="sm">Next</GlassButton>
                </div>
              </div>
            )}
          </div>
        )}
      </GlassCard>
    </div>
  );
};

export default StaffDirectory;
