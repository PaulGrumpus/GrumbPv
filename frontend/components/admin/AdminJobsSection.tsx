'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { getAdminJobs, getAdminJobDetails, getAdminSystemSettings } from '@/utils/adminFunctions';
import { AdminJob, AdminJobDetails, Pagination, JobStatusFilter } from '@/types/admin';
import { EscrowBackendConfig } from '@/config/config';
import SmallLoading from '@/components/smallLoading';
import AdminJobModal from '@/components/admin/modals/AdminJobModal';

const STATUS_FILTERS: { value: JobStatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'expired', label: 'Expired' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'disputed', label: 'Disputed' },
];

const AdminJobsSection = () => {
  const [jobs, setJobs] = useState<AdminJob[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<JobStatusFilter>('all');
  const [selectedJob, setSelectedJob] = useState<AdminJobDetails | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [arbiterAddress, setArbiterAddress] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    const result = await getAdminJobs({
      page,
      limit: 20,
      search: search || undefined,
      status: statusFilter === 'all' ? undefined : statusFilter,
    });
    if (result.success) {
      setJobs(result.data || []);
      setPagination(result.pagination || null);
    }
    const resultSettings = await getAdminSystemSettings();
    if(resultSettings.success && resultSettings.data) {
      setArbiterAddress(resultSettings.data.arbiter_address);
    }
    setLoading(false);
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchJobs();
  };

  const handleStatusFilterChange = (status: JobStatusFilter) => {
    setStatusFilter(status);
    setPage(1);
  };

  const handleJobClick = async (jobId: string) => {
    setLoadingDetails(true);
    setModalOpen(true);
    const result = await getAdminJobDetails(jobId);
    if (result.success && result.data) {
      setSelectedJob(result.data);
    }
    setLoadingDetails(false);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedJob(null);
  };

  const formatBudget = (min: number | null, max: number | null, symbol: string | null) => {
    if (!min && !max) return 'N/A';
    const token = symbol || 'BNB';
    if (min && max) return `${min} - ${max} ${token}`;
    if (min) return `From ${min} ${token}`;
    if (max) return `Up to ${max} ${token}`;
    return 'N/A';
  };

  const isExpired = (deadline: string | null, status: string) => {
    if (status !== 'open' || !deadline) return false;
    return new Date(deadline).getTime() < Date.now();
  };

  // When "Open" filter is active, show only open jobs whose deadline is still ahead (not expired)
  const displayedJobs =
    statusFilter === 'open'
      ? jobs.filter((job) => job.status === 'open' && !isExpired(job.deadline_at, job.status))
      : jobs;

  const getStatusBadgeClass = (status: string, hasDispute: boolean, expired: boolean) => {
    if (hasDispute) return 'bg-red-100 text-red-700';
    if (expired) return 'bg-amber-100 text-amber-700';
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'in_progress':
        return 'bg-blue-100 text-blue-700';
      case 'open':
        return 'bg-yellow-100 text-yellow-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      case 'in_review':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Filters */}
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter.value}
            onClick={() => handleStatusFilterChange(filter.value)}
            className={`px-3 py-2 sm:px-4 rounded-lg font-medium transition-all ${
              statusFilter === filter.value
                ? 'bg-linear-to-r from-[#2F3DF6] to-[#7E3FF2] text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row sm:gap-4">
        <input
          type="text"
          placeholder="Search jobs by title or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-3 border border-gray-200 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7E3FF2]/20 focus:border-[#7E3FF2]"
        />
        <button
          type="submit"
          className="w-full sm:w-auto px-6 py-3 bg-linear-to-r from-[#2F3DF6] to-[#7E3FF2] text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          Search
        </button>
      </form>

      {/* Jobs List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <SmallLoading />
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="sm:hidden space-y-3 p-3 bg-gray-50">
              {displayedJobs.map((job) => (
                <button
                  key={job.id}
                  onClick={() => handleJobClick(job.id)}
                  className={`w-full text-left p-4 rounded-xl border border-gray-100 shadow-sm transition-all ${
                    job.hasDispute
                      ? 'bg-red-50/60 border-red-100'
                      : 'bg-white hover:shadow-md hover:border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {job.image_id && (
                      <Image
                        src={`${EscrowBackendConfig.uploadedImagesURL}${job.image_id}`}
                        alt={job.title}
                        width={48}
                        height={48}
                        className="rounded-lg object-cover"
                      />
                    )}
                    <div className="min-w-0">
                      <p className="text-normal font-medium text-black truncate">{job.title}</p>
                      {job.hasDispute && (
                        <p className="text-tiny text-red-600 font-medium">⚠ Has Dispute</p>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-small text-gray-500">
                    <span>{job.client.display_name || 'No name'}</span>
                    <span>{new Date(job.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-small text-gray-600">
                    <span>{formatBudget(job.budget_min, job.budget_max, job.token_symbol)}</span>
                    <span className={`text-tiny px-2 py-1 rounded-full ${getStatusBadgeClass(job.status, job.hasDispute, isExpired(job.deadline_at, job.status))}`}>
                      {job.hasDispute
                        ? 'Disputed'
                        : isExpired(job.deadline_at, job.status)
                        ? 'Expired'
                        : job.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="mt-2 text-tiny text-gray-500">Bids: {job._count.bids}</div>
                </button>
              ))}
            </div>
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full min-w-[860px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4 text-small font-medium text-gray-500">Job</th>
                  <th className="text-left px-6 py-4 text-small font-medium text-gray-500">Client</th>
                  <th className="text-left px-6 py-4 text-small font-medium text-gray-500">Budget</th>
                  <th className="text-left px-6 py-4 text-small font-medium text-gray-500">Status</th>
                  <th className="text-left px-6 py-4 text-small font-medium text-gray-500">Bids</th>
                  <th className="text-left px-6 py-4 text-small font-medium text-gray-500">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {displayedJobs.map((job) => (
                  <tr
                    key={job.id}
                    onClick={() => handleJobClick(job.id)}
                    className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                      job.hasDispute ? 'bg-red-50/50' : ''
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {job.image_id && (
                          <Image
                            src={`${EscrowBackendConfig.uploadedImagesURL}${job.image_id}`}
                            alt={job.title}
                            width={48}
                            height={48}
                            className="rounded-lg object-cover"
                          />
                        )}
                        <div>
                          <span className="text-normal font-medium text-black block max-w-[200px] truncate">
                            {job.title}
                          </span>
                          {job.hasDispute && (
                            <span className="text-tiny text-red-600 font-medium">⚠ Has Dispute</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Image
                          src={`${EscrowBackendConfig.uploadedImagesURL}${job.client.image_id || 'default.jpg'}`}
                          alt={job.client.display_name || 'Client'}
                          width={32}
                          height={32}
                          className="rounded-full object-cover"
                        />
                        <span className="text-small text-gray-600">
                          {job.client.display_name || 'No name'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-normal text-gray-600">
                      {formatBudget(job.budget_min, job.budget_max, job.token_symbol)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-tiny px-2 py-1 rounded-full ${getStatusBadgeClass(job.status, job.hasDispute, isExpired(job.deadline_at, job.status))}`}>
                        {job.hasDispute
                          ? 'Disputed'
                          : isExpired(job.deadline_at, job.status)
                          ? 'Expired'
                          : job.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-normal text-gray-600">{job._count.bids}</td>
                    <td className="px-6 py-4 text-small text-gray-500">
                      {new Date(job.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-small text-gray-500">
                Showing {displayedJobs.length} of {pagination.total} jobs
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-900 text-black rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-normal text-black">
                  Page {page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={page === pagination.totalPages}
                  className="px-4 py-2 border border-gray-900 text-black rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Job Details Modal */}
      <AdminJobModal
        isOpen={modalOpen}
        onClose={closeModal}
        job={selectedJob}
        loading={loadingDetails}
        arbiterAddress={arbiterAddress}
      />
    </div>
  );
};

export default AdminJobsSection;
