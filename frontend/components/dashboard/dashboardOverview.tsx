'use client'

import DashboardPosts from "@/components/dashboardPosts";
import SmallLoading from "@/components/smallLoading";
import { UserLoadingCtx } from "@/context/userLoadingContext";
import { UserInfoCtx } from "@/context/userContext";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { NotificationLoadingCtx } from "@/context/notificationLoadingContext";
import { useProjectInfo } from "@/context/projectInfoContext";
import { JobMilestoneWithJobApplicationsDocs } from "@/types/projectInfo";
import { JobMilestoneStatus } from "@/types/jobMilestone";
import { useDashboard } from "@/context/dashboardContext";
import { DashboardJob, DashboardJobApplicationDoc, DashboardMilestone } from "@/types/dashboard";
import { DashboardLoadingCtx } from "@/context/dashboardLoadingContext";

type MilestoneItem = {
    job: DashboardJob;
    milestone: DashboardMilestone;
    applicationDoc: DashboardJobApplicationDoc | null;
};

const DashboardOverview = () => {
    const [openJobs, setOpenJobs] = useState(true);
    const [showAllOpenJobs, setShowAllOpenJobs] = useState(false);
    const [completedJobs, setCompletedJobs] = useState(true);
    const [showAllCompletedJobs, setShowAllCompletedJobs] = useState(false);
    const { userInfo, setUserInfo } = useContext(UserInfoCtx);
    const { userLoadingState, setuserLoadingState } = useContext(UserLoadingCtx);
    const [loading, setLoading] = useState("pending");
    const router = useRouter();
    const { notificationLoadingState } = useContext(NotificationLoadingCtx);
    const { dashboardLoadingState } = useContext(DashboardLoadingCtx);

    const { jobMilestonesInfo } = useProjectInfo();
    // const [ openedJobs, setOpenedJobs] = useState<JobMilestoneWithJobApplicationsDocs[]>([]);
    // const [ finishedJobs, setFinishedJobs] = useState<JobMilestoneWithJobApplicationsDocs[]>([]);
    const [ openedJobs, setOpenedJobs] = useState<MilestoneItem[]>([]);
    const [ finishedJobs, setFinishedJobs] = useState<MilestoneItem[]>([]);
    const [ visibleOpenedJobs, setVisibleOpenedJobs] = useState<MilestoneItem[]>([]);
    const [ visibleFinishedJobs, setVisibleFinishedJobs] = useState<MilestoneItem[]>([]);
    // const [ visibleOpenedJobs, setVisibleOpenedJobs] = useState<JobMilestoneWithJobApplicationsDocs[]>([]);
    // const [ visibleFinishedJobs, setVisibleFinishedJobs] = useState<JobMilestoneWithJobApplicationsDocs[]>([]);
    const { jobsInfo } = useDashboard()
    let jobMilestones: MilestoneItem[] = [];
    
    useEffect(() => {
        if(userLoadingState === "success") {
            if(userInfo.id === "") {
                setuserLoadingState("failure");
                return;
            }
            if (userInfo && userInfo.id) {
                const loadDashboardPosts = async () => {
                    
                    // type FreelancerMilestoneItem = {
                    //     job: typeof jobsInfo[number];
                    //     milestone: typeof jobsInfo[number]["milestones"][number];
                    //     applicationDoc: typeof jobsInfo[number]["jobApplicationsDocs"][number] | null;
                    // };

                    // let freelancerMilestones: FreelancerMilestoneItem[] = [];
                    

                    jobMilestones = jobsInfo
                        // only jobs that actually have milestones
                        .filter(job => job.milestones && job.milestones.length > 0)
                        .flatMap(job =>
                            job.milestones.map(milestone => {
                                const applicationDoc =
                                job.jobApplicationsDocs.find(
                                    doc => doc.job_milestone_id === milestone.id
                                ) ?? null;

                                return {
                                    job,
                                    milestone,
                                    applicationDoc
                                };
                            })
                        );

                    setOpenedJobs(jobMilestones.filter((jobMilestone) => jobMilestone.milestone.status === JobMilestoneStatus.PENDING_FUND || jobMilestone.milestone.status === JobMilestoneStatus.FUNDED || jobMilestone.milestone.status === JobMilestoneStatus.DELIVERED || jobMilestone.milestone.status === JobMilestoneStatus.APPROVED || jobMilestone.milestone.status === JobMilestoneStatus.DISPUTED_BY_CLIENT || jobMilestone.milestone.status === JobMilestoneStatus.DISPUTED_BY_FREELANCER || jobMilestone.milestone.status === JobMilestoneStatus.DISPUTED_WITH_COUNTER_SIDE).sort((a, b) => new Date(b.milestone.created_at ?? "").getTime() - new Date(a.milestone.created_at ?? "").getTime()));

                    setFinishedJobs(jobMilestones.filter((jobMilestone) => jobMilestone.milestone.status === JobMilestoneStatus.RELEASED || jobMilestone.milestone.status === JobMilestoneStatus.RESOLVED_TO_BUYER || jobMilestone.milestone.status === JobMilestoneStatus.RESOLVED_TO_VENDOR).sort((a, b) => new Date(b.milestone.created_at ?? "").getTime() - new Date(a.milestone.created_at ?? "").getTime()));

                    // setOpenedJobs(jobMilestonesInfo.filter((jobMilestone) => jobMilestone.status === JobMilestoneStatus.PENDING_FUND || jobMilestone.status === JobMilestoneStatus.FUNDED || jobMilestone.status === JobMilestoneStatus.DELIVERED || jobMilestone.status === JobMilestoneStatus.APPROVED || jobMilestone.status === JobMilestoneStatus.DISPUTED_WITHOUT_COUNTER_SIDE || jobMilestone.status === JobMilestoneStatus.DISPUTED_WITH_COUNTER_SIDE).sort((a, b) => new Date(b.created_at ?? "").getTime() - new Date(a.created_at ?? "").getTime()));

                    // setFinishedJobs(jobMilestonesInfo.filter((jobMilestone) => jobMilestone.status === JobMilestoneStatus.RELEASED || jobMilestone.status === JobMilestoneStatus.RESOLVED_TO_BUYER || jobMilestone.status === JobMilestoneStatus.RESOLVED_TO_VENDOR || jobMilestone.status === JobMilestoneStatus.CANCELLED).sort((a, b) => new Date(b.created_at ?? "").getTime() - new Date(a.created_at ?? "").getTime()));
                    
                    // await getGigsPerFreelancerId(userInfo.id);
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    setLoading("success");
                };
                // if(notificationLoadingState === "success") {
                //     loadDashboardPosts();
                // }

                if(dashboardLoadingState === "success") {
                    loadDashboardPosts();
                }
            }
        } else if (userLoadingState === "failure") {
            router.push("/");
        }
    }, [userInfo, userLoadingState, dashboardLoadingState, jobsInfo])
    // }, [userInfo, userLoadingState, notificationLoadingState])

    useEffect(() => {
        setVisibleOpenedJobs(showAllOpenJobs ? openedJobs : openedJobs.slice(0, 2));
        setVisibleFinishedJobs(showAllCompletedJobs ? finishedJobs : finishedJobs.slice(0, 2));
    }, [openedJobs, finishedJobs, showAllOpenJobs, showAllCompletedJobs]);

    // useEffect(() => {
    //     setOpenedJobs(jobMilestonesInfo.filter((jobMilestone) => jobMilestone.status === JobMilestoneStatus.PENDING_FUND || jobMilestone.status === JobMilestoneStatus.FUNDED || jobMilestone.status === JobMilestoneStatus.DELIVERED || jobMilestone.status === JobMilestoneStatus.APPROVED || jobMilestone.status === JobMilestoneStatus.DISPUTED_WITHOUT_COUNTER_SIDE || jobMilestone.status === JobMilestoneStatus.DISPUTED_WITH_COUNTER_SIDE).sort((a, b) => new Date(b.created_at ?? "").getTime() - new Date(a.created_at ?? "").getTime()));

    //     setFinishedJobs(jobMilestonesInfo.filter((jobMilestone) => jobMilestone.status === JobMilestoneStatus.RELEASED || jobMilestone.status === JobMilestoneStatus.RESOLVED_TO_BUYER || jobMilestone.status === JobMilestoneStatus.RESOLVED_TO_VENDOR || jobMilestone.status === JobMilestoneStatus.CANCELLED).sort((a, b) => new Date(b.created_at ?? "").getTime() - new Date(a.created_at ?? "").getTime()));
    // }, [jobMilestonesInfo]);

    useEffect(() => {
        jobMilestones = jobsInfo
        // only jobs that actually have milestones
        .filter(job => job.milestones && job.milestones.length > 0)
        .flatMap(job =>
            job.milestones.map(milestone => {
                const applicationDoc =
                job.jobApplicationsDocs.find(
                    doc => doc.job_milestone_id === milestone.id
                ) ?? null;

                return {
                    job,
                    milestone,
                    applicationDoc
                };
            })
        );

        setOpenedJobs(jobMilestones.filter((jobMilestone) => jobMilestone.milestone.status === JobMilestoneStatus.PENDING_FUND || jobMilestone.milestone.status === JobMilestoneStatus.FUNDED || jobMilestone.milestone.status === JobMilestoneStatus.DELIVERED || jobMilestone.milestone.status === JobMilestoneStatus.APPROVED || jobMilestone.milestone.status === JobMilestoneStatus.DISPUTED_BY_CLIENT || jobMilestone.milestone.status === JobMilestoneStatus.DISPUTED_BY_FREELANCER || jobMilestone.milestone.status === JobMilestoneStatus.DISPUTED_WITH_COUNTER_SIDE).sort((a, b) => new Date(b.milestone.created_at ?? "").getTime() - new Date(a.milestone.created_at ?? "").getTime()));

        setFinishedJobs(jobMilestones.filter((jobMilestone) => jobMilestone.milestone.status === JobMilestoneStatus.RELEASED || jobMilestone.milestone.status === JobMilestoneStatus.RESOLVED_TO_BUYER || jobMilestone.milestone.status === JobMilestoneStatus.RESOLVED_TO_VENDOR).sort((a, b) => new Date(b.milestone.created_at ?? "").getTime() - new Date(a.milestone.created_at ?? "").getTime()));
    }, [jobsInfo])

    if (loading === "pending") {
        return <SmallLoading size="lg" />;
    }

    if (loading === "success") {
        return (
            <div>
                <h1 className="lg:text-display text-title lg:text-left text-center font-bold text-black pb-6">Dashboard</h1>
                <p className="text-normal font-regular text-black pb-20">
                    Overview of Job statuses
                </p>
                <div className="flex flex-col gap-20">
                    <div className="linear-border rounded-lg p-0.25 linear-border--dark-hover">
                        <div className="linear-border__inner rounded-[0.4375rem] bg-white">
                            <div className="flex flex-col py-3 px-4">
                                <div
                                    className="flex justify-between items-center py-5 w-full"
                                    onClick={() => {
                                        setOpenJobs(!openJobs);
                                    }}
                                >
                                    <h2 className="lg:text-title text-subtitle font-bold text-black">Open Jobs</h2>
                                    <div className="w-6 h-6">
                                        <Image
                                            src="/Grmps/chevronUp.svg"
                                            alt="Chevron Up"
                                            width={32}
                                            height={32}
                                            className={`h-full w-full ${!openJobs ? "rotate-180" : ""}`}
                                        />
                                    </div>
                                </div>
                                {openJobs && (
                                    <div className="flex flex-col gap-8">
                                        {visibleOpenedJobs.map((openjob) => (
                                            <DashboardPosts 
                                                key={`open-milestone-${openjob.milestone.id}`} 
                                                user={userInfo}
                                                variant="open" 
                                                jobMilestoneId={openjob.milestone.id?.toString() ?? ""}
                                                title={openjob.job.title ?? ""}
                                                description={openjob?.job?.description_md ?? ""}
                                                milestoneStatus={openjob.milestone.status as JobMilestoneStatus ?? JobMilestoneStatus.PENDING_FUND}
                                                ipfs={openjob.milestone.ipfs}
                                                applicationDocId={openjob.applicationDoc?.id?.toString() ?? ""}
                                                clickHandler={() => {
                                                }}
                                            />
                                        ))}
                                        {openedJobs.length > 2 && (
                                            <p
                                                className="text-center text-small font-semibold text-[#5a6bff] cursor-pointer"
                                                onClick={() => setShowAllOpenJobs((prev) => !prev)}
                                            >
                                                {showAllOpenJobs ? "Show less" : "Show more"}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="linear-border rounded-lg p-0.25 linear-border--dark-hover">
                        <div className="linear-border__inner rounded-[0.4375rem] bg-white">
                            <div className="flex flex-col py-3 px-4">
                                <div
                                    className="flex justify-between items-center py-5 w-full"
                                    onClick={() => {
                                        setCompletedJobs(!completedJobs);
                                    }}
                                >
                                    <h2 className="lg:text-title text-subtitle font-bold text-black">Completed Jobs</h2>
                                    <div className="w-6 h-6">
                                        <Image
                                            src="/Grmps/chevronUp.svg"
                                            alt="Chevron Up"
                                            width={32}
                                            height={32}
                                            className={`h-full w-full ${!openJobs ? "rotate-180" : ""}`}
                                        />
                                    </div>
                                </div>
                                {completedJobs && (
                                    <div>
                                        <div className="grid lg:grid-cols-2 grid-cols-1 gap-8">
                                            {visibleFinishedJobs.map((finishedJob) => (
                                                <DashboardPosts 
                                                    key={`finished-milestone-${finishedJob.milestone.id}`} 
                                                    user={userInfo}
                                                    variant="completed" 
                                                    jobMilestoneId={finishedJob.job.id?.toString() ?? ""}
                                                    title={finishedJob?.milestone.title ?? ""}
                                                    description={finishedJob?.job?.description_md ?? ""}
                                                    milestoneStatus={finishedJob.milestone.status as JobMilestoneStatus ?? JobMilestoneStatus.PENDING_FUND}
                                                    ipfs={finishedJob.milestone.ipfs}
                                                    applicationDocId={finishedJob.applicationDoc?.id?.toString() ?? ""}
                                                    clickHandler={() => {}}
                                                />
                                            ))}
                                        </div>
                                        {finishedJobs.length > 2 && (
                                            <p
                                                className="text-center text-small font-semibold text-[#5a6bff] cursor-pointer mt-8"
                                                onClick={() => setShowAllCompletedJobs((prev) => !prev)}
                                            >
                                                {showAllOpenJobs ? "Show less" : "Show more"}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    } else {
        return <SmallLoading size="lg" />;
    }
};

export default DashboardOverview;

