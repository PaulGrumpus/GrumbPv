'use client'

import DashboardPosts from "@/components/dashboardPosts";
import Loading from "@/components/loading";
import { UserLoadingCtx } from "@/context/userLoadingContext";
import { UserInfoCtx } from "@/context/userContext";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { NotificationLoadingCtx } from "@/context/notificationLoadingContext";
import { useProjectInfo } from "@/context/projectInfoContext";
import { JobMilestoneWithJobApplicationsDocs } from "@/types/projectInfo";
import { JobMilestoneStatus } from "@/types/jobMilestone";

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

    const { jobMilestonesInfo } = useProjectInfo();
    const [ openedJobs, setOpenedJobs] = useState<JobMilestoneWithJobApplicationsDocs[]>([]);
    const [ finishedJobs, setFinishedJobs] = useState<JobMilestoneWithJobApplicationsDocs[]>([]);
    const [ visibleOpenedJobs, setVisibleOpenedJobs] = useState<JobMilestoneWithJobApplicationsDocs[]>([]);
    const [ visibleFinishedJobs, setVisibleFinishedJobs] = useState<JobMilestoneWithJobApplicationsDocs[]>([]);
    
    useEffect(() => {
        if(userLoadingState === "success") {
            if(userInfo.id === "") {
                setuserLoadingState("failure");
                return;
            }
            if (userInfo && userInfo.id) {
                const loadDashboardPosts = async () => {

                    setOpenedJobs(jobMilestonesInfo.filter((jobMilestone) => jobMilestone.status === JobMilestoneStatus.PENDING_FUND || jobMilestone.status === JobMilestoneStatus.FUNDED || jobMilestone.status === JobMilestoneStatus.DELIVERED || jobMilestone.status === JobMilestoneStatus.APPROVED || jobMilestone.status === JobMilestoneStatus.DISPUTED_WITHOUT_COUNTER_SIDE || jobMilestone.status === JobMilestoneStatus.DISPUTED_WITH_COUNTER_SIDE));

                    setFinishedJobs(jobMilestonesInfo.filter((jobMilestone) => jobMilestone.status === JobMilestoneStatus.RELEASED || jobMilestone.status === JobMilestoneStatus.RESOLVED_TO_BUYER || jobMilestone.status === JobMilestoneStatus.RESOLVED_TO_VENDOR || jobMilestone.status === JobMilestoneStatus.CANCELLED));
                    
                    // await getGigsPerFreelancerId(userInfo.id);
                    await new Promise(resolve => setTimeout(resolve, 3000));
                    setLoading("success");
                };
                if(notificationLoadingState === "success") {
                    loadDashboardPosts();
                }
            }
        } else if (userLoadingState === "failure") {
            router.push("/");
        }
    }, [userInfo, userLoadingState, notificationLoadingState])

    useEffect(() => {
        setVisibleOpenedJobs(showAllOpenJobs ? openedJobs : openedJobs.slice(0, 2));
        setVisibleFinishedJobs(showAllCompletedJobs ? finishedJobs : finishedJobs.slice(0, 2));
    }, [openedJobs, finishedJobs, showAllOpenJobs, showAllCompletedJobs]);

    useEffect(() => {
        setOpenedJobs(jobMilestonesInfo.filter((jobMilestone) => jobMilestone.status === JobMilestoneStatus.PENDING_FUND || jobMilestone.status === JobMilestoneStatus.FUNDED || jobMilestone.status === JobMilestoneStatus.DELIVERED || jobMilestone.status === JobMilestoneStatus.APPROVED || jobMilestone.status === JobMilestoneStatus.DISPUTED_WITHOUT_COUNTER_SIDE || jobMilestone.status === JobMilestoneStatus.DISPUTED_WITH_COUNTER_SIDE));

        setFinishedJobs(jobMilestonesInfo.filter((jobMilestone) => jobMilestone.status === JobMilestoneStatus.RELEASED || jobMilestone.status === JobMilestoneStatus.RESOLVED_TO_BUYER || jobMilestone.status === JobMilestoneStatus.RESOLVED_TO_VENDOR || jobMilestone.status === JobMilestoneStatus.CANCELLED));
    }, [jobMilestonesInfo]);

    if (loading === "pending") {
        return <Loading />;
    }

    if (loading === "success") {
        return (
            <div>
                <h1 className="text-display font-bold text-black pb-6">Dashboard</h1>
                <p className="text-normal font-regular text-black pb-20">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in
                    eros elementum tristique.
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
                                    <h2 className="text-title font-bold text-black">Open Jobs</h2>
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
                                        {visibleOpenedJobs.map((milestone) => (
                                            <DashboardPosts 
                                                key={`open-milestone-${milestone.id}`} 
                                                user={userInfo}
                                                variant="open" 
                                                jobMilestoneId={milestone.id?.toString() ?? ""}
                                                title={milestone?.title ?? ""}
                                                description={milestone?.job?.description_md ?? ""}
                                                milestoneStatus={milestone.status ?? JobMilestoneStatus.PENDING_FUND}
                                                ipfs={milestone.ipfs}
                                                clickHandler={() => {
                                                    console.log("open milestone clicked");
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
                                    <h2 className="text-title font-bold text-black">Completed Jobs</h2>
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
                                            {visibleFinishedJobs.map((milestone) => (
                                                <DashboardPosts 
                                                    key={`finished-milestone-${milestone.id}`} 
                                                    user={userInfo}
                                                    variant="completed" 
                                                    jobMilestoneId={milestone.id?.toString() ?? ""}
                                                    title={milestone?.title ?? ""}
                                                    description={milestone?.job?.description_md ?? ""}
                                                    milestoneStatus={milestone.status ?? JobMilestoneStatus.PENDING_FUND}
                                                    ipfs={milestone.ipfs}
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
        return <Loading />;
    }
};

export default DashboardOverview;

