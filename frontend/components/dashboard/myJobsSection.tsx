import SectionPlaceholder from "./sectionPlaceholder";
import Button from "../button";
import UserJobOrGigPost from "../userJobOrGigPost";
import { useRouter } from "next/navigation";
import { useCallback, useContext, useEffect, useState } from "react";
import { UserLoadingCtx } from "@/context/userLoadingContext";
import { UserInfoCtx } from "@/context/userContext";
import Loading from "../loading";
import { Job, LocationType } from "@/types/jobs";
import { EscrowBackendConfig } from "@/config/config";
import { getJobsByClientId } from "@/utils/functions";
import { toast } from "react-toastify";
import { ConversationLoadingCtx } from "@/context/conversationLoadingContext";
import { ProjectInfoCtx } from "@/context/projectInfoContext";
import { ProjectInfoLoadingCtx } from "@/context/projectInfoLoadingContext";
import { NotificationLoadingCtx } from "@/context/notificationLoadingContext";

const MyJobsSection = () => {
    const router = useRouter();
    const { userInfo, setUserInfo } = useContext(UserInfoCtx);
    const { userLoadingState, setuserLoadingState } = useContext(UserLoadingCtx);
    const { conversationLoadingState } = useContext(ConversationLoadingCtx);    
    const { projectInfoLoadingState } = useContext(ProjectInfoLoadingCtx);
    const [loading, setLoading] = useState("pending");
    const [jobs, setJobs] = useState<Job[]>([]);
    const { jobsInfo } = useContext(ProjectInfoCtx);
    const { notificationLoadingState } = useContext(NotificationLoadingCtx);

    useEffect(() => {
        if(conversationLoadingState === "success") {
            if(userInfo.id === "") {
                setuserLoadingState("failure");
                return;
            }
            if (userInfo && userInfo.id) {
                const loadJobs = () => {
                    setJobs(jobsInfo.sort((a: Job, b: Job) => new Date(b.created_at ?? "").getTime() - new Date(a.created_at ?? "").getTime()));
                    setLoading("success");
                };
        
                if(notificationLoadingState === "success") {
                    loadJobs();
                }
            }
        } else if (conversationLoadingState === "failure") {
            router.push("/");
        }
    }, [userInfo, conversationLoadingState, notificationLoadingState])

    useEffect(() => {
        console.log("test-jobsInfo", jobsInfo);
        setJobs(jobsInfo);
    }, [jobsInfo]);

    if (loading === "pending") {
        return <Loading />;
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
                                    location={job.location ?? LocationType.REMOTE}
                                    tags={job.tags ?? []}
                                    image={job.image_id?EscrowBackendConfig.uploadedImagesURL + job.image_id: ""}
                                    minBudget={job.budget_min_usd}
                                    maxBudget={job.budget_max_usd}
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
        return <Loading />;
    }
}

export default MyJobsSection;

