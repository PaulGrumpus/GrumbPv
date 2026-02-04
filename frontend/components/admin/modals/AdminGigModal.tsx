'use client';

import Image from 'next/image';
import { EscrowBackendConfig } from '@/config/config';
import SmallLoading from '@/components/smallLoading';
import { XMarkIcon } from '@heroicons/react/20/solid';

interface AdminGigModalProps {
  isOpen: boolean;
  onClose: () => void;
  gig: any;
  loading: boolean;
}

const AdminGigModal = ({ isOpen, onClose, gig, loading }: AdminGigModalProps) => {
  if (!isOpen) return null;

  const formatBudget = (min: number | null, max: number | null, symbol: string | null) => {
    if (!min && !max) return 'N/A';
    const token = symbol || 'BNB';
    if (min && max) return `${min} - ${max} ${token}`;
    if (min) return `From ${min} ${token}`;
    if (max) return `Up to ${max} ${token}`;
    return 'N/A';
  };

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
              <h2 className="text-subtitle font-bold text-black">Gig Details</h2>
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
            ) : gig ? (
              <div className="space-y-6">
                {/* Gig Header */}
                <div className="flex items-start gap-4">
                  {gig.image_id && (
                    <Image
                      src={`${EscrowBackendConfig.uploadedImagesURL}${gig.image_id}`}
                      alt={gig.title}
                      width={100}
                      height={100}
                      className="rounded-xl object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="text-large font-bold text-black">{gig.title}</h3>
                    <p className="text-normal text-[#7E3FF2] font-medium mt-1">
                      {formatBudget(gig.budget_min, gig.budget_max, gig.token_symbol)}
                    </p>
                    {gig.tags && gig.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {gig.tags.map((tag: string, index: number) => (
                          <span
                            key={index}
                            className="text-tiny px-2 py-1 bg-gray-100 text-gray-600 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Freelancer Info */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-small text-gray-500 mb-3">Freelancer</p>
                  <div className="flex items-center gap-3">
                    <Image
                      src={`${EscrowBackendConfig.uploadedImagesURL}${gig.freelancer?.image_id || 'default.jpg'}`}
                      alt={gig.freelancer?.display_name || 'Freelancer'}
                      width={48}
                      height={48}
                      className="rounded-full object-cover"
                    />
                    <div>
                      <p className="text-normal font-medium text-black">
                        {gig.freelancer?.display_name || 'No name'}
                      </p>
                      <p className="text-small text-gray-500">{gig.freelancer?.email || 'No email'}</p>
                    </div>
                    {gig.freelancer?.is_verified && (
                      <span className="text-tiny px-2 py-1 rounded-full bg-green-100 text-green-700 ml-auto">
                        Verified
                      </span>
                    )}
                  </div>
                </div>

                {/* Description */}
                {gig.description_md && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-small text-gray-500 mb-2">Description</p>
                    <div className="text-normal text-black whitespace-pre-wrap prose prose-sm max-w-none">
                      {gig.description_md}
                    </div>
                  </div>
                )}

                {/* Link */}
                {gig.link && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-small text-gray-500 mb-2">External Link</p>
                    <a
                      href={gig.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-normal text-[#7E3FF2] hover:underline break-all"
                    >
                      {gig.link}
                    </a>
                  </div>
                )}

                {/* Conversations */}
                {gig.conversations && gig.conversations.length > 0 && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-small text-gray-500 mb-3">
                      Related Conversations ({gig.conversations.length})
                    </p>
                    <div className="space-y-2">
                      {gig.conversations.slice(0, 5).map((conv: any) => (
                        <div key={conv.id} className="flex justify-between items-center p-2 bg-white rounded">
                          <span className="text-small text-gray-600 font-mono truncate">
                            {conv.id.slice(0, 8)}...
                          </span>
                          <span className="text-tiny text-gray-400">
                            {conv._count?.messages || 0} messages
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-small text-gray-500 mb-1">Gig ID</p>
                    <p className="text-small text-black font-mono truncate">{gig.id}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-small text-gray-500 mb-1">Token</p>
                    <p className="text-normal text-black">{gig.token_symbol || 'BNB'}</p>
                  </div>
                </div>

                {/* Dates */}
                <div className="flex justify-between text-small text-gray-500 pt-4 border-t border-gray-200">
                  <span>Created: {new Date(gig.created_at).toLocaleString()}</span>
                  <span>Updated: {new Date(gig.updated_at).toLocaleString()}</span>
                </div>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-10">Gig not found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminGigModal;
