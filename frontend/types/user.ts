export interface User {
    id: string;
    address?: string;
    chain: string;
    email?: string;
    role: string;
    display_name?: string;
    bio?: string;
    country_code?: string;
    is_verified: boolean;
    image_id?: string;
    created_at: string;
    updated_at: string;
}

export interface UserContextType {
    userInfo: User;
    setUserInfo: React.Dispatch<React.SetStateAction<User>>;
    userInfoError: string;
    setUserInfoError: React.Dispatch<React.SetStateAction<string>>;
}