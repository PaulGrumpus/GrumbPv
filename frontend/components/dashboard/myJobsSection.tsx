import SectionPlaceholder from "./sectionPlaceholder";
import Button from "../button";
import UserJobOrGigPost from "../userJobOrGigPost";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { UserLoadingCtx } from "@/context/userLoadingContext";
import { UserInfoCtx } from "@/context/userContext";
import { Job, LocationType } from "@/types/jobs";
import { EscrowBackendConfig } from "@/config/config";
import { ConversationLoadingCtx } from "@/context/conversationLoadingContext";
import { ProjectInfoCtx } from "@/context/projectInfoContext";
import { NotificationLoadingCtx } from "@/context/notificationLoadingContext";
import SmallLoading from "../smallLoading";
import { DashboardLoadingCtx } from "@/context/dashboardLoadingContext";
import { useDashboard } from "@/context/dashboardContext";
import { DashboardJob } from "@/types/dashboard";

const MyJobsSection = () => {
    const router = useRouter();
    const { userInfo } = useContext(UserInfoCtx);
    const { userLoadingState, setuserLoadingState } = useContext(UserLoadingCtx);
    const { conversationLoadingState } = useContext(ConversationLoadingCtx);    
    const [loading, setLoading] = useState("pending");
    const [jobs, setJobs] = useState<DashboardJob[]>([]);
    // const [jobs, setJobs] = useState<Job[]>([]);
    // const { jobsInfo } = useContext(ProjectInfoCtx);
    const { jobsInfo } = useDashboard();
    const { notificationLoadingState } = useContext(NotificationLoadingCtx);
    const { dashboardLoadingState } = useContext(DashboardLoadingCtx);

    useEffect(() => {
        if(userLoadingState === "success") {
            if(userInfo.id === "") {
                setuserLoadingState("failure");
                return;
            }
            if (userInfo && userInfo.id) {
                const loadJobs = async () => {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    setJobs(jobsInfo.sort((a: DashboardJob, b: DashboardJob) => new Date(b.created_at ?? "").getTime() - new Date(a.created_at ?? "").getTime()));
                    setLoading("success");
                };
        
                if(dashboardLoadingState === "success") {
                    loadJobs();
                }
            }
        } else if (userLoadingState === "failure") {
            router.push("/");
        }
    }, [userInfo, userLoadingState, dashboardLoadingState])

    useEffect(() => {
        setJobs(jobsInfo);
    }, [jobsInfo]);

    if (loading === "pending") {
        return <SmallLoading size="lg" />;
    }

    if (loading === "success") {
        return (
            <div>
                <SectionPlaceholder
                    title="My Jobs"
                    description="Track and manage all the jobs you have published."
                />
                {jobs.length > 0 ? (
                    <div>
                        <div className="flex lg:justify-end justify-center">
                            <div className="w-50 mb-8 flex lg:justify-end justify-center">
                                <Button
                                    padding='px-7 py-3'
                                    onClick={() => router.push("/dashboard?view=create-job")}
                                >
                                    <p className='text-normal font-regular'>+ Create New Job</p>
                                </Button>
                            </div>
                        </div>
                        <div className="grid lg:grid-cols-2 grid-cols-1 gap-8">
                            {jobs.map((job) => (
                                <UserJobOrGigPost
                                    key={job.id}
                                    job_id={job.id}
                                    title={job.title}
                                    description={job.description_md}
                                    location={job.location as LocationType ?? LocationType.REMOTE}
                                    tags={job.tags ?? []}
                                    image={job.image_id?EscrowBackendConfig.uploadedImagesURL + job.image_id: ""}
                                    minBudget={Number(job.budget_min)}
                                    maxBudget={Number(job.budget_max)}
                                    currency={job.token_symbol ?? "USD"}
                                    deadline={job.deadline_at ? new Date(job.deadline_at).getTime() / 1000 : undefined}
                                    status={job.status}
                                />
                            ))}
                        </div>
                    </div>
                ) : (
                    userLoadingState === "success" && (<div className="flex flex-col items-center justify-center gap-20 mb-38">
                        <p className="text-normal font-regular text-black">No jobs found.</p>
                        <Button
                            padding='px-7 py-3'
                        >
                            <p className='text-normal font-regular'
                                onClick={() => router.push("/dashboard?view=create-job")}
                            >+ Create New Job</p>
                        </Button>
                    </div>
                ))}
            </div>
        )
    } else {
        return <SmallLoading size="lg" />;
    }
}

export default MyJobsSection;

