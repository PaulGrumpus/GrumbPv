'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { getAdminConversations, getAdminConversationDetails } from '@/utils/adminFunctions';
import { AdminConversation, AdminConversationDetails, Pagination } from '@/types/admin';
import { EscrowBackendConfig } from '@/config/config';
import SmallLoading from '@/components/smallLoading';
import AdminConversationModal from '@/components/admin/modals/AdminConversationModal';

const AdminConversationsSection = () => {
  const [conversations, setConversations] = useState<AdminConversation[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedConversation, setSelectedConversation] = useState<AdminConversationDetails | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const fetchConversations = useCallback(async () => {
    setLoading(true);
    const result = await getAdminConversations({ page, limit: 20, search: search || undefined });
    if (result.success) {
      setConversations(result.data || []);
      setPagination(result.pagination || null);
    }
    setLoading(false);
  }, [page, search]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchConversations();
  };

  const handleConversationClick = async (conversationId: string) => {
    setLoadingDetails(true);
    setModalOpen(true);
    const result = await getAdminConversationDetails(conversationId);
    if (result.success && result.data) {
      setSelectedConversation(result.data);
    }
    setLoadingDetails(false);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedConversation(null);
  };

  const getParticipantNames = (participants: AdminConversation['participants']) => {
    return participants
      .map((p) => p.user.display_name || p.user.email || 'Unknown')
      .join(', ');
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row sm:gap-4">
        <input
          type="text"
          placeholder="Search conversations by participant name or related job/gig..."
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

      {/* Conversations List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <SmallLoading />
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="sm:hidden divide-y divide-gray-100">
              {conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => handleConversationClick(conversation.id)}
                  className="w-full text-left p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {conversation.participants.slice(0, 3).map((participant, index) => (
                        <Image
                          key={participant.user.id}
                          src={`${EscrowBackendConfig.uploadedImagesURL}${participant.user.image_id || 'default.jpg'}`}
                          alt={participant.user.display_name || 'User'}
                          width={28}
                          height={28}
                          className="rounded-full object-cover border-2 border-white"
                          style={{ zIndex: 3 - index }}
                        />
                      ))}
                    </div>
                    <span className="text-small text-gray-600 truncate">
                      {getParticipantNames(conversation.participants)}
                    </span>
                  </div>
                  <div className="mt-3 text-normal text-gray-700 truncate">
                    {conversation.job?.title || conversation.gig?.title || 'Direct Message'}
                  </div>
                  <div className="mt-2 flex items-center justify-between text-small text-gray-500">
                    <span className={`text-tiny px-2 py-1 rounded-full ${
                      conversation.job
                        ? 'bg-blue-100 text-blue-700'
                        : conversation.gig
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {conversation.job ? 'Job' : conversation.gig ? 'Gig' : 'DM'}
                    </span>
                    <span>{new Date(conversation.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="mt-2 text-tiny text-gray-500">
                    Messages: {conversation._count.messages}
                  </div>
                </button>
              ))}
            </div>
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full min-w-[860px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4 text-small font-medium text-gray-500">Participants</th>
                  <th className="text-left px-6 py-4 text-small font-medium text-gray-500">Related To</th>
                  <th className="text-left px-6 py-4 text-small font-medium text-gray-500">Type</th>
                  <th className="text-left px-6 py-4 text-small font-medium text-gray-500">Messages</th>
                  <th className="text-left px-6 py-4 text-small font-medium text-gray-500">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {conversations.map((conversation) => (
                  <tr
                    key={conversation.id}
                    onClick={() => handleConversationClick(conversation.id)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                          {conversation.participants.slice(0, 3).map((participant, index) => (
                            <Image
                              key={participant.user.id}
                              src={`${EscrowBackendConfig.uploadedImagesURL}${participant.user.image_id || 'default.jpg'}`}
                              alt={participant.user.display_name || 'User'}
                              width={32}
                              height={32}
                              className="rounded-full object-cover border-2 border-white"
                              style={{ zIndex: 3 - index }}
                            />
                          ))}
                        </div>
                        <span className="text-small text-gray-600 max-w-[150px] truncate">
                          {getParticipantNames(conversation.participants)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-normal text-gray-600 max-w-[200px] truncate">
                      {conversation.job?.title || conversation.gig?.title || 'Direct Message'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-tiny px-2 py-1 rounded-full ${
                        conversation.job
                          ? 'bg-blue-100 text-blue-700'
                          : conversation.gig
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {conversation.job ? 'Job' : conversation.gig ? 'Gig' : 'DM'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-normal text-gray-600">
                      {conversation._count.messages}
                    </td>
                    <td className="px-6 py-4 text-small text-gray-500">
                      {new Date(conversation.created_at).toLocaleDateString()}
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
                Showing {conversations.length} of {pagination.total} conversations
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

      {/* Conversation Details Modal */}
      <AdminConversationModal
        isOpen={modalOpen}
        onClose={closeModal}
        conversation={selectedConversation}
        loading={loadingDetails}
      />
    </div>
  );
};

export default AdminConversationsSection;
