"use client";

import ApplyJob from "@/components/applyJob";
import Button from "@/components/button";
import PubJobOrGigPost from "@/components/pubJobOrGigPost";
import ModalTemplate from "@/components/modalTemplate";
import { useContext, useEffect, useState } from "react";
import { Job, JobStatus, LocationType } from "@/types/jobs";
import { useRouter } from "next/navigation";
import { UserLoadingCtx } from "@/context/userLoadingContext";
import { UserInfoCtx } from "@/context/userContext";
import Loading from "@/components/loading";
import { toast } from "react-toastify";
import { getJobs } from "@/utils/functions";
import { EscrowBackendConfig } from "@/config/config";

const JobsPage = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedJobId, setSelectedJobId] = useState<string | undefined>(undefined);

    const { userInfo, setUserInfo } = useContext(UserInfoCtx);
    // const { userLoadingState, setuserLoadingState } = useContext(UserLoadingCtx);
    const [loading, setLoading] = useState("pending");
    const [jobs, setJobs] = useState<Job[]>([]);
    
    useEffect(() => {
        let mounted = true;
      
        const loadJobs = async () => {
            const result = await getJobs();
            if (!mounted) return;
        
                if (result.success) {
                    setJobs(
                        (result.data ?? []).filter((job: Job) => job.status === JobStatus.OPEN).sort(
                            (a: Job, b: Job) =>
                            new Date(b.created_at ?? "").getTime() -
                            new Date(a.created_at ?? "").getTime()
                        )
                    );
                }
        
            setLoading("success");
        };
      
        loadJobs();
      
        return () => {
            mounted = false;
        };
    }, []);

    const handleApplyForJob = (jobId: string | undefined) => {
        if(!userInfo.id || userInfo.role !== "freelancer") {
            toast.error("You must log in fisrt as a freelancer to apply for a job", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
            });
        }
        setIsOpen(true);
        setSelectedJobId(jobId);
    }

    if (loading === "pending") {
        return <Loading />;
    }
    
    return (
        <div>
            <div className="lg:px-16 px-4 bg-white lg:pt-46 pt-22">
                <div className="container mx-auto">
                    <p className="lg:text-display text-title lg:text-left text-center font-bold text-black pb-6">Jobs</p>
                    <p className="text-normal font-regular text-black pb-20">Discover high-quality projects waiting for the right expertise. Browse and Apply Now.</p>
                    <div className="grid lg:grid-cols-2 grid-cols-1 gap-8 pb-28">  
                        {jobs.map((job) => (
                            <PubJobOrGigPost 
                                key={job.id} 
                                description={job.description_md} 
                                title={job.title} 
                                location={job.location ?? LocationType.REMOTE} 
                                tags={job.tags ?? []} 
                                minBudget={job.budget_min_usd ?? 0} 
                                maxBudget={job.budget_max_usd ?? 0} 
                                image={job.image_id ? EscrowBackendConfig.uploadedImagesURL + job.image_id : undefined}
                                currency={job.token_symbol ?? "USD"} 
                                deadline={job.deadline_at ? new Date(job.deadline_at).getTime() / 1000 : undefined}
                                createdAt={job.created_at ? new Date(job.created_at).getTime() / 1000 : 0}
                                label="Apply Now"
                                clickHandler={() => {
                                    handleApplyForJob(job.id);
                                }}
                            />
                        ))}
                    </div>
                </div>
            </div>
            {userInfo.id && userInfo.role === "freelancer" && selectedJobId && (
                <ModalTemplate
                    isOpen={isOpen}
                    onClose={() => setIsOpen(false)}
                    // title={selectedJobId ? jobs.find((job) => job.id === selectedJobId)?.title ?? "" : ""}
                    // subtitle={selectedJobId ? jobs.find((job) => job.id === selectedJobId)?.description_md ?? "" : ""}
                    actionLabel=""
                    onAction={() => {}}
                    className="px-4 py-3 lg:p-10.5"
                    customButton={true}         
                >
                    <div className="mt-6">
                        <ApplyJob
                            jobTitle={selectedJobId ? jobs.find((job) => job.id === selectedJobId)?.title ?? "" : ""}
                            jobDescription={selectedJobId ? jobs.find((job) => job.id === selectedJobId)?.description_md ?? "" : ""}
                            jobId={selectedJobId.toString()}
                            freelancerId={userInfo.id}
                            clickHandler={() => {
                                setIsOpen(false)
                            }}  
                        />
                    </div>
                </ModalTemplate>
            )}
        </div>
    )
} 

export default JobsPage