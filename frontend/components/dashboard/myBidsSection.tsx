import { useContext, useEffect } from "react";
import { useState } from "react";
import BidPost from "../bidPost";
import SectionPlaceholder from "./sectionPlaceholder";
import { useRouter } from "next/navigation";
import { UserInfoCtx } from "@/context/userContext";
import { UserLoadingCtx } from "@/context/userLoadingContext";
import { getBidsByFreelancerId, getJobById } from "@/utils/functions";
import { toast } from "react-toastify";
import { Bid, BidStatus } from "@/types/bid";
import Loading from "../loading";
import { Job } from "@/types/jobs";
import { BidPostProps } from "@/types/bid";
import { NotificationLoadingCtx } from "@/context/notificationLoadingContext";
import { useProjectInfo } from "@/context/projectInfoContext";
import { BidWithJob } from "@/types/projectInfo";

const MyBidsSection = () => {
    const router = useRouter();
    const { userInfo, setUserInfo } = useContext(UserInfoCtx);
    const { userLoadingState, setuserLoadingState } = useContext(UserLoadingCtx);
    const [loading, setLoading] = useState("pending");
    const [bids, setBids] = useState<BidPostProps[]>([]);
    const { notificationLoadingState } = useContext(NotificationLoadingCtx);
    const { bidsInfo } = useProjectInfo();

    const getJobByJobId = async (job_id: string) => {
        try {
            const result = await getJobById(job_id);
            if(result.success) {
                return result.data as Job;
            }
            else {
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
            toast.error(error as string, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        }
    }

    const parseBids = (bids: BidWithJob[]) => {
        const bidsPostProps = bids.map((bid: BidWithJob) => ({
            job_description: bid.job.description_md,
            job_title: bid.job.title,
            job_location: bid.job.location,
            job_tags: bid.job.tags,
            job_max_budget: bid.job.budget_max_usd ?? 0,
            job_min_budget: bid.job.budget_min_usd ?? 0,
            job_deadline: bid.job.deadline_at
                ? new Date(bid.job.deadline_at).getTime() / 1000
                : undefined,
            bid_cover_letter: bid.cover_letter_md ?? "",
            bid_amount: bid.bid_amount ?? 0,
            currency: bid.token_symbol ?? "USD",
            bid_status: bid.status,
            created_at: bid.created_at ?? 0,
        }));

        bidsPostProps.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        
        setBids(bidsPostProps);
        setLoading("success");           
            
    }

    useEffect(() => {
        if(userLoadingState === "success") {
            if(userInfo.id === "") {
                setuserLoadingState("failure");
                return;
            }
            if (userInfo && userInfo.id) {
                const loadBids = () => {
                    parseBids(bidsInfo);
                };
        
                if(notificationLoadingState === "success") {
                    loadBids();
                }
            }
        } else if (userLoadingState === "failure") {
            router.push("/");
        }
    }, [userInfo, userLoadingState, notificationLoadingState])

    if (loading === "pending") {
        return <Loading />;
    }

    if (loading === "success") {
        return (
            <div>
                <SectionPlaceholder
                    title="My Bids"
                    description="Review the jobs you have bid on and follow up as needed."
                />

                {bids.length > 0 ? (
                    <div className="grid grid-cols-2 gap-8">
                        {bids.map((bid: BidPostProps) => (
                            <BidPost 
                                key={bid.bid_id}
                                bid_id={bid.bid_id}
                                job_description={bid.job_description}
                                job_title={bid.job_title}
                                job_location={bid.job_location}
                                job_tags={bid.job_tags}
                                job_max_budget={bid.job_max_budget}
                                job_min_budget={bid.job_min_budget}
                                job_deadline={bid.job_deadline}
                                bid_cover_letter={bid.bid_cover_letter}
                                bid_amount={bid.bid_amount}
                                currency={bid.currency}
                                bid_status={bid.bid_status} 
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center gap-20 mb-38">
                        <p className="text-normal font-regular text-black">No bids found.</p>
                    </div>
                )}
            </div>
        );
    } else {
        return <Loading />;
    }
};

export default MyBidsSection;

