"use client";

import { UserInfoCtx } from "@/context/userContext";
import { getJobApplicationById, getJobById, getUserById } from "@/utils/functions";
import { LoadingCtx } from "@/context/loadingContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useContext, useEffect, useState, Suspense } from "react";
import Loading from "@/components/loading";
import { toast } from "react-toastify";
import ReferenceDoc from "@/components/referenceDoc";

const ReferencePageContent = () => {
    const param = useSearchParams();
    const jobApplicationId = param.get("jobApplicationId");

    const { userInfo, setUserInfo } = useContext(UserInfoCtx);
    const { loadingState, setLoadingState } = useContext(LoadingCtx);
    const [loading, setLoading] = useState("pending");
    const router = useRouter();

    const [jobTitle, setJobTitle] = useState("");
    const [description, setDescription] = useState("");
    const [clientFullName, setClientFullName] = useState("");
    const [freelancerFullName, setFreelancerFullName] = useState("");
    const [freelancerConfirmed, setFreelancerConfirmed] = useState(false);
    const [clientConfirmed, setClientConfirmed] = useState(false);
    const [budget, setBudget] = useState(0);
    const [currency, setCurrency] = useState("USD");

    useEffect(() => {
        if(loadingState === "success") {
            if(userInfo.id === "") {
                router.push("/");
                return;
            }
            if (userInfo && userInfo.id) {
                const getJob = async () => {
                    const jobApplicationInfo = await getJobApplicationById(jobApplicationId ?? "");
                    if (!jobApplicationInfo.success) {
                        toast.error(jobApplicationInfo.error as string, {
                            position: "top-right",
                            autoClose: 5000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                        });
                        return;
                    }
                    setJobTitle(jobApplicationInfo.data.job_info.title);
                    setDescription(jobApplicationInfo.data.job_info.description_md);
                    setClientFullName(jobApplicationInfo.data.client_info.display_name ?? jobApplicationInfo.data.client_info.email ?? "");
                    setBudget((Number(jobApplicationInfo.data.job_info.budget_min_usd) + Number(jobApplicationInfo.data.job_info.budget_max_usd)) / 2);
                    setCurrency(jobApplicationInfo.data.job_info.token_symbol ?? "USD");
                    setFreelancerFullName(jobApplicationInfo.data.freelancer_info.display_name ?? jobApplicationInfo.data.freelancer_info.email ?? "");
                    setFreelancerConfirmed(jobApplicationInfo.data.freelancer_confirm);
                    setClientConfirmed(jobApplicationInfo.data.client_confirm);

                    await new Promise(resolve => setTimeout(resolve, 3000));
                    setLoading("success");
                }
                getJob();
            }
        } else if (loadingState === "failure") {
            router.push("/");
        }
    }, [userInfo, loadingState, router, jobApplicationId])

    if (loading === "pending") {
        return <Loading />;
    }

    if (loading === "success") {
        return (
            <div className="bg-white pt-34 px-16 pb-21.25">
                <div className="container mx-auto">
                    <ReferenceDoc jobId={jobApplicationId ?? ""} projectName={jobTitle} clientFullName={clientFullName} freelancerFullName={freelancerFullName} description={description} freelancerConfirmed={freelancerConfirmed} clientConfirmed={clientConfirmed} initialBudget={budget} initialCurrency={currency} />
                </div>
            </div>
        )
    } else {
        return <Loading />;
    }
}

const referencePage = () => {
    return (
        <Suspense fallback={<Loading />}>
            <ReferencePageContent />
        </Suspense>
    );
}

export default referencePage