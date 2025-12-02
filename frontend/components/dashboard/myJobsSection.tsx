import SectionPlaceholder from "./sectionPlaceholder";
import Button from "../button";
import UserJobOrGigPost from "../userJobOrGigPost";
import { useRouter } from "next/navigation";
import { useCallback, useContext, useEffect, useState } from "react";
import { LoadingCtx } from "@/context/loadingContext";
import { UserInfoCtx } from "@/context/userContext";
import Loading from "../loading";
import { Job, LocationType } from "@/types/jobs";
import { EscrowBackendConfig } from "@/config/config";
import { getJobsByClientId } from "@/utils/functions";
import { toast } from "react-toastify";

const MyJobsSection = () => {
    const router = useRouter();
    const { userInfo, setUserInfo } = useContext(UserInfoCtx);
    const { loadingState, setLoadingState } = useContext(LoadingCtx);
    const [loading, setLoading] = useState("pending");
    const [jobs, setJobs] = useState<Job[]>([]);

    const getJobsPerClientId = async (client_id: string) => {
        try {
            const result = await getJobsByClientId(client_id);
            if (result.success) {
                setJobs(result.data ?? []);
                await new Promise(resolve => setTimeout(resolve, 3000));
                setLoading("success");
            } else {
                toast.error(result.error as string, {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
            }
        } catch (error) {
            toast.error(error as string);
        }
    }

    useEffect(() => {
        if(loadingState === "success") {
            if(userInfo.id === "") {
                setLoadingState("failure");
                return;
            }
            if (userInfo && userInfo.id) {
                const loadJobs = async () => {
                    if (!userInfo?.id) {
                        setLoadingState("failure");
                        return;
                    }
                    await getJobsPerClientId(userInfo.id);
                };
        
                loadJobs();
            }
        } else if (loadingState === "failure") {
            router.push("/");
        }
    }, [userInfo, loadingState])

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
                        <div className="flex justify-end">
                            <div className="w-45 mb-8 flex justify-end">
                                <Button
                                    padding='px-7 py-3'
                                    onClick={() => router.push("/dashboard?view=create-job")}
                                >
                                    <p className='text-normal font-regular'>+ Create Job</p>
                                </Button>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-8">
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
                    loadingState === "success" && (<div className="flex flex-col items-center justify-center gap-20 mb-38">
                        <p className="text-normal font-regular text-black">No jobs found.</p>
                        <Button
                            padding='px-7 py-3'
                        >
                            <p className='text-normal font-regular'
                                onClick={() => router.push("/dashboard?view=create-job")}
                            >+ Create Job</p>
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

