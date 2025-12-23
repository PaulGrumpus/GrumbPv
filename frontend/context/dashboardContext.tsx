'use client';

import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from "react";

import {
    DashboardJob,
    DashboardBid,
    DashboardGig,
    DashboardConversation,
    DashboardNotification,
    DashboardContextType,
} from "@/types/dashboard";

import { UserLoadingCtx } from "./userLoadingContext";
import { DashboardLoadingCtx } from "./dashboardLoadingContext";
import { getDashboardDataByUserId } from "@/utils/functions";
import { UserInfoCtx } from "./userContext";

const defaultProvider: DashboardContextType = {
    jobsInfo: [],
    setJobsInfo: () => {},
  
    gigsInfo: [],
    setGigsInfo: () => {},
  
    bidsInfo: [],
    setBidsInfo: () => {},
  
    conversationsInfo: [],
    setConversationsInfo: () => {},
  
    notificationsInfo: [],
    setNotificationsInfo: () => {},
  
    dashboardError: '',
    setDashboardError: () => {}
};
  
export const DashboardCtx =
    createContext<DashboardContextType>(defaultProvider);
  
type Props = {
    children: ReactNode;
};
  
export const DashboardProvider = ({ children }: Props) => {
    const [jobsInfo, setJobsInfo] = useState<DashboardJob[]>([]);
    const [gigsInfo, setGigsInfo] = useState<DashboardGig[]>([]);
    const [bidsInfo, setBidsInfo] = useState<DashboardBid[]>([]);
    const [conversationsInfo, setConversationsInfo] = useState<DashboardConversation[]>([]);
    const [notificationsInfo, setNotificationsInfo] = useState<DashboardNotification[]>([]);
    const [dashboardError, setDashboardError] = useState<string>("");
    const { userInfo } = useContext(UserInfoCtx);
    const { userLoadingState, setuserLoadingState } = useContext(UserLoadingCtx);
    const { dashboardLoadingState, setdashboardLoadingState } = useContext(DashboardLoadingCtx);
  
    const init = async () => {
        if (userLoadingState === "success") {
            setdashboardLoadingState("pending");

            const userDahboard = await getDashboardDataByUserId(userInfo.id, userInfo.role);
            if(userDahboard.success) {
                setJobsInfo(userDahboard.data.jobs ?? []);
                setGigsInfo(userDahboard.data.gigs ?? []);
                setBidsInfo(userDahboard.data.bids ?? []);
                setConversationsInfo(userDahboard.data.conversations ?? []);
                setNotificationsInfo(userDahboard.data.notifications ?? []);
        
            } else {
                setJobsInfo([]);
                setGigsInfo([]);
                setBidsInfo([]);
                setConversationsInfo([]);
                setNotificationsInfo([]);
            }
            
            setdashboardLoadingState("success");
            
        } else {
            setdashboardLoadingState("failure");
        }
    };

    useEffect(() => {
        console.log("test-dashboardLoadingState", dashboardLoadingState);
    }, [dashboardLoadingState])
  
    useEffect(() => {
        init();
    }, [userLoadingState]);
  
    return (
        <DashboardCtx.Provider
            value={{
                jobsInfo,
                setJobsInfo,
        
                gigsInfo,
                setGigsInfo,
        
                bidsInfo,
                setBidsInfo,
        
                conversationsInfo,
                setConversationsInfo,
        
                notificationsInfo,
                setNotificationsInfo,
        
                dashboardError,
                setDashboardError
            }}
        >
            {children}
        </DashboardCtx.Provider>
    );
};

export const useDashboard = () => useContext(DashboardCtx);