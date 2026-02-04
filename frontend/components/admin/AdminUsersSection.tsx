'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { getAdminUsers, getAdminUserDetails } from '@/utils/adminFunctions';
import { AdminUser, AdminUserDetails, Pagination } from '@/types/admin';
import { EscrowBackendConfig } from '@/config/config';
import SmallLoading from '@/components/smallLoading';
import AdminUserModal from '@/components/admin/modals/AdminUserModal';

const AdminUsersSection = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<AdminUserDetails | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const result = await getAdminUsers({ page, limit: 20, search: search || undefined });
    if (result.success) {
      setUsers(result.data || []);
      setPagination(result.pagination || null);
    }
    setLoading(false);
  }, [page, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleUserClick = async (userId: string) => {
    setLoadingDetails(true);
    setModalOpen(true);
    const result = await getAdminUserDetails(userId);
    if (result.success && result.data) {
      setSelectedUser(result.data);
    }
    setLoadingDetails(false);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedUser(null);
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-4">
        <input
          type="text"
          placeholder="Search users by name, email, or address..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7E3FF2]/20 focus:border-[#7E3FF2]"
        />
        <button
          type="submit"
          className="px-6 py-3 bg-linear-to-r from-[#2F3DF6] to-[#7E3FF2] text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          Search
        </button>
      </form>

      {/* Users List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <SmallLoading />
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4 text-small font-medium text-gray-500">User</th>
                  <th className="text-left px-6 py-4 text-small font-medium text-gray-500">Email</th>
                  <th className="text-left px-6 py-4 text-small font-medium text-gray-500">Role</th>
                  <th className="text-left px-6 py-4 text-small font-medium text-gray-500">Verified</th>
                  <th className="text-left px-6 py-4 text-small font-medium text-gray-500">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr
                    key={user.id}
                    onClick={() => handleUserClick(user.id)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Image
                          src={`${EscrowBackendConfig.uploadedImagesURL}${user.image_id || 'default.jpg'}`}
                          alt={user.display_name || 'User'}
                          width={40}
                          height={40}
                          className="rounded-full object-cover"
                        />
                        <span className="text-normal font-medium text-black">
                          {user.display_name || 'No name'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-normal text-gray-600">
                      {user.email || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-tiny px-2 py-1 rounded-full ${
                        user.role === 'admin'
                          ? 'bg-purple-100 text-purple-700'
                          : user.role === 'client'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.is_verified ? (
                        <span className="text-green-600">✓</span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-small text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-small text-gray-500">
                Showing {users.length} of {pagination.total} users
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-normal">
                  Page {page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={page === pagination.totalPages}
                  className="px-4 py-2 border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* User Details Modal */}
      <AdminUserModal
        isOpen={modalOpen}
        onClose={closeModal}
        user={selectedUser}
        loading={loadingDetails}
      />
    </div>
  );
};

export default AdminUsersSection;
