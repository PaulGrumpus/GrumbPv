import SectionPlaceholder from "./sectionPlaceholder";
import Button from "../button";
import UserJobOrGigPost from "../userJobOrGigPost";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { UserInfoCtx } from "@/context/userContext";
import { UserLoadingCtx } from "@/context/userLoadingContext";
import { Gig } from "@/types/gigs";
import { toast } from "react-toastify";
import { getGigsByFreelancerId } from "@/utils/functions";
import { EscrowBackendConfig } from "@/config/config";
import Loading from "../loading";
import { LocationType } from "@/types/jobs";
import { ProjectInfoCtx, useProjectInfo } from "@/context/projectInfoContext";
import { ProjectInfoLoadingCtx } from "@/context/projectInfoLoadingContext";

const MyGigsSection = () => {
    const router = useRouter();
    const { userInfo, setUserInfo } = useContext(UserInfoCtx);
    const { userLoadingState, setuserLoadingState } = useContext(UserLoadingCtx);
    const [loading, setLoading] = useState("pending");
    const [gigs, setGigs] = useState<Gig[]>([]);
    const { projectInfoLoadingState } = useContext(ProjectInfoLoadingCtx);
    const { gigsInfo } = useProjectInfo();

    const getGigsPerFreelancerId = async (freelancer_id: string) => {
        try {
            const result = await getGigsByFreelancerId(freelancer_id);
            if (result.success) {
                setGigs(result.data ?? []);
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
        if(projectInfoLoadingState === "success") {
            if(userInfo.id === "") {
                setuserLoadingState("failure");
                return;
            }
            if (userInfo && userInfo.id) {
                const loadGigs = async () => {
                    console.log("test-loadGigs");
                    console.log("test-gigsInfo", gigsInfo);
                    setGigs(gigsInfo);
                    setLoading("success");
                    // await getGigsPerFreelancerId(userInfo.id);
                };
        
                loadGigs();
            }
        } else if (projectInfoLoadingState === "failure") {
            router.push("/");
        }
    }, [userInfo, projectInfoLoadingState])

    useEffect(() => {
        console.log("test-gigsInfo", gigsInfo);
        setGigs(gigsInfo);
    }, [gigsInfo]);

        if (loading === "pending") {
        return <Loading />;
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
                        <div className="flex justify-end">
                            <div className="w-45 mb-8 flex justify-end">
                                <Button
                                    padding='px-7 py-3'
                                    onClick={() => router.push("/dashboard?view=create-gig")}
                                >
                                    <p className='text-normal font-regular'>+ Create Gig</p>
                                </Button>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-8">
                            {gigs.map((gig) => (
                                <UserJobOrGigPost
                                    key={gig.id}
                                    title={gig.title}
                                    description={gig.description_md}
                                    minBudget={gig.budget_min_usd}
                                    maxBudget={gig.budget_max_usd}
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
                            >+ Create Gig</p>
                        </Button>
                    </div>
                )}
            </div>
        )
    } else {
        return <Loading />;
    }
}

export default MyGigsSection;

