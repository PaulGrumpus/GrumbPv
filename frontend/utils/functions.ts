import { EscrowBackend } from "../service/axios";
import { decodeToken } from "./jwt";
import { User } from "../types/user";
import { NextResponse } from "next/server";

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

export const createUserWithEmail = async (email: string, role: string) => {
    try {
        const response = await EscrowBackend.post('/database/users/with-email', {
            email,
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

export const updateUser = async (user: User) => {
    try {
        const response = await EscrowBackend.post(`/database/users/${user.id}`, 
            user,
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            }
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
