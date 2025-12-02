import { EscrowBackend } from "../service/axios";
import { decodeToken } from "./jwt";
import { User } from "../types/user";
import { NextResponse } from "next/server";
import { Job } from "@/types/jobs";
import { Gig } from "@/types/gigs";
import { Bid, BidStatus } from "@/types/bid";

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

            formData.append(field, value);
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

// Jobs
export const createJob = async (job: Job, imageFile?: File | null) => {
    try {
        const formData = new FormData();
        const fieldsToSend: Array<keyof Job> = [
            'title',
            'description_md',
            'budget_min_usd',
            'budget_max_usd',
            'location',
            'deadline_at',
            'client_id',
            'status',
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
        const response = await EscrowBackend.post('/database/jobs', formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        console.log(response.data);

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

// Gigs
export const createGig = async (gig: Gig, imageFile?: File | null) => {
    try {
        const formData = new FormData();
        const fieldsToSend: Array<keyof Gig> = [
            'title',
            'description_md',
            'budget_min_usd',
            'budget_max_usd',
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

// Bids
export const createBid = async (bid: Bid) => {
    try {
        const response = await EscrowBackend.post('/database/job-bids', bid);
        console.log(response.data);
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