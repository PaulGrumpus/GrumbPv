'use client';

import { Suspense, useContext, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { UserLoadingCtx } from "@/context/userLoadingContext";
import Loading from "@/components/loading";
import { UserInfoCtx } from "@/context/userContext";
import Image from "next/image";

import { useWallet } from '@/context/walletContext';
import { NotificationLoadingCtx } from "@/context/notificationLoadingContext";
import { DashboardLoadingCtx } from "@/context/dashboardLoadingContext";
import Input from "@/components/Input";
import Button from "@/components/button";
import { updateUserPassword } from "@/utils/functions";
import { toast } from "react-toastify";
import router from "next/router";

const ResetPasswordContent = () => {
  const { userLoadingState } = useContext(UserLoadingCtx);
  const [loading, setLoading] = useState("pending");
  const { address, chainId, provider, isConnecting, isConnected, connect, disconnect, sendTransaction } = useWallet();
  const { dashboardLoadingState } = useContext(DashboardLoadingCtx)
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [error, setError] = useState("");
  const [errorNewPassword, setErrorNewPassword] = useState(false);
  const [checkError, setCheckError] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const router = useRouter();

  useEffect(() => {
    if(userLoadingState === "failure") {
        const load = async () => {
            await new Promise(resolve => setTimeout(resolve, 1000));
            setLoading("success");
        }
        load();
    }
    if(userLoadingState === "success") {
      if(dashboardLoadingState === "success") {
        const load = async () => {
          await new Promise(resolve => setTimeout(resolve, 1000));
          setLoading("success");
        }
        load();
      }
    }
  }, [userLoadingState, dashboardLoadingState])

  const handleResetPassword = async () => {
    if(newPassword === ""){
      setErrorNewPassword(true);
      setError("New password is required!");
      return;
    }
    if(confirmNewPassword === ""){
      setErrorNewPassword(true);
      setError("Confirm new password is required!");
      return;
    }
    if(newPassword !== confirmNewPassword) {
      setErrorNewPassword(true);
      setError("New password and confirm password should be same!");
      return;
    }

    if(id === null || id === undefined) {
      setError("User Id is required!");
      setErrorNewPassword(true);
      return;
    }

    setError("");
    setNewPassword("");
    setConfirmNewPassword("");
    setErrorNewPassword(false);

    const response = await updateUserPassword(id, newPassword);
    if(!response.success) {
      setError(response.error || "Something went wrong!");
      return;
    }

    toast.success("Password reset successfully!", {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
    });

    router.replace("/");
  }

  if (loading === "pending") {
    return <Loading />;
  }

  if (loading === "success") {
    return (
      <div className="bg-white min-h-screen">
        <div className="container mx-auto">
          <div className="relative">
            <div className="absolute top-40 left-0 w-full h-full">
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="w-50 h-50 rounded-full overflow-hidden">
                  <Image src="/Grmps/grmps.jpg" alt="Grmps" width={100} height={100} className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col items-center justify-center gap-6 lg:p-0 px-2 w-full">
                    <div className="flex flex-col items-center justify-center gap-2 lg:p-0 px-2">
                        <h1 className="text-center lg:text-left lg:text-display text-title font-bold text-[#7E3FF2]">Reset Password</h1>
                        <p className="text-center lg:text-left text-normal font-regular text-[#7E3FF2]">Please enter your new password</p>
                    </div>
                    <div className="flex flex-col gap-2 lg:p-0 px-2 w-100">
                        <p className="text-normal font-regular text-black lg:text-left text-center pb-2">New Password</p>
                        <Input 
                            type="password" 
                            placeholder="New Password" 
                            wrapperClassName="w-full text-black"
                            value={newPassword} 
                            onChange={(e) => setNewPassword(e.target.value)} 
                        />
                    </div>
                    <div className="flex flex-col gap-2 lg:p-0 px-2 w-100">
                        <p className="text-normal font-regular text-black lg:text-left text-center pb-2">Confirm New Password</p>
                        <Input 
                            type="password" 
                            placeholder="Confirm New Password" 
                            wrapperClassName="w-full text-black"
                            value={confirmNewPassword} 
                            onChange={(e) => setConfirmNewPassword(e.target.value)} 
                        />
                    </div>
                    {errorNewPassword && <p className="text-normal font-regular text-red-500 lg:text-left text-center pb-2">{error}</p>}
                    <Button variant="primary" padding="px-10.5 py-3.25" onClick={() => handleResetPassword()}>Reset</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } else {
    return <Loading />;
  }
};

const ResetPassword = () => (
  <Suspense fallback={<Loading />}>
    <ResetPasswordContent />
  </Suspense>
);

export default ResetPassword;
