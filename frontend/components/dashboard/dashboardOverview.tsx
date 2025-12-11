'use client'

import DashboardPosts from "@/components/dashboardPosts";
import Loading from "@/components/loading";
import { UserLoadingCtx } from "@/context/userLoadingContext";
import { UserInfoCtx } from "@/context/userContext";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";

const myJobs = [
    {
        id: 1,
        title: "Escrow Smart Contract Deployment",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat. Aenean faucibus nibh et justo cursus id rutrum lorem imperdiet. Nunc ut sem vitae risus tristique posuere.",
        status: 2,
        ipfsUrl: "https://brown-decisive-tyrannosaurus-507.mypinata.cloud/ipfs/bafybeifjc4r5emdr7zrvdqpzzxxkikl3qxfhe4b3m34pyue4mamnff3xqa",
    },
    {
        id: 2,
        title: "Design a new logo for my company",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat. Aenean faucibus nibh et justo cursus id rutrum lorem imperdiet. Nunc ut sem vitae risus tristique posuere.",
        status: 1,
        ipfsUrl: "https://brown-decisive-tyrannosaurus-507.mypinata.cloud/ipfs/bafybeifjc4r5emdr7zrvdqpzzxxkikl3qxfhe4b3m34pyue4mamnff3xqa",
    },
    {
        id: 3,
        title: "Develop a new website for my company",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat. Aenean faucibus nibh et justo cursus id rutrum lorem imperdiet. Nunc ut sem vitae risus tristique posuere.",
        status: 3,
        ipfsUrl: "https://brown-decisive-tyrannosaurus-507.mypinata.cloud/ipfs/bafybeifjc4r5emdr7zrvdqpzzxxkikl3qxfhe4b3m34pyue4mamnff3xqa",
    },
];

const myCompletedJobs = [
    {
        id: 1,
        title: "Escrow Smart Contract Deployment",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat. Aenean faucibus nibh et justo cursus id rutrum lorem imperdiet. Nunc ut sem vitae risus tristique posuere.",
        status: 4,
        ipfsUrl: "https://brown-decisive-tyrannosaurus-507.mypinata.cloud/ipfs/bafybeifjc4r5emdr7zrvdqpzzxxkikl3qxfhe4b3m34pyue4mamnff3xqa",
    },
    {
        id: 2,
        title: "Design a new logo for my company",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat. Aenean faucibus nibh et justo cursus id rutrum lorem imperdiet. Nunc ut sem vitae risus tristique posuere.",
        status: 4,
        ipfsUrl: "https://brown-decisive-tyrannosaurus-507.mypinata.cloud/ipfs/bafybeifjc4r5emdr7zrvdqpzzxxkikl3qxfhe4b3m34pyue4mamnff3xqa",
    },
    {
        id: 3,
        title: "Develop a new website for my company",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat. Aenean faucibus nibh et justo cursus id rutrum lorem imperdiet. Nunc ut sem vitae risus tristique posuere.",
        status: 4,
        ipfsUrl: "https://brown-decisive-tyrannosaurus-507.mypinata.cloud/ipfs/bafybeifjc4r5emdr7zrvdqpzzxxkikl3qxfhe4b3m34pyue4mamnff3xqa",
    },
];

const DashboardOverview = () => {
    const [openJobs, setOpenJobs] = useState(true);
    const [showAllOpenJobs, setShowAllOpenJobs] = useState(false);
    const [completedJobs, setCompletedJobs] = useState(true);
    const [showAllCompletedJobs, setShowAllCompletedJobs] = useState(false);
    const openJobPosts = myJobs;
    const visibleOpenJobPosts = showAllOpenJobs ? myJobs : myJobs.slice(0, 2);
    const completedJobPosts = myCompletedJobs;
    const visibleCompletedJobPosts = showAllCompletedJobs ? completedJobPosts : completedJobPosts.slice(0, 2);
    const { userInfo, setUserInfo } = useContext(UserInfoCtx);
    const { userLoadingState, setuserLoadingState } = useContext(UserLoadingCtx);
    const [loading, setLoading] = useState("pending");
    const router = useRouter();

    useEffect(() => {
        if(userLoadingState === "success") {
            if(userInfo.id === "") {
                setuserLoadingState("failure");
                return;
            }
            if (userInfo && userInfo.id) {
                const loadDashboardPosts = async () => {
                    if (!userInfo?.id) {
                        setuserLoadingState("failure");
                        return;
                    }
                    // await getGigsPerFreelancerId(userInfo.id);
                    await new Promise(resolve => setTimeout(resolve, 3000));
                    setLoading("success");
                };
        
                loadDashboardPosts();
            }
        } else if (userLoadingState === "failure") {
            router.push("/");
        }
    }, [userInfo, userLoadingState])

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
                                        {visibleOpenJobPosts.map((job) => (
                                            <DashboardPosts 
                                                key={`open-job-${job.id}`} 
                                                variant="open" 
                                                jobId={job.id.toString()}
                                                title={job.title}
                                                description={job.description}
                                                status={job.status}
                                                ipfsUrl={job.ipfsUrl}
                                                clickHandler={() => {
                                                    console.log("open job clicked");
                                                }}
                                            />
                                        ))}
                                        {openJobPosts.length > 2 && (
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
                                        <div className="grid grid-cols-2 gap-8">
                                            {visibleCompletedJobPosts.map((job) => (
                                                <DashboardPosts 
                                                    key={`completed-job-${job.id}`} 
                                                    variant="completed" 
                                                    jobId={job.id.toString()}
                                                    title={job.title}
                                                    description={job.description}
                                                    status={job.status}
                                                    ipfsUrl={job.ipfsUrl}
                                                    clickHandler={() => {}}
                                                />
                                            ))}
                                        </div>
                                        {completedJobPosts.length > 2 && (
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

