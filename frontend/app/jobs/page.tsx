"use client";

import ApplyJob from "@/components/applyJob";
import Button from "@/components/button";
import PubJobOrGigPost from "@/components/pubJobOrGigPost";
import ModalTemplate from "@/components/modalTemplate";
import { useContext, useEffect, useState } from "react";
import { Job, LocationType } from "@/types/jobs";
import { useRouter } from "next/navigation";
import { LoadingCtx } from "@/context/loadingContext";
import { UserInfoCtx } from "@/context/userContext";
import Loading from "@/components/loading";
import { toast } from "react-toastify";
import { getJobs } from "@/utils/functions";
import { EscrowBackendConfig } from "@/config/config";

const jobs = [
    {
        id: 1,
        title: "Escrow Smart Contract Deployment",
        description: "Deploy an escrow smart contract for a job. The escrow smart contract will be used to hold the funds for the job. I need a smart contract that is secure and can be used to hold the funds for the job.",
        location: "Remote",
        tags: ["Smart Contract", "Deployment", "Escrow"],
        price: 1000,
        currency: "USD",
        deadline: 1737936000,
        createdAt: 1737936000,
    },
    {
        id: 2,
        title: "Design a new logo for my company",
        description: "I need a new logo for my company. The logo should be modern and stylish. I need a logo that is easy to remember and that I can use on my website and marketing materials.",
        location: "Remote",
        tags: ["Design", "Logo", "Branding"],
        price: 1000,
        currency: "USD",
        deadline: 1737936000,
        createdAt: 1737936000,
    },
    {
        id: 3,
        title: "Develop a new website for my company",
        description: "I need a new website for my company. The website should be modern and stylish. I need a website that is easy to use and that I can use on my website and marketing materials.",
        location: "Remote",
        tags: ["Development", "Website", "Frontend"],
        price: 1000,
        currency: "USD",
        deadline: 1737936000,
        createdAt: 1737936000,
    },
    {
        id: 4,
        title: "Develop a new mobile app for my company",
        description: "I need a new mobile app for my company. The mobile app should be modern and stylish. I need a mobile app that is easy to use and that I can use on my website and marketing materials.",
        location: "Remote",
        tags: ["Development", "Mobile App", "Backend"],
        price: 1000,
        currency: "USD",
        deadline: 1737936000,
        createdAt: 1737936000,
    },
    {
        id: 5,
        title: "Develop a new backend for my company",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        location: "Remote",
        tags: ["Development", "Backend", "Database"],
        price: 1000,
        currency: "USD",
        image: "/Grmps/profile-image.jpg",
        deadline: 1737936000,
        createdAt: 1737936000,
    },
]

const JobsPage = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedJobId, setSelectedJobId] = useState<string | undefined>(undefined);

    const { userInfo, setUserInfo } = useContext(UserInfoCtx);
    const { loadingState, setLoadingState } = useContext(LoadingCtx);
    const [loading, setLoading] = useState("pending");
    const [jobs, setJobs] = useState<Job[]>([]);
    
    useEffect(() => {
        if(loadingState !== "pending") {
            const loadJobs = async () => {
                const result = await getJobs();
                if(result.success) {
                    setJobs(result.data ?? []);
                }
                setLoading("success");
            }
            loadJobs();
        }
    }, [userInfo, loadingState])

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
            <div className="px-16 bg-white pt-46">
                <div className="container mx-auto">
                    <p className="text-display font-bold text-black pb-6">Jobs</p>
                    <p className="text-normal font-regular text-black pb-20">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.</p>
                    <div className="grid grid-cols-2 gap-8 pb-28">  
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
                    title={selectedJobId ? jobs.find((job) => job.id === selectedJobId)?.title ?? "" : ""}
                    subtitle={selectedJobId ? jobs.find((job) => job.id === selectedJobId)?.description_md ?? "" : ""}
                    actionLabel=""
                    onAction={() => {}}
                    className="p-10.5"
                    customButton={true}                
                >
                    <div className="mt-6">
                        <ApplyJob
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