import SectionPlaceholder from "./sectionPlaceholder";
import Button from "../button";
import UserJobOrGigPost from "../userJobOrGigPost";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { UserInfoCtx } from "@/context/userContext";
import { LoadingCtx } from "@/context/loadingContext";
import { Gig } from "@/types/gigs";
import { toast } from "react-toastify";
import { getGigsByFreelancerId } from "@/utils/functions";
import { EscrowBackendConfig } from "@/config/config";
import Loading from "../loading";

const Gigs = [
    {
        title: "Gig 1",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat. Aenean faucibus nibh et justo cursus id rutrum lorem imperdiet. Nunc ut sem vitae risus tristique posuere.",
        subtitle: "Subtitle 1",
        tags: ["Tag 1"],
    },
    {
        title: "Gig 2",
        image: "/Grmps/profile-image.jpg",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat. Aenean faucibus nibh et justo cursus id rutrum lorem imperdiet. Nunc ut sem vitae risus tristique posuere.",
        subtitle: "Subtitle 2",
        tags: ["Tag 1"],
    },
    {
        title: "Gig 3",
        description: "DescLorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat. Aenean faucibus nibh et justo cursus id rutrum lorem imperdiet. Nunc ut sem vitae risus tristique posuere.",
        subtitle: "Subtitle 3",
        tags: ["Tag 1"],
    },
]

const MyGigsSection = () => {
    const router = useRouter();
    const { userInfo, setUserInfo } = useContext(UserInfoCtx);
    const { loadingState, setLoadingState } = useContext(LoadingCtx);
    const [loading, setLoading] = useState("pending");
    const [gigs, setGigs] = useState<Gig[]>([]);

    const getGigsPerFreelancerId = async (freelancer_id: string) => {
        try {
            const result = await getGigsByFreelancerId(freelancer_id);
            if (result.success) {
                setGigs(result.data ?? []);
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
        if(loadingState === "success") {
            if(userInfo.id === "") {
                setLoadingState("failure");
                return;
            }
            if (userInfo && userInfo.id) {
                const loadGigs = async () => {
                    if (!userInfo?.id) {
                        setLoadingState("failure");
                        return;
                    }
                    await getGigsPerFreelancerId(userInfo.id);
                };
        
                loadGigs();
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
                                    subtitle={""}
                                    tags={gig.tags ?? []}
                                    image={gig.image_id ? EscrowBackendConfig.uploadedImagesURL + gig.image_id : ""}
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

