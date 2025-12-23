'use client';

import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserLoadingCtx } from "@/context/userLoadingContext";
import Loading from "@/components/loading";
import { UserInfoCtx } from "@/context/userContext";
import Image from "next/image";

import { useWallet } from '@/context/walletContext';
import { NotificationLoadingCtx } from "@/context/notificationLoadingContext";
import { DashboardLoadingCtx } from "@/context/dashboardLoadingContext";

const Home = () => {
  const { userLoadingState } = useContext(UserLoadingCtx);
  const [loading, setLoading] = useState("pending");
  const { address, chainId, provider, isConnecting, isConnected, connect, disconnect, sendTransaction } = useWallet();
  const { dashboardLoadingState } = useContext(DashboardLoadingCtx)

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

  // const { notificationLoadingState } = useContext(NotificationLoadingCtx);


  // useEffect(() => {
  //   if(userLoadingState === "failure") {
  //       const load = async () => {
  //           await new Promise(resolve => setTimeout(resolve, 1000));
  //           setLoading("success");
  //       }
  //       load();
  //   }
  //   if(userLoadingState === "success") {
  //     if(notificationLoadingState === "success") {
  //       const load = async () => {
  //         await new Promise(resolve => setTimeout(resolve, 1000));
  //         setLoading("success");
  //       }
  //       load();
  //     }
  //   }
  // }, [userLoadingState, notificationLoadingState])

  if (loading === "pending") {
    return <Loading />;
  }

  if (loading === "success") {
    return (
      <div className="bg-white min-h-screen">
        <div className="container mx-auto">
          <div className="relative">
            <div className="absolute top-80 left-0 w-full h-full">
              <div className="flex flex-col items-center justify-center gap-6">
                <div className="w-50 h-50 rounded-full overflow-hidden">
                  <Image src="/Grmps/grmps.jpg" alt="Grmps" width={100} height={100} className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col items-center justify-center gap-2 lg:p-0 px-2">
                  <h1 className="text-center lg:text-left lg:text-display text-title font-bold text-[#7E3FF2]">Welcome to Grumpus</h1>
                  <p className="text-center lg:text-left text-normal font-regular text-[#7E3FF2]">The platform for freelancers and clients (Beta Version)</p>
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

export default Home;
