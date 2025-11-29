import jwt from 'jsonwebtoken';
import { User } from '../types/user';

export const decodeToken = (token: string) => {
    try {
        const decoded = jwt.decode(token);
        if(!decoded) {
            return null;
        }
        return decoded as unknown as User;
    } catch (error) {
        console.error('Error decoding token', error);
        return null;
    }
}
