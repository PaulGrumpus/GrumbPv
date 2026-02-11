export interface User {
    id: string;
    address?: string;
    chain: string;
    email?: string; 
    password?: string;
    role: string;
    display_name?: string;
    bio?: string;
    country_code?: string;
    is_verified: boolean;
    image_id?: string;    
    created_at: string;
    updated_at: string;
    finished_job_num: number;
    total_fund: number;
    fund_cycle?: number;
    fund_num?: number;
}

export interface UserContextType {
    userInfo: User;
    setUserInfo: React.Dispatch<React.SetStateAction<User>>;
    userInfoError: string;
    setUserInfoError: React.Dispatch<React.SetStateAction<string>>;
}