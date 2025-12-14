'use client';

import { Bid } from "@/types/bid";
import { Gig } from "@/types/gigs";
import { JobApplication } from "@/types/jobApplication";
import { JobMilestone } from "@/types/jobMilestone";
import { Job } from "@/types/jobs";
import { ProjectInfoContextType } from "@/types/projectInfo";
import { getBidsByFreelancerId, getJobApplicationsByUserId, getJobMilestonesByUserId, getJobsByClientId, getGigsByFreelancerId } from "@/utils/functions";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { UserInfoCtx } from "./userContext";
import { UserLoadingCtx } from "./userLoadingContext";
import { ProjectInfoLoadingCtx } from "./projectInfoLoadingContext";

const defaultProvider: ProjectInfoContextType = {
    jobsInfo: [],
    gigsInfo: [],
    bidsInfo: [],
    jobApplicationsInfo: [],
    jobMilestonesInfo: [],
    setJobsInfo: () => {},
    setGigsInfo: () => {},
    setBidsInfo: () => {},
    setJobApplicationsInfo: () => {},
    setJobMilestonesInfo: () => {},
    projectInfoError: '',
    setProjectInfoError: () => {}
}

const ProjectInfoCtx = createContext<ProjectInfoContextType>(defaultProvider);

type Props = {
    children: ReactNode;
}

export const ProjectInfoProvider = ({ children }: Props) => {  
    const [jobsInfo, setJobsInfo] = useState<Job[]>(defaultProvider.jobsInfo);
    const [gigsInfo, setGigsInfo] = useState<Gig[]>(defaultProvider.gigsInfo);
    const [bidsInfo, setBidsInfo] = useState<Bid[]>(defaultProvider.bidsInfo);
    const [jobApplicationsInfo, setJobApplicationsInfo] = useState<JobApplication[]>(defaultProvider.jobApplicationsInfo);
    const [jobMilestonesInfo, setJobMilestonesInfo] = useState<JobMilestone[]>(defaultProvider.jobMilestonesInfo);
    const [projectInfoError, setProjectInfoError] = useState<string>(defaultProvider.projectInfoError);

    const { userInfo, setUserInfo } = useContext(UserInfoCtx);
    const { userLoadingState } = useContext(UserLoadingCtx);
    const { setprojectInfoLoadingState } = useContext(ProjectInfoLoadingCtx);

    const init = async () => {
        if(userLoadingState === "success") {
            setprojectInfoLoadingState("pending");
            
            const userJobs = await getJobsByClientId(userInfo.id);
            if(userJobs.success) {
                setJobsInfo(userJobs.data ?? []);
            } else {
                setJobsInfo([]);
            }

            const userGigs = await getGigsByFreelancerId(userInfo.id);
            if(userGigs.success) {
                setGigsInfo(userGigs.data ?? []);
            } else {
                setGigsInfo([]);
            }

            const userBids = await getBidsByFreelancerId(userInfo.id);
            if(userBids.success) {
                setBidsInfo(userBids.data ?? []);
            } else {
                setBidsInfo([]);
            }

            const userJobApplications = await getJobApplicationsByUserId(userInfo.id);
            if(userJobApplications.success) {
                setJobApplicationsInfo(userJobApplications.data ?? []);
            } else {
                setJobApplicationsInfo([]);
            }

            const userJobMilestones = await getJobMilestonesByUserId(userInfo.id);
            if(userJobMilestones.success) {
                setJobMilestonesInfo(userJobMilestones.data ?? []);
            } else {
                setJobMilestonesInfo([]);
            }

            setprojectInfoLoadingState("success");
        } else {
            setprojectInfoLoadingState("pending");
        }
    }

    useEffect(() => {
        init();
    }, [userLoadingState]);

    useEffect(() => {
        console.log("test-jobsInfo", jobsInfo);
        console.log("test-gigsInfo", gigsInfo);
        console.log("test-bidsInfo", bidsInfo);
        console.log("test-jobApplicationsInfo", jobApplicationsInfo);
        console.log("test-jobMilestonesInfo", jobMilestonesInfo);
    }, [jobsInfo, gigsInfo, bidsInfo, jobApplicationsInfo, jobMilestonesInfo]);

    return (
        <ProjectInfoCtx.Provider value={{ jobsInfo, setJobsInfo, gigsInfo, setGigsInfo, bidsInfo, setBidsInfo, jobApplicationsInfo, setJobApplicationsInfo, jobMilestonesInfo, setJobMilestonesInfo, projectInfoError, setProjectInfoError }}>
            {children}
        </ProjectInfoCtx.Provider>
    )
}

export const useProjectInfo = () => {
    return useContext(ProjectInfoCtx);
}