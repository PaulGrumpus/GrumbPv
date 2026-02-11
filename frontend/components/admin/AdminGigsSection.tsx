'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { getAdminGigs, getAdminGigDetails } from '@/utils/adminFunctions';
import { AdminGig, Pagination } from '@/types/admin';
import { EscrowBackendConfig } from '@/config/config';
import SmallLoading from '@/components/smallLoading';
import AdminGigModal from '@/components/admin/modals/AdminGigModal';

const AdminGigsSection = () => {
  const [gigs, setGigs] = useState<AdminGig[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedGig, setSelectedGig] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const fetchGigs = useCallback(async () => {
    setLoading(true);
    const result = await getAdminGigs({ page, limit: 20, search: search || undefined });
    if (result.success) {
      setGigs(result.data || []);
      setPagination(result.pagination || null);
    }
    setLoading(false);
  }, [page, search]);

  useEffect(() => {
    fetchGigs();
  }, [fetchGigs]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchGigs();
  };

  const handleGigClick = async (gigId: string) => {
    setLoadingDetails(true);
    setModalOpen(true);
    const result = await getAdminGigDetails(gigId);
    if (result.success && result.data) {
      setSelectedGig(result.data);
    }
    setLoadingDetails(false);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedGig(null);
  };

  const formatBudget = (min: number | null, max: number | null, symbol: string | null) => {
    if (!min && !max) return 'N/A';
    const token = symbol || 'BNB';
    if (min && max) return `${min} - ${max} ${token}`;
    if (min) return `From ${min} ${token}`;
    if (max) return `Up to ${max} ${token}`;
    return 'N/A';
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row sm:gap-4">
        <input
          type="text"
          placeholder="Search gigs by title or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7E3FF2]/20 focus:border-[#7E3FF2] text-black"
        />
        <button
          type="submit"
          className="w-full sm:w-auto px-6 py-3 bg-linear-to-r from-[#2F3DF6] to-[#7E3FF2] text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          Search
        </button>
      </form>

      {/* Gigs List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <SmallLoading />
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="sm:hidden space-y-3 p-3 bg-gray-50">
              {gigs.map((gig) => (
                <button
                  key={gig.id}
                  onClick={() => handleGigClick(gig.id)}
                  className="w-full text-left p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all"
                >
                  <div className="flex items-center gap-3">
                    {gig.image_id && (
                      <Image
                        src={`${EscrowBackendConfig.uploadedImagesURL}${gig.image_id}`}
                        alt={gig.title}
                        width={48}
                        height={48}
                        className="rounded-lg object-cover"
                      />
                    )}
                    <div className="min-w-0">
                      <p className="text-normal font-medium text-black truncate">{gig.title}</p>
                      <p className="text-small text-gray-500 truncate">
                        {gig.freelancer.display_name || 'No name'}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-small text-gray-500">
                    <span>{formatBudget(gig.budget_min, gig.budget_max, gig.token_symbol)}</span>
                    <span>{new Date(gig.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {gig.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="text-tiny px-2 py-0.5 bg-gray-100 text-gray-600 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                    {gig.tags.length > 3 && (
                      <span className="text-tiny text-gray-400">+{gig.tags.length - 3}</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full min-w-[760px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4 text-small font-medium text-gray-500">Gig</th>
                  <th className="text-left px-6 py-4 text-small font-medium text-gray-500">Freelancer</th>
                  <th className="text-left px-6 py-4 text-small font-medium text-gray-500">Budget</th>
                  <th className="text-left px-6 py-4 text-small font-medium text-gray-500">Tags</th>
                  <th className="text-left px-6 py-4 text-small font-medium text-gray-500">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {gigs.map((gig) => (
                  <tr
                    key={gig.id}
                    onClick={() => handleGigClick(gig.id)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {gig.image_id && (
                          <Image
                            src={`${EscrowBackendConfig.uploadedImagesURL}${gig.image_id}`}
                            alt={gig.title}
                            width={48}
                            height={48}
                            className="rounded-lg object-cover"
                          />
                        )}
                        <span className="text-normal font-medium text-black max-w-[200px] truncate">
                          {gig.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Image
                          src={`${EscrowBackendConfig.uploadedImagesURL}${gig.freelancer.image_id || 'default.jpg'}`}
                          alt={gig.freelancer.display_name || 'Freelancer'}
                          width={32}
                          height={32}
                          className="rounded-full object-cover"
                        />
                        <span className="text-small text-gray-600">
                          {gig.freelancer.display_name || 'No name'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-normal text-gray-600">
                      {formatBudget(gig.budget_min, gig.budget_max, gig.token_symbol)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-[150px]">
                        {gig.tags.slice(0, 2).map((tag, index) => (
                          <span
                            key={index}
                            className="text-tiny px-2 py-0.5 bg-gray-100 text-gray-600 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                        {gig.tags.length > 2 && (
                          <span className="text-tiny text-gray-400">+{gig.tags.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-small text-gray-500">
                      {new Date(gig.created_at).toLocaleDateString()}
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
                Showing {gigs.length} of {pagination.total} gigs
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

      {/* Gig Details Modal */}
      <AdminGigModal
        isOpen={modalOpen}
        onClose={closeModal}
        gig={selectedGig}
        loading={loadingDetails}
      />
    </div>
  );
};

export default AdminGigsSection;
