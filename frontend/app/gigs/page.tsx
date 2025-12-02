"use client";

import PubJobOrGigPost from "@/components/pubJobOrGigPost";
import { Gig } from "@/types/gigs";
import { LocationType } from "@/types/jobs";
import { useContext, useEffect, useState } from "react";
import { UserInfoCtx } from "@/context/userContext";
import { LoadingCtx } from "@/context/loadingContext";
import { getGigs } from "@/utils/functions";
import Loading from "@/components/loading";
import { EscrowBackendConfig } from "@/config/config";

const gigs = [
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

const GigsPage = () => {

    const { userInfo, setUserInfo } = useContext(UserInfoCtx);
    const { loadingState, setLoadingState } = useContext(LoadingCtx);
    const [loading, setLoading] = useState("pending");
    const [gigs, setGigs] = useState<Gig[]>([]);
    
    useEffect(() => {
        if(loadingState !== "pending") {
            const loadGigs = async () => {
                const result = await getGigs();
                if(result.success) {
                    setGigs(result.data ?? []);
                }
                setLoading("success");
            }
            loadGigs();
        }
    }, [userInfo, loadingState])

    if (loading === "pending") {
        return <Loading />;
    }

    return (
        <div>
            <div className="px-16 bg-white pt-46">
                <div className="container mx-auto">
                    <p className="text-display font-bold text-black pb-6">Gigs</p>
                    <p className="text-normal font-regular text-black pb-20">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.</p>
                    <div className="grid grid-cols-2 gap-8 pb-28">  
                        {gigs.map((gig) => (
                            <PubJobOrGigPost 
                                key={gig.id} 
                                description={gig.description_md} 
                                title={gig.title} 
                                tags={gig.tags ?? []} 
                                minBudget={gig.budget_min_usd ?? 0} 
                                maxBudget={gig.budget_max_usd ?? 0} 
                                image={gig.image_id ? EscrowBackendConfig.uploadedImagesURL + gig.image_id : undefined}
                                currency={gig.token_symbol ?? "USD"} 
                                createdAt={gig.created_at ? new Date(gig.created_at).getTime() / 1000 : 0}
                                label="Contact"
                                clickHandler={() => {
                                }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
} 

export default GigsPage;