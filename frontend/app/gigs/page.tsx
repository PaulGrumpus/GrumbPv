"use client";

import PubJobOrGigPost from "@/components/pubJobOrGigPost";
import { Gig } from "@/types/gigs";
import { LocationType } from "@/types/jobs";
import { useContext, useEffect, useState } from "react";
import { UserInfoCtx } from "@/context/userContext";
import { UserLoadingCtx } from "@/context/userLoadingContext";
import { createConversationAndParticipant, getGigs } from "@/utils/functions";
import Loading from "@/components/loading";
import { EscrowBackendConfig } from "@/config/config";
import { toast } from "react-toastify";
import { DashboardLoadingCtx } from "@/context/dashboardLoadingContext";
import { useDashboard } from "@/context/dashboardContext";
import { useRouter } from "next/navigation";

const GigsPage = () => {

    const [loading, setLoading] = useState("pending");
    const [gigs, setGigs] = useState<Gig[]>([]);

    const { userInfo } = useContext(UserInfoCtx);
    const { dashboardLoadingState } = useContext(DashboardLoadingCtx);
    const { setConversationsInfo } = useDashboard();

    const router = useRouter();
    
    useEffect(() => {
        let mounted = true;
      
        const loadJobs = async () => {
            const result = await getGigs();
            if (!mounted) return;
        
                if (result.success) {
                    setGigs(
                        (result.data ?? []).sort(
                            (a: Gig, b: Gig) =>
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

    if (loading === "pending") {
        return <Loading />;
    }

    const contactHandler = async (gig_id: string, freelancer_id: string) => {
        if(!userInfo.id){
            toast.warn("Plz login first to contact",{
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
            })
            return;
        }
        if(userInfo.role === "freelancer") {
            toast.warn("Plz login first as client account",{
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
            })
            return;
        }
        if(dashboardLoadingState == "success"){
            const conversation = await createConversationAndParticipant("", "", gig_id, userInfo.id, freelancer_id ?? "");
            if (!conversation.success) {
                throw new Error(conversation.error as string);
            }

            setConversationsInfo(prev => {
                const exists = prev.some(c => c.id === conversation.data.id);
            
                if (!exists) {
                    return [conversation.data, ...prev];
                }
            
                return prev.map(conv =>
                    conv.id === conversation.data.id
                        ? {
                            ...conv,
                            ...conversation.data,
                            participants:
                                conversation.data.participants ?? conv.participants,
                            messages:
                                conversation.data.messages ?? conv.messages,
                        }
                        : conv
                );
            });
            router.push(`/chat?conversation_id=${conversation.data.id}`);
        }
    }

    return (
        <div>
            <div className="lg:px-16 px-4 bg-white lg:pt-46 pt-22">
                <div className="container mx-auto">
                    <p className="lg:text-display text-title lg:text-left text-center font-bold text-black pb-6">Gigs</p>
                    <p className="text-normal font-regular text-black pb-20">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.</p>
                    <div className="grid lg:grid-cols-2 grid-cols-1 gap-8 pb-28">  
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
                                clickHandler={() => {contactHandler(gig.id ?? "", gig.freelancer_id)}}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
} 

export default GigsPage;