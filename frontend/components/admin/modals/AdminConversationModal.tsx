'use client';

import Image from 'next/image';
import { AdminConversationDetails } from '@/types/admin';
import { EscrowBackendConfig } from '@/config/config';
import SmallLoading from '@/components/smallLoading';
import AdminMessagePreview from '@/components/admin/AdminMessagePreview';
import { XMarkIcon } from '@heroicons/react/20/solid';

interface AdminConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversation: AdminConversationDetails | null;
  loading: boolean;
}

const AdminConversationModal = ({ isOpen, onClose, conversation, loading }: AdminConversationModalProps) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/20 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
        <div
          className="linear-border rounded-xl p-0.5 w-full max-w-[95vw] sm:max-w-3xl lg:max-w-5xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="linear-border__inner rounded-[0.6875rem] bg-white p-4 sm:p-6 md:p-8 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <h2 className="text-subtitle font-bold text-black">Conversation Details</h2>
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
            ) : conversation ? (
              <div className="space-y-6">
                {/* Participants */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-small text-gray-500 mb-3">Participants</p>
                  <div className="flex flex-wrap gap-3">
                    {conversation.participants.map((participant) => (
                      <div
                        key={participant.user.id}
                        className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-gray-200"
                      >
                        <Image
                          src={`${EscrowBackendConfig.uploadedImagesURL}${participant.user.image_id || 'default.jpg'}`}
                          alt={participant.user.display_name || 'User'}
                          width={32}
                          height={32}
                          className="rounded-full object-cover"
                        />
                        <div>
                          <p className="text-small font-medium text-black">
                            {participant.user.display_name || 'No name'}
                          </p>
                          <span className={`text-tiny px-1.5 py-0.5 rounded ${
                            participant.user.role === 'admin'
                              ? 'bg-purple-100 text-purple-700'
                              : participant.user.role === 'client'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {participant.user.role}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Related Job/Gig */}
                {(conversation.job || conversation.gig) && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-small text-gray-500 mb-2">Related To</p>
                    {conversation.job && (
                      <div className="p-3 bg-white rounded border border-gray-200">
                        <div className="flex items-center gap-2">
                          <span className="text-tiny px-2 py-0.5 bg-blue-100 text-blue-700 rounded">Job</span>
                          <p className="text-normal font-medium text-black">{conversation.job.title}</p>
                        </div>
                        <p className="text-tiny text-gray-500 mt-1">
                          Status: {conversation.job.status?.replace('_', ' ')}
                        </p>
                      </div>
                    )}
                    {conversation.gig && (
                      <div className="p-3 bg-white rounded border border-gray-200">
                        <div className="flex items-center gap-2">
                          <span className="text-tiny px-2 py-0.5 bg-green-100 text-green-700 rounded">Gig</span>
                          <p className="text-normal font-medium text-black">{conversation.gig.title}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-small text-gray-500 mb-1">Conversation ID</p>
                    <p className="text-small text-black font-mono truncate">{conversation.id}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-small text-gray-500 mb-1">Type</p>
                    <p className="text-normal text-black capitalize">{conversation.type}</p>
                  </div>
                </div>

                {/* Messages */}
                <div>
                  <p className="text-normal font-bold text-black mb-3">
                    Messages ({conversation.messages?.length || 0})
                  </p>
                  <div className="bg-gray-50 rounded-lg p-4 max-h-[400px] overflow-y-auto space-y-3">
                    {conversation.messages && conversation.messages.length > 0 ? (
                      conversation.messages.map((message) => {
                        const isClient = message.sender.role === 'client';
                        return (
                          <div
                            key={message.id}
                            className={`p-3 rounded-lg wrap-break-word ${
                              isClient ? 'bg-blue-50 ml-0 sm:ml-8' : 'bg-green-50 mr-0 sm:mr-8'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <Image
                                src={`${EscrowBackendConfig.uploadedImagesURL}${message.sender.image_id || 'default.jpg'}`}
                                alt={message.sender.display_name || 'User'}
                                width={24}
                                height={24}
                                className="rounded-full object-cover"
                              />
                              <span className="text-small font-medium text-black">
                                {message.sender.display_name || 'Unknown'}
                              </span>
                              <span className={`text-tiny px-1.5 py-0.5 rounded ${
                                isClient
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-green-100 text-green-700'
                              }`}>
                                {message.sender.role}
                              </span>
                              <span className="text-tiny text-gray-400 ml-auto">
                                {new Date(message.created_at).toLocaleString()}
                              </span>
                            </div>
                            <AdminMessagePreview message={message} />
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-center text-gray-500 py-10">No messages</p>
                    )}
                  </div>
                </div>

                {/* Dates */}
                <div className="text-small text-gray-500 pt-4 border-t border-gray-200">
                  <span>Created: {new Date(conversation.created_at).toLocaleString()}</span>
                </div>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-10">Conversation not found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminConversationModal;
