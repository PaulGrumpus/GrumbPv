'use client';

import { useState } from 'react';
import Image from 'next/image';
import { AdminJobDetails } from '@/types/admin';
import { EscrowBackendConfig, CONFIG } from '@/config/config';
import SmallLoading from '@/components/smallLoading';
import { XMarkIcon } from '@heroicons/react/20/solid';

interface AdminJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: AdminJobDetails | null;
  loading: boolean;
}

type TabType = 'details' | 'bids' | 'milestones' | 'dispute';

const AdminJobModal = ({ isOpen, onClose, job, loading }: AdminJobModalProps) => {
  const [activeTab, setActiveTab] = useState<TabType>('details');

  if (!isOpen) return null;

  const formatBudget = (min: number | null, max: number | null, symbol: string | null) => {
    if (!min && !max) return 'N/A';
    const token = symbol || 'BNB';
    if (min && max) return `${min} - ${max} ${token}`;
    if (min) return `From ${min} ${token}`;
    if (max) return `Up to ${max} ${token}`;
    return 'N/A';
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'completed':
      case 'approved':
      case 'released':
        return 'bg-green-100 text-green-700';
      case 'in_progress':
      case 'funded':
      case 'delivered':
        return 'bg-blue-100 text-blue-700';
      case 'open':
      case 'pending':
      case 'pending_fund':
        return 'bg-yellow-100 text-yellow-700';
      case 'cancelled':
      case 'declined':
      case 'withdrawn':
        return 'bg-red-100 text-red-700';
      case 'in_review':
        return 'bg-purple-100 text-purple-700';
      case 'accepted':
        return 'bg-green-100 text-green-700';
      default:
        if (status.includes('disputed') || status.includes('Disputed')) {
          return 'bg-red-100 text-red-700';
        }
        return 'bg-gray-100 text-gray-700';
    }
  };

  const isDisputeStatus = (status: string) => {
    return status.toLowerCase().includes('disputed') || status.toLowerCase().includes('resolved');
  };

  const tabs: { id: TabType; label: string; show: boolean }[] = [
    { id: 'details', label: 'Details', show: true },
    { id: 'bids', label: `Bids (${job?.bids?.length || 0})`, show: true },
    { id: 'milestones', label: `Milestones (${job?.milestones?.length || 0})`, show: true },
    { id: 'dispute', label: 'Dispute Info', show: job?.hasDispute || false },
  ];

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/20 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="linear-border rounded-xl p-0.5 w-full max-w-4xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="linear-border__inner rounded-[0.6875rem] bg-white p-6 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-subtitle font-bold text-black">Job Details</h2>
                {job?.hasDispute && (
                  <span className="text-tiny px-2 py-1 rounded-full bg-red-100 text-red-700 mt-2 inline-block">
                    ⚠ This job has disputes
                  </span>
                )}
              </div>
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
            ) : job ? (
              <div className="space-y-6">
                {/* Job Header */}
                <div className="flex items-start gap-4">
                  {job.image_id && (
                    <Image
                      src={`${EscrowBackendConfig.uploadedImagesURL}${job.image_id}`}
                      alt={job.title}
                      width={100}
                      height={100}
                      className="rounded-xl object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="text-large font-bold text-black">{job.title}</h3>
                    <p className="text-normal text-[#7E3FF2] font-medium mt-1">
                      {formatBudget(job.budget_min, job.budget_max, job.token_symbol)}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-tiny px-2 py-1 rounded-full ${getStatusBadgeClass(job.status)}`}>
                        {job.status.replace('_', ' ')}
                      </span>
                      {job.deadline_at && (
                        <span className="text-tiny text-gray-500">
                          Deadline: {new Date(job.deadline_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Client Info */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-small text-gray-500 mb-3">Client</p>
                  <div className="flex items-center gap-3">
                    <Image
                      src={`${EscrowBackendConfig.uploadedImagesURL}${job.client?.image_id || 'default.jpg'}`}
                      alt={job.client?.display_name || 'Client'}
                      width={48}
                      height={48}
                      className="rounded-full object-cover"
                    />
                    <div>
                      <p className="text-normal font-medium text-black">
                        {job.client?.display_name || 'No name'}
                      </p>
                      <p className="text-small text-gray-500">{job.client?.email || 'No email'}</p>
                    </div>
                    {job.client?.is_verified && (
                      <span className="text-tiny px-2 py-1 rounded-full bg-green-100 text-green-700 ml-auto">
                        Verified
                      </span>
                    )}
                  </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200">
                  <nav className="flex gap-4">
                    {tabs.filter(t => t.show).map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`pb-3 px-1 text-normal font-medium transition-colors border-b-2 ${
                          activeTab === tab.id
                            ? 'border-[#7E3FF2] text-[#7E3FF2]'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Tab Content */}
                <div className="min-h-[300px]">
                  {/* Details Tab */}
                  {activeTab === 'details' && (
                    <div className="space-y-4">
                      {/* Description */}
                      {job.description_md && (
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p className="text-small text-gray-500 mb-2">Description</p>
                          <div className="text-normal text-black whitespace-pre-wrap prose prose-sm max-w-none">
                            {job.description_md}
                          </div>
                        </div>
                      )}

                      {/* Tags */}
                      {job.tags && job.tags.length > 0 && (
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p className="text-small text-gray-500 mb-2">Tags</p>
                          <div className="flex flex-wrap gap-2">
                            {job.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="text-tiny px-2 py-1 bg-white border border-gray-200 text-gray-600 rounded"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Application Documents */}
                      {job.jobApplicationsDocs && job.jobApplicationsDocs.length > 0 && (
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p className="text-small text-gray-500 mb-3">Job Requirements Documents</p>
                          <div className="space-y-3">
                            {job.jobApplicationsDocs.map((doc) => (
                              <div
                                key={doc.id}
                                className="p-3 bg-white rounded border border-gray-200"
                              >
                                <div className="flex items-center gap-2 mb-2">
                                  <span className={`text-tiny px-2 py-0.5 rounded ${
                                    doc.client_confirm && doc.freelancer_confirm
                                      ? 'bg-green-100 text-green-700'
                                      : 'bg-yellow-100 text-yellow-700'
                                  }`}>
                                    {doc.client_confirm && doc.freelancer_confirm ? 'Confirmed' : 'Pending'}
                                  </span>
                                  {doc.budget && (
                                    <span className="text-small font-medium text-[#7E3FF2]">
                                      {doc.budget} {doc.token_symbol || 'BNB'}
                                    </span>
                                  )}
                                </div>
                                {doc.deliverables && (
                                  <div className="mb-2">
                                    <p className="text-tiny text-gray-500">Deliverables:</p>
                                    <p className="text-small text-black">{doc.deliverables}</p>
                                  </div>
                                )}
                                {doc.out_of_scope && (
                                  <div className="mb-2">
                                    <p className="text-tiny text-gray-500">Out of Scope:</p>
                                    <p className="text-small text-black">{doc.out_of_scope}</p>
                                  </div>
                                )}
                                {(doc.start_date || doc.end_date) && (
                                  <p className="text-tiny text-gray-400">
                                    {doc.start_date && `Start: ${new Date(doc.start_date).toLocaleDateString()}`}
                                    {doc.start_date && doc.end_date && ' - '}
                                    {doc.end_date && `End: ${new Date(doc.end_date).toLocaleDateString()}`}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Info Grid */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p className="text-small text-gray-500 mb-1">Location</p>
                          <p className="text-normal text-black capitalize">{job.location || 'Remote'}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p className="text-small text-gray-500 mb-1">Token</p>
                          <p className="text-normal text-black">{job.token_symbol || 'BNB'}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Bids Tab */}
                  {activeTab === 'bids' && (
                    <div className="space-y-3">
                      {job.bids && job.bids.length > 0 ? (
                        job.bids.map((bid) => (
                          <div
                            key={bid.id}
                            className="p-4 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <Image
                                  src={`${EscrowBackendConfig.uploadedImagesURL}${bid.freelancer?.image_id || 'default.jpg'}`}
                                  alt={bid.freelancer?.display_name || 'Freelancer'}
                                  width={40}
                                  height={40}
                                  className="rounded-full object-cover"
                                />
                                <div>
                                  <p className="text-normal font-medium text-black">
                                    {bid.freelancer?.display_name || 'No name'}
                                  </p>
                                  <p className="text-small text-gray-500">
                                    {bid.freelancer?.email || 'No email'}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-normal font-bold text-[#7E3FF2]">
                                  {bid.bid_amount} {bid.token_symbol || 'BNB'}
                                </p>
                                <span className={`text-tiny px-2 py-1 rounded-full ${getStatusBadgeClass(bid.status)}`}>
                                  {bid.status}
                                </span>
                              </div>
                            </div>
                            {bid.cover_letter_md && (
                              <div className="mt-3 p-3 bg-white rounded text-small text-gray-600">
                                {bid.cover_letter_md}
                              </div>
                            )}
                            {bid.period && (
                              <p className="mt-2 text-tiny text-gray-500">
                                Delivery: {bid.period} days
                              </p>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-gray-500 py-10">No bids yet</p>
                      )}
                    </div>
                  )}

                  {/* Milestones Tab */}
                  {activeTab === 'milestones' && (
                    <div className="space-y-3">
                      {job.milestones && job.milestones.length > 0 ? (
                        job.milestones.map((milestone, index) => (
                          <div
                            key={milestone.id}
                            className={`p-4 rounded-lg ${
                              isDisputeStatus(milestone.status)
                                ? 'bg-red-50 border-2 border-red-200'
                                : 'bg-gray-50'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-tiny font-medium text-gray-500">#{index + 1}</span>
                                  <h4 className="text-normal font-medium text-black">{milestone.title}</h4>
                                  {isDisputeStatus(milestone.status) && (
                                    <span className="text-tiny text-red-600 font-medium">⚠ Disputed</span>
                                  )}
                                </div>
                                {milestone.freelancer && (
                                  <p className="text-small text-gray-500 mt-1">
                                    Assigned to: {milestone.freelancer.display_name || 'Unknown'}
                                  </p>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="text-normal font-bold text-[#7E3FF2]">
                                  {milestone.amount} {job.token_symbol || 'BNB'}
                                </p>
                                <span className={`text-tiny px-2 py-1 rounded-full ${getStatusBadgeClass(milestone.status)}`}>
                                  {milestone.status.replace(/([A-Z])/g, ' $1').trim()}
                                </span>
                              </div>
                            </div>
                            {milestone.due_at && (
                              <p className="mt-2 text-tiny text-gray-500">
                                Due: {new Date(milestone.due_at).toLocaleDateString()}
                              </p>
                            )}
                            {milestone.escrow && (
                              <p className="mt-1 text-tiny text-gray-400 font-mono">
                                Escrow: {milestone.escrow.slice(0, 10)}...
                              </p>
                            )}
                            {milestone.ipfs && (
                              <a
                                href={`${CONFIG.ipfsGateWay}${milestone.ipfs}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-2 inline-block text-tiny text-[#7E3FF2] hover:underline"
                              >
                                View Deliverable (IPFS)
                              </a>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-gray-500 py-10">No milestones yet</p>
                      )}
                    </div>
                  )}

                  {/* Dispute Tab */}
                  {activeTab === 'dispute' && job.hasDispute && (
                    <div className="space-y-6">
                      {/* Disputed Milestones */}
                      <div>
                        <h4 className="text-normal font-bold text-red-600 mb-3">Disputed Milestones</h4>
                        <div className="space-y-3">
                          {job.disputedMilestones.map((milestone) => (
                            <div
                              key={milestone.id}
                              className="p-4 bg-red-50 border-2 border-red-200 rounded-lg"
                            >
                              <div className="flex items-start justify-between">
                                <div>
                                  <h5 className="text-normal font-medium text-black">{milestone.title}</h5>
                                  <p className="text-small text-gray-600 mt-1">
                                    Status: <span className="text-red-600 font-medium">{milestone.status}</span>
                                  </p>
                                </div>
                                <p className="text-normal font-bold text-red-600">
                                  {milestone.amount} {job.token_symbol || 'BNB'}
                                </p>
                              </div>
                              {milestone.ipfs && (
                                <a
                                  href={`${CONFIG.ipfsGateWay}${milestone.ipfs}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="mt-3 inline-block text-small text-[#7E3FF2] hover:underline"
                                >
                                  📎 Reference Document (IPFS)
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Chat History */}
                      {job.disputeChatHistory && job.disputeChatHistory.length > 0 && (
                        <div>
                          <h4 className="text-normal font-bold text-black mb-3">
                            Chat History ({job.disputeChatHistory.length} messages)
                          </h4>
                          <div className="bg-gray-50 rounded-lg p-4 max-h-[400px] overflow-y-auto space-y-3">
                            {job.disputeChatHistory.map((message) => (
                              <div
                                key={message.id}
                                className={`p-3 rounded-lg ${
                                  message.sender.role === 'client'
                                    ? 'bg-blue-50 ml-8'
                                    : 'bg-green-50 mr-8'
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
                                    message.sender.role === 'client'
                                      ? 'bg-blue-100 text-blue-700'
                                      : 'bg-green-100 text-green-700'
                                  }`}>
                                    {message.sender.role}
                                  </span>
                                  <span className="text-tiny text-gray-400 ml-auto">
                                    {new Date(message.created_at).toLocaleString()}
                                  </span>
                                </div>
                                <p className="text-small text-gray-700">{message.body_text}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Dates */}
                <div className="flex justify-between text-small text-gray-500 pt-4 border-t border-gray-200">
                  <span>Created: {new Date(job.created_at).toLocaleString()}</span>
                  <span>Updated: {new Date(job.updated_at).toLocaleString()}</span>
                </div>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-10">Job not found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminJobModal;
