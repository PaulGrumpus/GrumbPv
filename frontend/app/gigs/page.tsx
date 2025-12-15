"use client";

import PubJobOrGigPost from "@/components/pubJobOrGigPost";
import { Gig } from "@/types/gigs";
import { LocationType } from "@/types/jobs";
import { useContext, useEffect, useState } from "react";
import { UserInfoCtx } from "@/context/userContext";
import { UserLoadingCtx } from "@/context/userLoadingContext";
import { getGigs } from "@/utils/functions";
import Loading from "@/components/loading";
import { EscrowBackendConfig } from "@/config/config";

const GigsPage = () => {

    const { userInfo, setUserInfo } = useContext(UserInfoCtx);
    const { userLoadingState, setuserLoadingState } = useContext(UserLoadingCtx);
    const [loading, setLoading] = useState("pending");
    const [gigs, setGigs] = useState<Gig[]>([]);
    
    useEffect(() => {
        if(userLoadingState !== "pending") {
            const loadGigs = async () => {
                const result = await getGigs();
                if(result.success) {
                    setGigs(result.data.sort((a: Gig, b: Gig) => new Date(a.created_at ?? "").getTime() - new Date(b.created_at ?? "").getTime()) ?? []);
                }
                await new Promise(resolve => setTimeout(resolve, 3000));
                setLoading("success");
            }
            loadGigs();
        }
    }, [userInfo, userLoadingState])

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