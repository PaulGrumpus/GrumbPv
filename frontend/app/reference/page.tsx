"use client";

import { UserInfoCtx } from "@/context/userContext";
import { getJobApplicationById, getJobById, getUserById } from "@/utils/functions";
import { UserLoadingCtx } from "@/context/userLoadingContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useContext, useEffect, useState, Suspense } from "react";
import Loading from "@/components/loading";
import { toast } from "react-toastify";
import ReferenceDoc from "@/components/referenceDoc";

const ReferencePageContent = () => {
    const param = useSearchParams();
    const jobApplicationId = param.get("jobApplicationId");
    const conversationId = param.get("conversationId");

    const { userInfo, setUserInfo } = useContext(UserInfoCtx);
    const { userLoadingState, setuserLoadingState } = useContext(UserLoadingCtx);
    const [loading, setLoading] = useState("pending");
    const router = useRouter();

    const [jobTitle, setJobTitle] = useState("");
    const [jobId, setJobId] = useState("");
    const [description, setDescription] = useState("");
    const [clientFullName, setClientFullName] = useState("");
    const [clientId, setClientId] = useState("");
    const [freelancerFullName, setFreelancerFullName] = useState("");
    const [freelancerId, setFreelancerId] = useState("");
    const [freelancerConfirmed, setFreelancerConfirmed] = useState(false);
    const [clientConfirmed, setClientConfirmed] = useState(false);
    const [budget, setBudget] = useState(0);
    const [currency, setCurrency] = useState("USD");
    const [deliverables, setDeliverables] = useState("");
    const [outOfScope, setOutOfScope] = useState("");
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());

    useEffect(() => {
        if(userLoadingState === "success") {
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
                    setJobId(jobApplicationInfo.data.job_info.id);
                    setJobTitle(jobApplicationInfo.data.job_info.title);
                    setDescription(jobApplicationInfo.data.job_info.description_md);
                    setClientFullName(jobApplicationInfo.data.client_info.display_name ?? jobApplicationInfo.data.client_info.email ?? "");
                    setBudget(jobApplicationInfo.data.job_application_info.budget ?? (Number(jobApplicationInfo.data.job_info.budget_min) + Number(jobApplicationInfo.data.job_info.budget_max)) / 2);
                    setCurrency(jobApplicationInfo.data.job_application_info.token_symbol ?? jobApplicationInfo.data.job_info.token_symbol ?? "USD");
                    setFreelancerFullName(jobApplicationInfo.data.freelancer_info.display_name ?? jobApplicationInfo.data.freelancer_info.email ?? "");
                    setFreelancerConfirmed(jobApplicationInfo.data.job_application_info.freelancer_confirm);
                    setClientConfirmed(jobApplicationInfo.data.job_application_info.client_confirm);
                    setClientId(jobApplicationInfo.data.client_info.id);
                    setFreelancerId(jobApplicationInfo.data.freelancer_info.id);
                    setDeliverables(jobApplicationInfo.data.job_application_info.deliverables ?? "");
                    setOutOfScope(jobApplicationInfo.data.job_application_info.out_of_scope ?? "");
                    setStartDate(jobApplicationInfo.data.job_application_info.start_date ?? "");
                    setEndDate(jobApplicationInfo.data.job_application_info.end_date ?? "");

                    await new Promise(resolve => setTimeout(resolve, 1000));
                    setLoading("success");
                }
                getJob();
            }
        } else if (userLoadingState === "failure") {
            router.push("/");
        }
    }, [userInfo, userLoadingState, router, jobApplicationId])

    if (loading === "pending") {
        return <Loading />;
    }

    if (loading === "success") {
        return (
            <div className="bg-white lg:pt-34 pt-22 lg:px-16 px-4 lg:pb-21.25 pb-8.75">
                <div className="container mx-auto">
                    <ReferenceDoc 
                        jobId={jobId} 
                        jobApplicationId={jobApplicationId ?? ""}
                        conversationId={conversationId ?? ""}
                        userInfo={userInfo}
                        clientId={clientId}
                        freelancerId={freelancerId}
                        projectName={jobTitle} 
                        clientFullName={clientFullName} 
                        freelancerFullName={freelancerFullName} 
                        description={description} 
                        freelancerConfirmed={freelancerConfirmed} 
                        clientConfirmed={clientConfirmed} 
                        initialBudget={budget} 
                        initialCurrency={currency}
                        initialDeliverables={deliverables}
                        initialOutOfScope={outOfScope}
                        initialStartDate={new Date(startDate)}
                        initialEndDate={new Date(endDate)}
                    />
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