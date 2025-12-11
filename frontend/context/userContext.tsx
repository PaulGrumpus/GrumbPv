'use client';

import { 
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from "react";
import { usePathname } from "next/navigation";
import { UserContextType, User } from "@/types/user";
import { UserLoadingCtx } from "./userLoadingContext";
import { decodeToken } from "@/utils/jwt";

const defaultProvider: UserContextType = {
    userInfo: {
        id: '',
        address: '',
        chain: '',
        email: '',
        role: '',
        display_name: '',
        bio: '',
        country_code: '',
        is_verified: false,
        image_id: '',
        created_at: '',
        updated_at: ''
    },
    setUserInfo: () => {},
    userInfoError: '',
    setUserInfoError: () => {}
}

const UserInfoCtx = createContext<UserContextType>(defaultProvider);

type Props = {
    children: ReactNode;
}

const UserInfoProvider = ({ children }: Props) => {
    const [userInfo, setUserInfo] = useState<User>(defaultProvider.userInfo);
    const [userInfoError, setUserInfoError] = useState<string>(defaultProvider.userInfoError);
    const { setuserLoadingState } = useContext(UserLoadingCtx);
    const pathname = usePathname();

    const init = async () => {
        if (typeof window === "undefined") return;
        setuserLoadingState("pending");
        const token = localStorage.getItem('token');
        if(token) {
            const decodedToken = decodeToken(token);
            setUserInfo(decodedToken as User);
            setuserLoadingState("success");
        } else {
            setuserLoadingState("failure");
        }
    }
    const isInvitePage = typeof window !== 'undefined' && 
        window.location.pathname === '/invite';

    const isPrivacyPage = typeof window !== 'undefined' && 
        window.location.pathname === '/privacy';

    const isTermsPage = typeof window !== 'undefined' && 
        window.location.pathname === '/terms';

    const isFAQPage = typeof window !== 'undefined' && 
        window.location.pathname === '/faq';

    useEffect(() => {
        if(!['/invite', '/privacy', '/terms', '/faq'].includes(pathname)) {
            init();
        }
    }, [pathname]);

    // Check if we're on the invite page

    return (
        <UserInfoCtx.Provider value={{ userInfo, setUserInfo, userInfoError, setUserInfoError }}>
            {children}
        </UserInfoCtx.Provider>
    )
}

export {UserInfoCtx, UserInfoProvider};