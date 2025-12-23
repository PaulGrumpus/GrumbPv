import SectionPlaceholder from "./sectionPlaceholder";
import Button from "../button";
import UserJobOrGigPost from "../userJobOrGigPost";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { UserInfoCtx } from "@/context/userContext";
import { UserLoadingCtx } from "@/context/userLoadingContext";
import { Gig } from "@/types/gigs";
import { EscrowBackendConfig } from "@/config/config";
import { useProjectInfo } from "@/context/projectInfoContext";
import { ProjectInfoLoadingCtx } from "@/context/projectInfoLoadingContext";
import { NotificationLoadingCtx } from "@/context/notificationLoadingContext";
import SmallLoading from "../smallLoading";
import { DashboardLoadingCtx } from "@/context/dashboardLoadingContext";
import { useDashboard } from "@/context/dashboardContext";
import { DashboardGig } from "@/types/dashboard";

const MyGigsSection = () => {
    const router = useRouter();
    const { userInfo } = useContext(UserInfoCtx);
    const {userLoadingState, setuserLoadingState } = useContext(UserLoadingCtx);
    const [loading, setLoading] = useState("pending");
    // const [gigs, setGigs] = useState<Gig[]>([]);
    const [gigs, setGigs] = useState<DashboardGig[]>([]);
    const { projectInfoLoadingState } = useContext(ProjectInfoLoadingCtx);
    // const { gigsInfo } = useProjectInfo();
    const { notificationLoadingState } = useContext(NotificationLoadingCtx);

    const { dashboardLoadingState } = useContext(DashboardLoadingCtx);
    const { gigsInfo } = useDashboard()

    useEffect(() => {
        if(userLoadingState === "success") {
            if(userInfo.id === "") {
                setuserLoadingState("failure");
                return;
            }
            if (userInfo && userInfo.id) {
                const loadGigs = async () => {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    setGigs(gigsInfo.sort((a: DashboardGig, b: DashboardGig) => new Date(b.created_at ?? "").getTime() - new Date(a.created_at ?? "").getTime()));
                    setLoading("success");
                };
        
                if(dashboardLoadingState === "success") {
                    loadGigs();
                }
            }
        } else if (userLoadingState === "failure") {
            router.push("/");
        }
    }, [userInfo, userLoadingState, dashboardLoadingState])

    useEffect(() => {
        console.log("test-gigsInfo", gigsInfo);
        setGigs(gigsInfo);
    }, [gigsInfo]);

        if (loading === "pending") {
        return <SmallLoading size="lg" />;
    }

    if (loading === "success") {
        return (
            <div>
                <SectionPlaceholder
                    title="My Gigs"
                    description="Track and manage all the gigs you have published."
                />
                {gigs.length > 0 ? (
                    <div>
                        <div className="flex lg:justify-end justify-center">
                            <div className="w-45 mb-8 flex lg:justify-end justify-center">
                                <Button
                                    padding='px-7 py-3'
                                    onClick={() => router.push("/dashboard?view=create-gig")}
                                >
                                    <p className='text-normal font-regular'>+ Create New Gig</p>
                                </Button>
                            </div>
                        </div>
                        <div className="grid lg:grid-cols-2 grid-cols-1 gap-8">
                            {gigs.map((gig) => (
                                <UserJobOrGigPost
                                    key={gig.id}
                                    title={gig.title}
                                    description={gig.description_md}
                                    minBudget={Number(gig.budget_min_usd)}
                                    maxBudget={Number(gig.budget_max_usd)}
                                    currency={gig.token_symbol ?? "USD"}
                                    link={gig.link}
                                    tags={gig.tags ?? []}
                                    image={gig.image_id ? EscrowBackendConfig.uploadedImagesURL + gig.image_id : ""}
                                    variant="gig"
                                />
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center gap-20 mb-38">
                        <p className="text-normal font-regular text-black">No gigs found.</p>
                        <Button
                            padding='px-7 py-3'
                        >
                            <p className='text-normal font-regular'
                                onClick={() => router.push("/dashboard?view=create-gig")}
                            >+ Create New Gig</p>
                        </Button>
                    </div>
                )}
            </div>
        )
    } else {
        return <SmallLoading size="lg" />;
    }
}

export default MyGigsSection;

