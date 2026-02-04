'use client';

import Image from 'next/image';
import { AdminUserDetails } from '@/types/admin';
import { EscrowBackendConfig } from '@/config/config';
import SmallLoading from '@/components/smallLoading';
import { XMarkIcon } from '@heroicons/react/20/solid';

interface AdminUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AdminUserDetails | null;
  loading: boolean;
}

const AdminUserModal = ({ isOpen, onClose, user, loading }: AdminUserModalProps) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/20 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="linear-border rounded-xl p-0.5 w-full max-w-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="linear-border__inner rounded-[0.6875rem] bg-white p-6 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <h2 className="text-subtitle font-bold text-black">User Details</h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <SmallLoading />
              </div>
            ) : user ? (
              <div className="space-y-6">
                {/* Profile Header */}
                <div className="flex items-center gap-4">
                  <Image
                    src={`${EscrowBackendConfig.uploadedImagesURL}${user.image_id || 'default.jpg'}`}
                    alt={user.display_name || 'User'}
                    width={80}
                    height={80}
                    className="rounded-full object-cover"
                  />
                  <div>
                    <h3 className="text-large font-bold text-black">
                      {user.display_name || 'No name'}
                    </h3>
                    <p className="text-normal text-gray-500">{user.email || 'No email'}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-tiny px-2 py-1 rounded-full ${
                        user.role === 'admin'
                          ? 'bg-purple-100 text-purple-700'
                          : user.role === 'client'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {user.role}
                      </span>
                      {user.is_verified && (
                        <span className="text-tiny px-2 py-1 rounded-full bg-green-100 text-green-700">
                          Verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-small text-gray-500 mb-1">User ID</p>
                    <p className="text-small text-black font-mono truncate">{user.id}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-small text-gray-500 mb-1">Country</p>
                    <p className="text-normal text-black">{user.country_code || 'N/A'}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-small text-gray-500 mb-1">Chain</p>
                    <p className="text-normal text-black capitalize">{user.chain || 'N/A'}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-small text-gray-500 mb-1">Wallet Address</p>
                    <p className="text-small text-black font-mono truncate">{user.address || 'N/A'}</p>
                  </div>
                </div>

                {/* Bio */}
                {user.bio && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-small text-gray-500 mb-2">Bio</p>
                    <p className="text-normal text-black whitespace-pre-wrap">{user.bio}</p>
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-linear-to-r from-[#2F3DF6]/5 to-[#7E3FF2]/5 rounded-lg">
                    <p className="text-subtitle font-bold text-[#7E3FF2]">{user._count.jobs}</p>
                    <p className="text-small text-gray-500">Jobs</p>
                  </div>
                  <div className="text-center p-4 bg-linear-to-r from-[#2F3DF6]/5 to-[#7E3FF2]/5 rounded-lg">
                    <p className="text-subtitle font-bold text-[#7E3FF2]">{user._count.bids}</p>
                    <p className="text-small text-gray-500">Bids</p>
                  </div>
                  <div className="text-center p-4 bg-linear-to-r from-[#2F3DF6]/5 to-[#7E3FF2]/5 rounded-lg">
                    <p className="text-subtitle font-bold text-[#7E3FF2]">{user._count.milestones}</p>
                    <p className="text-small text-gray-500">Milestones</p>
                  </div>
                  <div className="text-center p-4 bg-linear-to-r from-[#2F3DF6]/5 to-[#7E3FF2]/5 rounded-lg">
                    <p className="text-subtitle font-bold text-[#7E3FF2]">{user._count.conversations}</p>
                    <p className="text-small text-gray-500">Conversations</p>
                  </div>
                </div>

                {/* Financial Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-small text-gray-500 mb-1">Finished Jobs</p>
                    <p className="text-large font-bold text-black">{user.finished_job_num || 0}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-small text-gray-500 mb-1">Total Fund</p>
                    <p className="text-large font-bold text-black">{user.total_fund || 0} BNB</p>
                  </div>
                </div>

                {/* Dates */}
                <div className="flex justify-between text-small text-gray-500 pt-4 border-t border-gray-200">
                  <span>Joined: {new Date(user.created_at).toLocaleString()}</span>
                  <span>Updated: {new Date(user.updated_at).toLocaleString()}</span>
                </div>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-10">User not found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUserModal;
