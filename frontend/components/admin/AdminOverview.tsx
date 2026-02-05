'use client';

import { useState, useEffect } from 'react';
import { getAdminDashboardStats } from '@/utils/adminFunctions';
import { AdminDashboardStats } from '@/types/admin';
import SmallLoading from '@/components/smallLoading';

const AdminOverview = () => {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      const result = await getAdminDashboardStats();
      if (result.success && result.data) {
        setStats(result.data);
      } else {
        setError(result.error || 'Failed to load stats');
      }
      setLoading(false);
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <SmallLoading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const statCards = [
    { label: 'Total Users', value: stats.counts.users, color: 'from-blue-500 to-blue-600' },
    { label: 'Total Jobs', value: stats.counts.jobs, color: 'from-purple-500 to-purple-600' },
    { label: 'Total Gigs', value: stats.counts.gigs, color: 'from-green-500 to-green-600' },
    { label: 'Conversations', value: stats.counts.conversations, color: 'from-orange-500 to-orange-600' },
    { label: 'Disputed Jobs', value: stats.counts.disputedJobs, color: 'from-red-500 to-red-600' },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          >
            <p className="text-small text-gray-500 mb-2">{card.label}</p>
            <p className={`text-display font-bold bg-linear-to-r ${card.color} bg-clip-text text-transparent`}>
              {(card.value ?? 0).toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {/* Jobs by Status: open = deadline ahead of now (or null), expired = deadline before now */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-large font-bold text-black mb-4">Jobs by Status</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            ...Object.entries(stats.jobsByStatus).map(([status, count]) =>
              status === 'open'
                ? ['open', stats.counts?.openJobs ?? count]
                : ([status, count] as [string, number])
            ),
            ['expired', stats.counts?.expiredJobs ?? 0],
          ].map(([status, count]) => (
            <div key={String(status)} className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-small text-gray-500 capitalize mb-1">
                {String(status).replace('_', ' ')}
              </p>
              <p className="text-subtitle font-bold text-black">{count}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-large font-bold text-black mb-4">Recent Users</h2>
          <div className="space-y-3">
            {stats.recentUsers.map((user) => (
              <div
                key={user.id}
                className="flex flex-col gap-3 p-3 bg-gray-50 rounded-lg sm:flex-row sm:items-center"
              >
                <div className="w-10 h-10 rounded-full bg-linear-to-r from-[#2F3DF6] to-[#7E3FF2] flex items-center justify-center text-white font-bold text-small">
                  {user.display_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-normal font-medium text-black truncate">
                    {user.display_name || 'No name'}
                  </p>
                  <p className="text-tiny text-gray-500 truncate">{user.email || 'No email'}</p>
                </div>
                <span className={`text-tiny px-2 py-1 rounded-full self-end ${
                  user.role === 'admin'
                    ? 'bg-purple-100 text-purple-700'
                    : user.role === 'client'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-green-100 text-green-700'
                }`}>
                  {user.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Jobs */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-large font-bold text-black mb-4">Recent Jobs</h2>
          <div className="space-y-3">
            {stats.recentJobs.map((job) => (
              <div
                key={job.id}
                className="flex flex-col gap-3 p-3 bg-gray-50 rounded-lg sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-normal font-medium text-black truncate">{job.title}</p>
                  <p className="text-tiny text-gray-500">
                    {new Date(job.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span className={`text-tiny px-2 py-1 rounded-full self-end ${
                  job.status === 'completed'
                    ? 'bg-green-100 text-green-700'
                    : job.status === 'in_progress'
                    ? 'bg-blue-100 text-blue-700'
                    : job.status === 'open'
                    ? 'bg-yellow-100 text-yellow-700'
                    : job.status === 'cancelled'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {job.status.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
