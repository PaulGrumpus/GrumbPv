import { useContext, useEffect } from "react";
import { useState } from "react";
import BidPost from "../bidPost";
import SectionPlaceholder from "./sectionPlaceholder";
import { useRouter } from "next/navigation";
import { UserInfoCtx } from "@/context/userContext";
import { LoadingCtx } from "@/context/loadingContext";
import { getBidsByFreelancerId, getJobById } from "@/utils/functions";
import { toast } from "react-toastify";
import { Bid, BidStatus } from "@/types/bid";
import Loading from "../loading";
import { Job } from "@/types/jobs";
import { BidPostProps } from "@/types/bid";

const MyBidsSection = () => {
    const router = useRouter();
    const { userInfo, setUserInfo } = useContext(UserInfoCtx);
    const { loadingState, setLoadingState } = useContext(LoadingCtx);
    const [loading, setLoading] = useState("pending");
    const [bids, setBids] = useState<BidPostProps[]>([]);

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

    const getBidsPerFreelancerId = async (freelancer_id: string) => {
        try {
            const result = await getBidsByFreelancerId(freelancer_id);            
            if (result.success) {
                const bidsPostProps = await Promise.all(
                    (result.data ?? []).map(async (bid: Bid) => {
                        const job = await getJobByJobId(bid.job_id);
                        if (!job) {
                            return null;
                        }

                        return {
                            job_description: job.description_md,
                            job_title: job.title,
                            job_location: job.location,
                            job_tags: job.tags,
                            job_max_budget: job.budget_max_usd ?? 0,
                            job_min_budget: job.budget_min_usd ?? 0,
                            job_deadline: job.deadline_at ? new Date(job.deadline_at).getTime() / 1000 : undefined,
                            bid_cover_letter: bid.cover_letter_md ?? "",
                            bid_amount: bid.bid_amount ?? 0,
                            currency: bid.token_symbol ?? "USD",
                            bid_status: bid.status as BidStatus,
                        } as BidPostProps;
                    })
                );

                setBids(bidsPostProps.filter(Boolean) as BidPostProps[]);
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

    useEffect(() => {
        if(loadingState === "success") {
            if(userInfo.id === "") {
                setLoadingState("failure");
                return;
            }
            if (userInfo && userInfo.id) {
                const loadBids = async () => {
                    if (!userInfo?.id) {
                        setLoadingState("failure");
                        return;
                    }
                    await getBidsPerFreelancerId(userInfo.id);
                };
        
                loadBids();
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

