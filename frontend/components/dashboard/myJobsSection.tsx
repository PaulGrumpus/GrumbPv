import SectionPlaceholder from "./sectionPlaceholder";
import Button from "../button";
import UserJobOrGigPost from "../userJobOrGigPost";
import { useRouter } from "next/navigation";
import { useCallback, useContext, useEffect, useState } from "react";
import { LoadingCtx } from "@/context/loadingContext";
import { UserInfoCtx } from "@/context/userContext";
import Loading from "../loading";
import { Job } from "@/types/jobs";
import { EscrowBackendConfig } from "@/config/config";
import { getJobsByClientId } from "@/utils/functions";
import { toast } from "react-toastify";

const Jobs = [
    {
        title: "Job 1",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat. Aenean faucibus nibh et justo cursus id rutrum lorem imperdiet. Nunc ut sem vitae risus tristique posuere.",
        subtitle: "Subtitle 1",
        tags: ["Tag 1"],
    },
    {
        title: "Job 2",
        image: "/Grmps/profile-image.jpg",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat. Aenean faucibus nibh et justo cursus id rutrum lorem imperdiet. Nunc ut sem vitae risus tristique posuere.",
        subtitle: "Subtitle 2",
        tags: ["Tag 1"],
    },
    {
        title: "Job 3",
        description: "DescLorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat. Aenean faucibus nibh et justo cursus id rutrum lorem imperdiet. Nunc ut sem vitae risus tristique posuere.",
        subtitle: "Subtitle 3",
        tags: ["Tag 1"],
    },
]

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
                setLoading("success");
            } else {
                toast.error(result.error as string);
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
                                    key={job.title}
                                    title={job.title}
                                    description={job.description_md}
                                    subtitle={job.location ?? ""}
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
                            <p className='text-normal font-regular'>+ Create Job</p>
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

