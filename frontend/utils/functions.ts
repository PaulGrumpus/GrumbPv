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
