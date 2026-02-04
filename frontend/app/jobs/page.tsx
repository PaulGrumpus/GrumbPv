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
import Input from "@/components/Input";

const JobsPage = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedJobId, setSelectedJobId] = useState<string | undefined>(undefined);

    const { userInfo, setUserInfo } = useContext(UserInfoCtx);
    // const { userLoadingState, setuserLoadingState } = useContext(UserLoadingCtx);
    const [loading, setLoading] = useState("pending");
    const [jobs, setJobs] = useState<Job[]>([]);
    const [search, setSearch] = useState("");
    
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
    
    const normalizedSearch = search.trim().toLowerCase();
    const filteredJobs = normalizedSearch
        ? jobs.filter((job) => {
            const haystack = [
                job.title,
                job.description_md,
                ...(job.tags ?? []),
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            return haystack.includes(normalizedSearch);
        })
        : jobs;

    return (
        <div>
            <div className="lg:px-16 px-4 bg-white lg:pt-46 pt-22">
                <div className="container mx-auto">
                    <p className="lg:text-display text-title lg:text-left text-center font-bold text-black pb-6">Jobs</p>
                    <p className="text-normal font-regular text-black pb-20">Discover high-quality projects waiting for the right expertise. Browse and Apply Now.</p>
                    {jobs.length > 0 && (
                        <div className="flex items-center gap-2 pb-20 justify-end">
                            <Input 
                                type="text" 
                                placeholder="Search" 
                                wrapperClassName="text-black" 
                                value={search} 
                                onChange={(e) => setSearch(e.target.value)} 
                            />
                        </div>
                    )}
                    <div className="grid lg:grid-cols-2 grid-cols-1 gap-8 pb-28 items-start">  
                        {filteredJobs.map((job) => (
                            <PubJobOrGigPost 
                                key={job.id} 
                                description={job.description_md} 
                                title={job.title} 
                                location={job.location ?? LocationType.REMOTE} 
                                tags={job.tags ?? []} 
                                minBudget={job.budget_min ?? 0} 
                                maxBudget={job.budget_max ?? 0} 
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