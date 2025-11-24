import { EscrowBackend } from "../service/axios";
import { decodeToken } from "./jwt";
import { User } from "../types/user";

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

        return { success: true, data: decodedToken };

    } catch (error: any) {
        return {
            success: false,
            error: error.response?.data?.error?.message || error.message || "Unknown error"
        };
    }
}

export const createUserWithEmail = async (email: string, role: string) => {
    const response = await EscrowBackend.post('/database/users/with-email', {
        email,
        role,
    });
    if(response.status !== 200) {
        return { error: response.data.error.message };
    }
    const token = response.data.data;
    const decodedToken = decodeToken(token);
    if(!decodedToken) {
        return { error: 'Invalid token' };
    }
    localStorage.setItem('token', token);

    return { success: true, data: decodedToken };
}

export const updateUser = async (user: User) => {
    const response = await EscrowBackend.post(`/database/users/${user.id}`, 
        user,
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        });
    if(response.status !== 200) {
        return { error: response.data.error.message };
    }
    const token = response.data.data;
    const decodedToken = decodeToken(token);
    if(!decodedToken) {
        return { error: 'Invalid token' };
    }
    localStorage.setItem('token', token);

    return { success: true, data: decodedToken };
}