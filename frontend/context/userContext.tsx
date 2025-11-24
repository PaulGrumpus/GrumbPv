'use client';

import { 
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState
} from "react";
import { UserContextType, User } from "@/types/user";
import { getUserInfo } from "@/src/utils/functions";
import { decodeToken } from "@/src/utils/help";
import { LoadingCtx } from "./loadingContext";

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
    const { setLoadingState } = useContext(LoadingCtx);

    const init = async () => {
        setLoadingState("pending");
        const token = localStorage.getItem('token');
        if(token) {
            const decodedToken = decodeToken(token);
            
            const userInfo = await getUserInfo({ emailAddr: decodedToken?.email || '' });
            if(userInfo.error) {
                setUserInfoError(userInfo.error);
                setAuthState("failure");
            } else {
                setUserInfoData(userInfo.data.data);
                setAuthState("success");
            }
        } else {
            setAuthState("failure");
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
        if(!isInvitePage && !isPrivacyPage && !isTermsPage && !isFAQPage) {
            init();
        }
    }, []);

    // Check if we're on the invite page

    return (
        <UserInfoCtx.Provider value={{ userInfoData, setUserInfoData, userInfoError, setUserInfoError }}>
            {children}
        </UserInfoCtx.Provider>
    )
}

export {UserInfoCtx, UserInfoProvider};