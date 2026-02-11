import { EscrowBackend } from "../service/axios";
import { decodeToken } from "./jwt";
import { User } from "../types/user";
import { NextResponse } from "next/server";
import { Job, JobStatus } from "@/types/jobs";
import { Gig } from "@/types/gigs";
import { Bid, BidStatus } from "@/types/bid";
import { JobApplication } from "@/types/jobApplication";
import { JobMilestone } from "@/types/jobMilestone";

// Users
export const createUserWithAddress = async (address: string, role: string) => {
    try {
        const response = await EscrowBackend.post('/database/users/with-address', {
            address,
            role,
        });

        const token = response.data.data;
        const decodedToken = decodeToken(token);

        if (!decodedToken) {
            return { success: false, error: 'Invalid token' };
        }

        localStorage.setItem('token', token);
        const res = NextResponse.json({ success: true });

        res.cookies.set("token", token, {
            httpOnly: true,
            secure: true,
            path: "/"
        });

        return { success: true, data: decodedToken };

    } catch (error: any) {
        return {
            success: false,
            error: error.response?.data?.error?.message || error.message || "Unknown error"
        };
    }
}

export const createUserWithEmail = async (email: string, password: string, role: string) => {
    try {
        const response = await EscrowBackend.post('/database/users/with-email', {
            email,
            password,
            role,
        });

        const token = response.data.data;
        const decodedToken = decodeToken(token);

        if (!decodedToken) {
            return { success: false, error: 'Invalid token' };
        }

        localStorage.setItem('token', token);

        return { success: true, data: decodedToken };

    } catch (error: any) {
        return {
            success: false,
            error: error.response?.data?.error?.message || error.message || "Unknown error"
        };
    }
}

export const updateUserFunds = async (user_id: string, fund: number, num: number) => {
    try {
        const response = await EscrowBackend.post(`/database/users/by-id/${user_id}/funds`, { fund, num });
        return {
            success: true,
            data: response.data.data,
        };
    }
    catch (error: any) {
        return {
            success: false,
            error: error.response?.data?.error?.message || error.message || "Unknown error"
        };
    }
}

export const updateUser = async (user: User, imageFile?: File | null) => {
    try {
        const formData = new FormData();
        const fieldsToSend: Array<keyof User> = [
            'address',
            'chain',
            'email',
            'password',
            'role',
            'display_name',
            'bio',
            'country_code',
            'image_id',
            'is_verified',
        ];

        fieldsToSend.forEach((field) => {
            const value = user[field];

            if (value === undefined || value === null || value === '') {
                return;
            }

            if (typeof value === 'boolean') {
                formData.append(field, value ? 'true' : 'false');
                return;
            }

            formData.append(field, value.toString());
        });

        if (imageFile) {
            formData.append('image', imageFile);
        }

        const response = await EscrowBackend.post(
            `/database/users/${user.id}`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
            // {
            //     headers: {
            //         Authorization: `Bearer ${localStorage.getItem('token')}`,
            //     },
            // }
        );

        const token = response.data.data;
        const decodedToken = decodeToken(token);

        if (!decodedToken) {
            return { success: false, error: 'Invalid token' };
        }

        localStorage.setItem('token', token);

        return { success: true, data: decodedToken };

    } catch (error: any) {
        return {
            success: false,
            error: error.response?.data?.error?.message || error.message || "Unknown error"
        };
    }
}

export const loginWithAddress = async (address: string) => {
    try {
        const response = await EscrowBackend.get(`/database/users/by-address/${address}`);
        
        const token = response.data.data;
        const decodedToken = decodeToken(token);

        if (!decodedToken) {
            return { success: false, error: 'Invalid token' };
        }

        localStorage.setItem('token', token);
        const res = NextResponse.json({ success: true });

        res.cookies.set("token", token, {
            httpOnly: true,
            secure: true,
            path: "/"
        });

        return { success: true, data: decodedToken };

    } catch (error: any) {
        return {
            success: false,
            error: error.response?.data?.error?.message || error.message || "Unknown error"
        };
    }
}

export const checkUserByAddress = async (address: string) => {
    try {
        const response = await EscrowBackend.get(`/database/users/by-address/${address}`);

        const token = response.data.data;
        const decodedToken = decodeToken(token);

        if (!decodedToken) {
            return { success: false, error: 'Invalid token' };
        }

        return {
            success: true,
            data: decodedToken,
        };
    }
    catch (error: any) {
        return {
            success: false,
            error: error.response?.data?.error?.message || error.message || "Unknown error"
        };
    }
}

export const loginWithEmail = async (email: string, password: string) => {
    try {
        const response = await EscrowBackend.put('/database/users/by-email-and-password', {
            email,
            password,
        });

        const token = response.data.data;
        const decodedToken = decodeToken(token);

        if (!decodedToken) {
            return { success: false, error: 'Invalid token' };
        }

        localStorage.setItem('token', token);
        const res = NextResponse.json({ success: true });

        res.cookies.set("token", token, {
            httpOnly: true,
            secure: true,
            path: "/"
        });

        return { success: true, data: decodedToken };
    }
    catch (error: any) {
        return {
            success: false,
            error: error.response?.data?.error?.message || error.message || "Unknown error"
        };
    }
}

export const getUserById = async (user_id: string) => {
    try {
        const response = await EscrowBackend.get(`/database/users/by-id/${user_id}`);
        return {
            success: true,
            data: response.data.data,
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.response?.data?.error?.message || error.message || "Unknown error"
        };
    }
}

export const resetPassword = async (email: string) => {
    try {
        const response = await EscrowBackend.post(`/database/users/reset-password`, { email });
        return {
            success: true,
            data: response.data.data,
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.response?.data?.error?.message || error.message || "Unknown error"
        };
    }
}

export const updateUserPassword = async (user_id: string, password: string) => {
    try {
        const response = await EscrowBackend.post(`/database/users/by-id/${user_id}/password`, { password });
        return {
            success: true,
            data: response.data.data,
        };
    }
    catch (error: any) {
        return {
            success: false,
            error: error.response?.data?.error?.message || error.message || "Unknown error"
        };
    }
}

// Jobs
export const createJob = async (job: Job, imageFile?: File | null) => {
    try {
        const formData = new FormData();
        const fieldsToSend: Array<keyof Job> = [
            'title',
            'description_md',
            'budget_min',
            'budget_max',
            'token_symbol',
            'tags',
            'location',
            'deadline_at',
            'status',
            'client_id',
        ];

        fieldsToSend.forEach((field) => {
            const value = job[field];

            if (value === undefined || value === null || value === '') {
                return;
            }

            if (typeof value === 'boolean') {
                formData.append(field, value ? 'true' : 'false');
                return;
            }

            formData.append(field, value.toString());
        });
        if (imageFile) {
            formData.append('image', imageFile);
        }
        const response = await EscrowBackend.post('/database/jobs', formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        return {
            success: true,
            data: response.data.data,
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.response?.data?.error?.message || error.message || "Unknown error"
        };
    }
}

export const updateJob = async (job_id: string, job: Job, imageFile?: File | null) => {
    try {
        const formData = new FormData();
        const fieldsToSend: Array<keyof Job> = [
            'title',
            'description_md',
            'budget_min',
            'budget_max',
            'token_symbol',
            'location',
            'deadline_at',
            'status',
            'client_id',
            'image_id',
            'tags',
        ];

        fieldsToSend.forEach((field) => {
            const value = job[field];

            if (value === undefined || value === null || value === '') {
                return;
            }

            if (typeof value === 'boolean') {
                formData.append(field, value ? 'true' : 'false');
                return;
            }

            formData.append(field, value.toString());
        });
        formData.append('tags', JSON.stringify(job.tags ?? []));
        if (imageFile) {
            formData.append('image', imageFile);
        }
        const response = await EscrowBackend.post(`/database/jobs/${job_id}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        return {
            success: true,
            data: response.data.data,
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.response?.data?.error?.message || error.message || "Unknown error"
        };
    }
}

export const updateJobStatusById = async (job_id: string, status: JobStatus) => {
    try {
        const response = await EscrowBackend.post(`/database/jobs/${job_id}/status`, { status });
        return {
            success: true,
            data: response.data.data,
        };
    }
    catch (error: any) {
        return {
            success: false,
            error: error.response?.data?.error?.message || error.message || "Unknown error"
        };
    }
}

export const getJobsByClientId = async (client_id: string) => {
    try {
        const response = await EscrowBackend.get(`/database/jobs/by-client-id/${client_id}`);
        return {
            success: true,
            data: response.data.data,
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.response?.data?.error?.message || error.message || "Unknown error"
        };
    }
}

export const getJobs = async () => {
    try {
        const response = await EscrowBackend.get('/database/jobs');
        return {
            success: true,
            data: response.data.data,
        };
    }
    catch (error: any) {
        return {
            success: false,
            error: error.response?.data?.error?.message || error.message || "Unknown error"
        };
    }
}

export const getJobById = async (job_id: string) => {
    try {
        const response = await EscrowBackend.get(`/database/jobs/by-id/${job_id}`);
        return {
            success: true,
            data: response.data.data,
        };
    }
    catch (error: any) {
        return {
            success: false,
            error: error.response?.data?.error?.message || error.message || "Unknown error"
        };
    }
}

// Job Milestones
export const getJobMilestoneById = async (job_milestone_id: string) => {
    try {
        const response = await EscrowBackend.get(`/database/job-milestones/by-id/${job_milestone_id}`);
        return {
            success: true,
            data: response.data.data,
        };
    }
    catch (error: any) {
        return {
            success: false,
            error: error.response?.data?.error?.message || error.message || "Unknown error"
        };
    }
}

export const getJobMilestonesByJobId = async (job_id: string) => {
    try {
        const response = await EscrowBackend.get(`/database/job-milestones/by-job-id/${job_id}`);
        return {
            success: true,
            data: response.data.data,
        };
    }
    catch (error: any) {
        return {
            success: false,
            error: error.response?.data?.error?.message || error.message || "Unknown error"
        };
    }
}

export const updateJobMilestone = async (job_milestone_id: string, jobMilestone: JobMilestone) => {
    try {
        const response = await EscrowBackend.post(`/database/job-milestones/${job_milestone_id}`, jobMilestone);
        return {
            success: true,
            data: response.data.data,
        };
    }
    catch (error: any) {
        return {
            success: false,
            error: error.response?.data?.error?.message || error.message || "Unknown error"
        };
    }
}

export const getJobMilestonesByUserId = async (user_id: string) => {
    try {
        const response = await EscrowBackend.get(`/database/job-milestones/by-user-id/${user_id}`);
        return {
            success: true,
            data: response.data.data,
        };
    }
    catch (error: any) {
        return {
            success: false,
            error: error.response?.data?.error?.message || error.message || "Unknown error"
        };
    }
}

export const getJobMilestoneByEscrowAddress = async (escrow_address: string) => {
    try {
        const response = await EscrowBackend.get(`/database/job-milestones/by-escrow-address/${escrow_address}`);
        return {
            success: true,
            data: response.data.data,
        };  
    }
    catch (error: any) {
        return {
            success: false,
            error: error.response?.data?.error?.message || error.message || "Unknown error"
        };
    }
}

// Gigs
export const createGig = async (gig: Gig, imageFile?: File | null) => {
    try {
        const formData = new FormData();
        const fieldsToSend: Array<keyof Gig> = [
            'title',
            'description_md',
            'budget_min',
            'budget_max',
            'token_symbol',
            'tags',
            'link',
            'freelancer_id',
        ];

        fieldsToSend.forEach((field) => {
            const value = gig[field];

            if (value === undefined || value === null || value === '') {
                return;
            }

            if (typeof value === 'boolean') {
                formData.append(field, value ? 'true' : 'false');
                return;
            }

            formData.append(field, value.toString());
        });
        // formData.append('tags', JSON.stringify(gig.tags ?? []));
        if (imageFile) {
            formData.append('image', imageFile);
        }
        const response = await EscrowBackend.post('/database/gigs', formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        return {
            success: true,
            data: response.data.data,
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.response?.data?.error?.message || error.message || "Unknown error"
        };
    }
}

export const updateGig = async (gig_id: string, gig: Gig, imageFile?: File | null) => {
    try {
        const formData = new FormData();
        const fieldsToSend: Array<keyof Gig> = [
            'title',
            'description_md',
            'budget_min',
            'budget_max',
            'token_symbol',
            'tags',
            'link',
            'freelancer_id',
        ];

        fieldsToSend.forEach((field) => {
            const value = gig[field];

            if (value === undefined || value === null || value === '') {
                return;
            }

            if (typeof value === 'boolean') {
                formData.append(field, value ? 'true' : 'false');
                return;
            }

            formData.append(field, value.toString());
        });
        if (imageFile) {
            formData.append('image', imageFile);
        }
        const response = await EscrowBackend.post(`/database/gigs/${gig_id}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        return {
            success: true,
            data: response.data.data,
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.response?.data?.error?.message || error.message || "Unknown error"
        };
    }
}

export const getGigsByFreelancerId = async (freelancer_id: string) => {
    try {
        const response = await EscrowBackend.get(`/database/gigs/by-freelancer-id/${freelancer_id}`);
        return {
            success: true,
            data: response.data.data,
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.response?.data?.error?.message || error.message || "Unknown error"
        };
    }
}

export const getGigs = async () => {
    try {
        const response = await EscrowBackend.get('/database/gigs');
        return {
            success: true,
            data: response.data.data,
        };
    }
    catch (error: any) {
        return {
            success: false,
            error: error.response?.data?.error?.message || error.message || "Unknown error"
        };
    }
}

export const getGigById = async (id: string) => {
    try {
        const response = await EscrowBackend.get(`/database/gigs/by-id/${id}`);
        return {
            success: true,
            data: response.data.data,
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.response?.data?.error?.message || error.message || "Unknown error"
        };
    }
}

// Bids
export const createBid = async (bid: Bid) => {
    try {
        const response = await EscrowBackend.post('/database/job-bids', bid);
        return {
            success: true,
            data: response.data.data,
        };
    }
    catch (error: any) {
        return {
            success: false,
            error: error.response?.data?.error?.message || error.message || "Unknown error"
        };
    }
}

export const getBidById = async (bid_id: string) => {
    try {
        const response = await EscrowBackend.get(`/database/job-bids/by-id/${bid_id}`);
        return {
            success: true,
            data: response.data.data,
        };
    }
    catch (error: any) {
        return {
            success: false,
            error: error.response?.data?.error?.message || error.message || "Unknown error"
        };
    }
}


export const getJobBidForClientById = async (bid_id: string) => {
    try {
        const response = await EscrowBackend.get(`/database/job-bids/by-id-client/${bid_id}`);
        return {
            success: true,
            data: response.data.data,
        };
    }
    catch (error: any) {
        return {
            success: false,
            error: error.response?.data?.error?.message || error.message || "Unknown error"
        };
    }
}

export const getBidsByFreelancerId = async (freelancer_id: string) => {
    try {
        const response = await EscrowBackend.get(`/database/job-bids/by-freelancer-id/${freelancer_id}`);
        return {
            success: true,
            data: response.data.data,
        };
    }
    catch (error: any) {
        return {
            success: false,
            error: error.response?.data?.error?.message || error.message || "Unknown error"
        };
    }
}

export const getBidsByJobId = async (job_id: string) => {
    try {
        const response = await EscrowBackend.get(`/database/job-bids/by-job-id/${job_id}`);
        return {
            success: true,
            data: response.data.data,
        };
    }
    catch (error: any) {
        return {
            success: false,
            error: error.response?.data?.error?.message || error.message || "Unknown error"
        };
    }
}

export const updateBidStatus = async (bid_id: string, status: BidStatus, job_id: string, freelancer_id: string) => {
    try {
        const response = await EscrowBackend.post(`/database/job-bids/${bid_id}`, { 
            status,
            job_id,
            freelancer_id,
        });
        return {
            success: true,
            data: response.data.data,
        };
    }
    catch (error: any) {
        return {
            success: false,
            error: error.response?.data?.error?.message || error.message || "Unknown error"
        };
    }
}

// Job Applications
export const createJobApplication = async (jobApplication: JobApplication) => {
    try {
        const response = await EscrowBackend.post('/database/job-applications', jobApplication);
        return {
            success: true,
            data: response.data.data,
        };
    }
    catch (error: any) {
        return {
            success: false,
            error: error.response?.data?.error?.message || error.message || "Unknown error"
        };
    }
}

export const updateJobApplication = async (job_application_id: string, user_id: string, jobApplication: JobApplication) => {
    try {
        const response = await EscrowBackend.post(`/database/job-applications/${job_application_id}/${user_id}`, jobApplication);
        return {
            success: true,
            data: response.data.data,
        };
    }
    catch (error: any) {
        return {
            success: false,
            error: error.response?.data?.error?.message || error.message || "Unknown error"
        };
    }
}

export const getJobApplicationById = async (job_application_id: string) => {
    try {
        const response = await EscrowBackend.get(`/database/job-applications/by-id/${job_application_id}`);
        return {
            success: true,
                data: response.data.data,
            };
    } catch (error: any) {
        return {
            success: false,
            error: error.response?.data?.error?.message || error.message || "Unknown error"
        };
    }
}

export const deleteJobApplication = async (job_application_id: string) => {
    try {
        const response = await EscrowBackend.delete(`/database/job-applications/${job_application_id}`);
        return {
            success: true,
            data: response.data.data,
        };
    }
    catch (error: any) {
        return {
            success: false,
            error: error.response?.data?.error?.message || error.message || "Unknown error"
        };
    }
}

export const getJobApplicationsByUserId = async (user_id: string) => {
    try {
        const response = await EscrowBackend.get(`/database/job-applications/by-user-id/${user_id}`);
        return {
            success: true,
            data: response.data.data,
        };
    }
    catch (error: any) {
        return {
            success: false,
            error: error.response?.data?.error?.message || error.message || "Unknown error"
        };
    }
}

// conversations
export const createConversationAndParticipant = async (job_application_doc_id: string, job_id: string, gig_id: string, client_id: string, freelancer_id: string) => {
    try {
        const response = await EscrowBackend.post('/database/conversations', {
            type: 'dm',
            job_id: job_id === "" ? null : job_id,
            gig_id: gig_id === "" ? null : gig_id,
            job_application_doc_id: job_application_doc_id === "" ? null : job_application_doc_id,
            client_id,
            freelancer_id,
        });

        if (!response.data.success) {
            throw new Error(response.data.error);
        }

        // const clientParticipant = await EscrowBackend.post('/database/conversation-participants', {
        //     conversation_id: response.data.data.id,
        //     user_id: client_id,
        //     is_muted: false,
        //     is_pinned: false,
        //     last_read_msg_id: null,
        // });

        // if (!clientParticipant.data.success) {
        //     throw new Error(clientParticipant.data.error);
        // }

        // const freelancerParticipant = await EscrowBackend.post('/database/conversation-participants', {
        //     conversation_id: response.data.data.id,
        //     user_id: freelancer_id,
        //     is_muted: false,
        //     is_pinned: false,
        //     last_read_msg_id: null,
        // });

        // if (!freelancerParticipant.data.success) {
        //     throw new Error(freelancerParticipant.data.error);
        // }

        const conversationData = response.data.data;

        return {
            success: true,
            data: conversationData,
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.response?.data?.error?.message || error.message || "Unknown error"
        };
    }
}

export const getConversationByParticipant = async (user_id: string) => {
    try {
        const response = await EscrowBackend.get(`/database/conversation-participants/by-user-id/${user_id}`);
        return {
            success: true,
            data: response.data.data,
        };
    }
    catch (error: any) {
        return {
            success: false,
            error: error.response?.data?.error?.message || error.message || "Unknown error"
        };
    }
}

export const getConversationById = async (conversation_id: string) => {
    try {
        const response = await EscrowBackend.get(`/database/conversations/by-id/${conversation_id}`);
        return {
            success: true,
            data: response.data.data,
        };
    }
    catch (error: any) {
        return {
            success: false,
            error: error.response?.data?.error?.message || error.message || "Unknown error"
        };
    }
}

// Messages
export const getMessagesByDateRangeAndConversationIds = async (startDate: string, endDate: string, conversationIds: string[]) => {
    try {
        const response = await EscrowBackend.post(`/database/messages/date-range/${startDate}/${endDate}`,
            {
                conversationIds,
            }
        );
        return {
            success: true,
            data: response.data.data,
        };
    }
    catch (error: any) {
        return {
            success: false,
            error: error.response?.data?.error?.message || error.message || "Unknown error"
        };
    }
}

export const getAllMessagesByConversationIds = async (conversationIds: string[]) => {

    try {
        const response = await EscrowBackend.post('/database/messages/all',
            {
                conversationIds,
            }
        );
        return {
            success: true,
            data: response.data.data,
        };
    }
    catch (error: any) {
        return {
            success: false,
            error: error.response?.data?.error?.message || error.message || "Unknown error"
        };
    }
}

// web3
export const fundEscrow = async (userId: string, job_milestone_id: string, chainId: number) => {
    try {
        const response = await EscrowBackend.post(`/contract/escrow/${job_milestone_id}/fund`, {
            userId,
            chainId,
        });
        return {
            success: true,
            data: response.data.data,
        };
    }
    catch (error: any) {
        return {
            success: false,
            error: error.response?.data?.error?.message || error.message || "Unknown error"
        };
    }
}

export const deliverWork = async (userId: string, job_milestone_id: string, chainId: number, file?: File | null, cid?: string, contentHash?: string) => {
    try {
        const formData = new FormData();
        formData.append('userId', userId);
        formData.append('chainId', chainId.toString());
        if (file) {
            formData.append('file', file);
        }
        if (cid) {
            formData.append('cid', cid);
        }
        if (contentHash) {
            formData.append('contentHash', contentHash);
        }

        const response = await EscrowBackend.post(
            `/contract/escrow/${job_milestone_id}/deliver`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
            // {
            //     headers: {
            //         Authorization: `Bearer ${localStorage.getItem('token')}`,
            //     },
            // }
        );

        return {
            success: true,
            data: response.data.data,
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.response?.data?.error?.message || error.message || "Unknown error"
        };
    }
}

export const approveWork = async (userId: string, job_milestone_id: string, chainId: number, cid: string) => {
    try {
        const response = await EscrowBackend.post(`/contract/escrow/${job_milestone_id}/approve`, {
            userId,
            chainId,
            cid,
        });
        return {
            success: true,
            data: response.data.data,
        };
    }
    catch (error: any) {
        return {
            success: false,
            error: error.response?.data?.error?.message || error.message || "Unknown error"
        };
    }
}

export const withdrawFunds = async (userId: string, job_milestone_id: string, chainId: number) => {
    try {
        const response = await EscrowBackend.post(`/contract/escrow/${job_milestone_id}/withdraw`, {
            userId,
            chainId,
        });
        return {
            success: true,
            data: response.data.data,
        };
    }
    catch (error: any) {
        return {
            success: false,
            error: error.response?.data?.error?.message || error.message || "Unknown error"
        };
    }
}

export const initiateDispute = async (userId: string, job_milestone_id: string, chainId: number) => {
    try {
        const response = await EscrowBackend.post(`/contract/escrow/${job_milestone_id}/dispute/initiate`, {
            userId,
            chainId,
        });
        return {
            success: true,
            data: response.data.data,
        };
    }
    catch (error: any) {
        return {
            success: false,
            error: error.response?.data?.error?.message || error.message || "Unknown error"
        };
    }
}

export const venderPayDisputeFee = async (userId: string, job_milestone_id: string, chainId: number) => {
    try {
        const response = await EscrowBackend.post(`/contract/escrow/${job_milestone_id}/dispute/vender-pay-fee`, {
            userId,
            chainId,
        });
        return {
            success: true,
            data: response.data.data,
        };
    }
    catch (error: any) {
        return {
            success: false,
            error: error.response?.data?.error?.message || error.message || "Unknown error"
        };
    }
}
export const buyerJoinDispute = async (userId: string, job_milestone_id: string, chainId: number) => {
    try {
        const response = await EscrowBackend.post(`/contract/escrow/${job_milestone_id}/dispute/buyer-join`, {
            userId,
            chainId,
        });
        return {
            success: true,
            data: response.data.data,
        };
    }
    catch (error: any) {
        return {
            success: false,
            error: error.response?.data?.error?.message || error.message || "Unknown error"
        };
    }
}

// Notifications
export const getNotificationsByUserIdWithFilters = async (user_id: string, read?: boolean) => {
    try {
        const response = await EscrowBackend.post(`/database/notifications/by-user-id/${user_id}`, {
            read: read ?? undefined,
        });
        return {
            success: true,
            data: response.data.data,
        };
    }
    catch (error: any) {
        return {
            success: false,
            error: error.response?.data?.error?.message || error.message || "Unknown error"
        };
    }
}

export const updateNotification = async (notification_id: string, read_at: Date) => {
    try {
        const response = await EscrowBackend.post(`/database/notifications/${notification_id}`, {
            read_at: read_at,
        });
        return {
            success: true,
            data: response.data,
        };
    }
    catch (error: any) {
        return {
            success: false,
            error: error.response?.data?.error?.message || error.message || "Unknown error"
        };
    }
}

export const markAllNotificationsAsRead = async (user_id: string) => {
    try {
        const response = await EscrowBackend.post(`/database/notifications/mark-all-as-read/${user_id}`);
        return {
            success: true,
            data: response.data.data,
        };
    }
    catch (error: any) {
        return {
            success: false,
            error: error.response?.data?.error?.message || error.message || "Unknown error"
        };
    }
}

// Dashboard
export const getDashboardDataByUserId = async (user_id: string, role: string) => {
    try {
        const response = await EscrowBackend.post(`/database/dashboard/by-user-id/${user_id}`, {
            role
        });
        return {
            success: true,
            data: response.data.data,
        };
    }
    catch (error: any) {
        return {
            success: false,
            error: error.response?.data?.error?.message || error.message || "Unknown error"
        };
    }
}

// Upload
export const uploadFile = async (file: File) => {
    try {
        const formData = new FormData();
        formData.append('file', file);
        const response = await EscrowBackend.post('/upload', formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return {
            success: true,
            data: response.data.data,
        };
    }
    catch (error: any) {
        return {
            success: false,
            error: error.response?.data?.error?.message || error.message || "Unknown error"
        };
    }
}

// Chain Txs
export const createChainTx = async (purpose: string, chain_id: number, job_milestone_id: string, from_address: string, to_address: string, tx_hash: string, status: string, user_id: string) => {
    try {
        const response = await EscrowBackend.post(`/database/chain-txs/create`, {
            purpose,
            chain_id,
            job_milestone_id,
            from_address,
            to_address,
            tx_hash,
            status,
            user_id,
        });
        return {
            success: true,
            data: response.data.data,
        };
    }
    catch (error: any) {
        return {
            success: false,
            error: error.response?.data?.error?.message || error.message || "Unknown error"
        };
    }
}

// System States
export const increaseFund = async (amount: number) => {
    try {
        const response = await EscrowBackend.post(`/database/system-states/increase-fund`, { amount });
        return {
            success: true,
            data: response.data.data,
        };
    }   
    catch (error: any) {
        return {
            success: false,
            error: error.response?.data?.error?.message || error.message || "Unknown error"
        };
    }
}

export const increaseWithdraw = async (amount: number) => {
    try {
        const response = await EscrowBackend.post(`/database/system-states/increase-withdraw`, { amount });
        return {
            success: true,
            data: response.data.data,
        };
    }
    catch (error: any) {
        return {
            success: false,
            error: error.response?.data?.error?.message || error.message || "Unknown error"
        };
    }
}

// Utils
export const formatDueDate = (deadline: number | string | undefined) => {
    if (deadline === null || deadline === undefined) {
        return "TBD";
    }

    const numericDeadline =
        typeof deadline === "number"
            ? deadline
            : Number.isNaN(Number(deadline))
                ? undefined
                : Number(deadline);

    const timestamp =
        numericDeadline !== undefined
            ? (numericDeadline > 1e12 ? numericDeadline : numericDeadline * 1000)
            : Date.parse(String(deadline));

    if (!Number.isFinite(timestamp)) {
        return "TBD";
    }

    return new Intl.DateTimeFormat(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit",
        timeZone: "UTC",
    }).format(new Date(timestamp));
};

export const formatHourMinute = (date: string) => {
    if(new Date(date).getTime() < (new Date().getTime() - 60 * 60 * 24 * 1000)) {
        return new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric'});
    }
    return new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

export const formatLabel = (value?: string) => {
    if (!value) {
        return "";
    }

    if (value.length <= 8) {
        return value;
    }

    const prefix = value.slice(0, 4);
    const suffix = value.slice(-4);
    return `${prefix}...${suffix}`;
};