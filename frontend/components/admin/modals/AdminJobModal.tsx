'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { AdminJobDetails } from '@/types/admin';
import { EscrowBackendConfig, CONFIG } from '@/config/config';
import SmallLoading from '@/components/smallLoading';
import { XMarkIcon } from '@heroicons/react/20/solid';
import Button from '@/components/button';
import { getAdminSystemSettings, resolveDispute } from '@/utils/adminFunctions';
import { toast } from 'react-toastify';
import { useWallet } from '@/context/walletContext';
import AdminMessagePreview from '@/components/admin/AdminMessagePreview';
import { updateJobMilestone } from '@/utils/functions';
import { JobMilestoneStatus } from '@/types/jobMilestone';

interface AdminJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: AdminJobDetails | null;
  loading: boolean;
  arbiterAddress: string | null;
}

type TabType = 'details' | 'bids' | 'milestones' | 'dispute';

const AdminJobModal = ({ isOpen, onClose, job, loading, arbiterAddress }: AdminJobModalProps) => {
  const [activeTab, setActiveTab] = useState<TabType>('details');
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [expandedBids, setExpandedBids] = useState<Record<string, boolean>>({});
  const [expandedDocs, setExpandedDocs] = useState<Record<string, boolean>>({});
  const [localJob, setLocalJob] = useState<AdminJobDetails | null>(job);
  const { sendTransaction, address } = useWallet();
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
    return status.toLowerCase().includes('disputed');
  };
  // useEffect(() => {
  //   setLocalJob(job);
  // }, [job]);

  const jobData = localJob ?? job;


  const updateDisputeStatus = (milestoneId: string, status: string) => {
    setLocalJob((prev) => {
      const base = prev ?? job;
      if (!base) return prev;

      const updatedMilestones = base.milestones.map((milestone) =>
        milestone.id === milestoneId ? { ...milestone, status } : milestone
      );
      const disputedMilestones = updatedMilestones.filter((milestone) =>
        milestone.status.toLowerCase().includes('disputed')
      );

      return {
        ...base,
        milestones: updatedMilestones,
        disputedMilestones,
        hasDispute: disputedMilestones.length > 0,
      };
    });
  };


  const DESCRIPTION_PREVIEW_LIMIT = 320;
  const BID_PREVIEW_LIMIT = 220;
  const DOC_PREVIEW_LIMIT = 180;

  const getPreviewText = (text: string, limit: number) => {
    if (text.length <= limit) return text;
    return `${text.slice(0, limit).trimEnd()}...`;
  };

  const tabs: { id: TabType; label: string; show: boolean }[] = [
    { id: 'details', label: 'Details', show: true },
    { id: 'bids', label: `Bids (${jobData?.bids?.length || 0})`, show: true },
    { id: 'milestones', label: `Milestones (${jobData?.milestones?.length || 0})`, show: true },
    { id: 'dispute', label: 'Dispute Info', show: jobData?.hasDispute || false },
  ];

  const handleResolveToClient = async (job_milestone_id: string) => {
    if(address?.toLowerCase() !== arbiterAddress?.toLowerCase()) {
      toast.error('You are not authorized to resolve disputes. Please connect to the correct wallet.', {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
      });
      return;
    }
    const result = await resolveDispute(job_milestone_id, true, Number(CONFIG.chainId));
    if (!result.success || !result.data) {
      toast.error(result.error || 'Failed to resolve dispute', {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
      });
      return;
    }

    try {
      const { hash: txHash, error: txError } = await sendTransaction({
        to: result.data.to,
        data: result.data.data,
        value: result.data.value,
        chainId: Number(result.data.chainId),
      });
      if (!txHash) {
        throw new Error(txError || 'Transaction failed');
      }
      updateDisputeStatus(job_milestone_id, 'resolvedToBuyer');
      await updateJobMilestone(job_milestone_id, { status: JobMilestoneStatus.RESOLVED_TO_BUYER });
      toast.success('Dispute resolved to client', {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to resolve dispute';
      toast.error(message, {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
      });
    }
  };

  const handleResolveToFreelancer = async (job_milestone_id: string) => {
    if(address?.toLowerCase() !== arbiterAddress?.toLowerCase()) {
      toast.error('You are not authorized to resolve disputes. Please connect to the correct wallet.', {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
      });
      return;
    }
    const result = await resolveDispute(job_milestone_id, false, Number(CONFIG.chainId));
    if (!result.success || !result.data) {
      toast.error(result.error || 'Failed to resolve dispute', {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
      });
      return;
    }

    try {
      const { hash: txHash, error: txError } = await sendTransaction({
        to: result.data.to,
        data: result.data.data,
        value: result.data.value,
        chainId: Number(result.data.chainId),
      });
      if (!txHash) {
        throw new Error(txError || 'Transaction failed');
      }
      updateDisputeStatus(job_milestone_id, 'resolvedToVendor');
      await updateJobMilestone(job_milestone_id, { status: JobMilestoneStatus.RESOLVED_TO_VENDOR });
      toast.success('Dispute resolved to freelancer', {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to resolve dispute';
      toast.error(message, {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
      });
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/20 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
        <div
          className="linear-border rounded-xl p-0.5 w-full max-w-[95vw] sm:max-w-4xl lg:max-w-5xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="linear-border__inner rounded-[0.6875rem] bg-white p-4 sm:p-6 md:p-8 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-subtitle font-bold text-black">Job Details</h2>
                {jobData?.hasDispute && (
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
            ) : jobData ? (
              <div className="space-y-6">
                {/* Job Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  {jobData.image_id && (
                    <Image
                      src={`${EscrowBackendConfig.uploadedImagesURL}${jobData.image_id}`}
                      alt={jobData.title}
                      width={100}
                      height={100}
                      className="rounded-xl object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="text-large font-bold text-black">{jobData.title}</h3>
                    <p className="text-normal text-[#7E3FF2] font-medium mt-1">
                      {formatBudget(jobData.budget_min, jobData.budget_max, jobData.token_symbol)}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className={`text-tiny px-2 py-1 rounded-full ${getStatusBadgeClass((jobData.hasCancelledMilestone ? 'cancelled' : jobData.status) ?? '')}`}>
                        {(jobData.hasCancelledMilestone ? 'cancelled' : jobData.status)?.replace('_', ' ') ?? ''}
                      </span>
                      {jobData.deadline_at && (
                        <span className="text-tiny text-gray-500">
                          Deadline: {new Date(jobData.deadline_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Client Info */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-small text-gray-500 mb-3">Client</p>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Image
                      src={`${EscrowBackendConfig.uploadedImagesURL}${jobData.client?.image_id || 'default.jpg'}`}
                      alt={jobData.client?.display_name || 'Client'}
                      width={48}
                      height={48}
                      className="rounded-full object-cover"
                    />
                    <div>
                      <p className="text-normal font-medium text-black">
                        {jobData.client?.display_name || 'No name'}
                      </p>
                      <p className="text-small text-gray-500">{jobData.client?.email || 'No email'}</p>
                    </div>
                    {jobData.client?.is_verified && (
                      <span className="text-tiny px-2 py-1 rounded-full bg-green-100 text-green-700 sm:ml-auto">
                        Verified
                      </span>
                    )}
                  </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200">
                  <nav className="flex flex-wrap gap-4">
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
                      {jobData.description_md && (
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p className="text-small text-gray-500 mb-2">Description</p>
                          <div className="text-normal text-black whitespace-pre-wrap prose prose-sm max-w-none">
                            {isDescriptionExpanded
                              ? jobData.description_md
                              : getPreviewText(jobData.description_md, DESCRIPTION_PREVIEW_LIMIT)}
                          </div>
                          {jobData.description_md.length > DESCRIPTION_PREVIEW_LIMIT && (
                            <button
                              type="button"
                              onClick={() => setIsDescriptionExpanded((prev) => !prev)}
                              className="mt-2 text-small font-medium text-gray-500 hover:underline"
                            >
                              {isDescriptionExpanded ? 'Show less' : 'Show more'}
                            </button>
                          )}
                        </div>
                      )}

                      {/* Tags */}
                      {jobData.tags && jobData.tags.length > 0 && (
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p className="text-small text-gray-500 mb-2">Tags</p>
                          <div className="flex flex-wrap gap-2">
                            {jobData.tags.map((tag, index) => (
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
                      {jobData.jobApplicationsDocs && jobData.jobApplicationsDocs.length > 0 && (
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p className="text-small text-gray-500 mb-3">Job Requirements Documents</p>
                          <div className="space-y-3">
                            {jobData.jobApplicationsDocs.map((doc) => (
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
                                    <p className="text-tiny text-gray-500 mb-1">Deliverables:</p>
                                    <p className="text-small text-black whitespace-pre-wrap">
                                      {expandedDocs[`${doc.id}-deliverables`]
                                        ? doc.deliverables
                                        : getPreviewText(doc.deliverables, DOC_PREVIEW_LIMIT)}
                                    </p>
                                    {doc.deliverables.length > DOC_PREVIEW_LIMIT && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setExpandedDocs((prev) => ({
                                            ...prev,
                                            [`${doc.id}-deliverables`]: !prev[`${doc.id}-deliverables`],
                                          }))
                                        }
                                        className="mt-1 text-tiny font-medium text-gray-500 hover:underline"
                                      >
                                        {expandedDocs[`${doc.id}-deliverables`] ? 'Show less' : 'Show more'}
                                      </button>
                                    )}
                                  </div>
                                )}
                                {doc.out_of_scope && (
                                  <div className="mb-2">
                                    <p className="text-tiny text-gray-500 mb-1">Out of Scope:</p>
                                    <p className="text-small text-black whitespace-pre-wrap">
                                      {expandedDocs[`${doc.id}-out_of_scope`]
                                        ? doc.out_of_scope
                                        : getPreviewText(doc.out_of_scope, DOC_PREVIEW_LIMIT)}
                                    </p>
                                    {doc.out_of_scope.length > DOC_PREVIEW_LIMIT && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setExpandedDocs((prev) => ({
                                            ...prev,
                                            [`${doc.id}-out_of_scope`]: !prev[`${doc.id}-out_of_scope`],
                                          }))
                                        }
                                        className="mt-1 text-tiny font-medium text-gray-500 hover:underline"
                                      >
                                        {expandedDocs[`${doc.id}-out_of_scope`] ? 'Show less' : 'Show more'}
                                      </button>
                                    )}
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
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p className="text-small text-gray-500 mb-1">Location</p>
                          <p className="text-normal text-black capitalize">{jobData.location || 'Remote'}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p className="text-small text-gray-500 mb-1">Token</p>
                          <p className="text-normal text-black">{jobData.token_symbol || 'BNB'}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Bids Tab */}
                  {activeTab === 'bids' && (
                    <div className="space-y-3">
                      {jobData.bids && jobData.bids.length > 0 ? (
                        jobData.bids.map((bid) => (
                          <div
                            key={bid.id}
                            className="p-4 bg-gray-50 rounded-lg"
                          >
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
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
                              <div className="text-left sm:text-right">
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
                                <p className="whitespace-pre-wrap">
                                  {expandedBids[bid.id]
                                    ? bid.cover_letter_md
                                    : getPreviewText(bid.cover_letter_md, BID_PREVIEW_LIMIT)}
                                </p>
                                {bid.cover_letter_md.length > BID_PREVIEW_LIMIT && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setExpandedBids((prev) => ({
                                        ...prev,
                                        [bid.id]: !prev[bid.id],
                                      }))
                                    }
                                    className="mt-2 text-small font-medium text-gray-500 hover:underline"
                                  >
                                    {expandedBids[bid.id] ? 'Show less' : 'Show more'}
                                  </button>
                                )}
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
                      {jobData.milestones && jobData.milestones.length > 0 ? (
                        jobData.milestones.map((milestone, index) => (
                          <div
                            key={milestone.id}
                            className={`p-4 rounded-lg ${
                              isDisputeStatus(milestone.status)
                                ? 'bg-red-50 border-2 border-red-200'
                                : 'bg-gray-50'
                            }`}
                          >
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
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
                              <div className="text-left sm:text-right">
                                <p className="text-normal font-bold text-[#7E3FF2]">
                                  {milestone.amount} {jobData.token_symbol || 'BNB'}
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
                                Escrow: {milestone.escrow}
                              </p>
                            )}
                            {milestone.ipfs && (
                              <a
                                href={`${CONFIG.ipfsGateWay}/${milestone.ipfs}`}
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
                  {activeTab === 'dispute' && jobData.hasDispute && (
                    <div className="space-y-6">
                      {/* Disputed Milestones */}
                      <div>
                        <h4 className="text-normal font-bold text-red-600 mb-3">Disputed Milestones</h4>
                        <div className="space-y-3">
                          {jobData.disputedMilestones.map((milestone) => (
                            <div
                              key={milestone.id}
                              className="p-4 bg-red-50 border-2 border-red-200 rounded-lg"
                            >
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                  <h5 className="text-normal font-medium text-black">{milestone.title}</h5>
                                  <p className="text-small text-gray-600 mt-1">
                                    Status: <span className="text-red-600 font-medium">{milestone.status}</span>
                                  </p>
                                </div>
                                <p className="text-normal font-bold text-red-600">
                                  {milestone.amount} {jobData.token_symbol || 'BNB'}
                                </p>
                              </div>
                              {milestone.ipfs && (
                                <a
                                  href={`${CONFIG.ipfsGateWay}/${milestone.ipfs}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="mt-3 inline-block text-small text-[#7E3FF2] hover:underline"
                                >
                                  📎 Deliverd Work (IPFS)
                                </a>
                              )}
                              {milestone.status == "disputedWithCounterSide" && (
                                <div className='flex sm:flex-row flex-col sm:items-start gap-2 mt-4'>
                                  <Button
                                    padding='px-4 py-1.5'
                                    onClick={() => handleResolveToClient(milestone.id)}
                                  >
                                    Resolve to client
                                  </Button>
                                  <Button
                                    padding='px-4 py-1.5'
                                    onClick={() => handleResolveToFreelancer(milestone.id)}
                                  >
                                    Resolve to freelancer
                                  </Button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Chat History */}
                      {jobData.disputeChatHistory && jobData.disputeChatHistory.length > 0 && (
                        <div>
                          <h4 className="text-normal font-bold text-black mb-3">
                            Chat History ({jobData.disputeChatHistory.length} messages)
                          </h4>
                          <div className="bg-gray-50 rounded-lg p-4 max-h-[400px] overflow-y-auto space-y-3">
                            {jobData.disputeChatHistory.map((message) => (
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
                                <AdminMessagePreview message={message} />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Dates */}
                <div className="flex flex-col gap-2 sm:flex-row sm:justify-between text-small text-gray-500 pt-4 border-t border-gray-200">
                  <span>Created: {new Date(jobData.created_at).toLocaleString()}</span>
                  <span>Updated: {new Date(jobData.updated_at).toLocaleString()}</span>
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
