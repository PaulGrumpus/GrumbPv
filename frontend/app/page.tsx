'use client';

import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserLoadingCtx } from "@/context/userLoadingContext";
import Loading from "@/components/loading";
import { UserInfoCtx } from "@/context/userContext";
import Image from "next/image";

const Home = () => {
  const { userLoadingState } = useContext(UserLoadingCtx);
  const [loading, setLoading] = useState("pending");

  useEffect(() => {
    if(userLoadingState !== "pending") {
        const load = async () => {
            await new Promise(resolve => setTimeout(resolve, 3000));
            setLoading("success");
        }
        load();
    }
}, [userLoadingState])

  if (loading === "pending") {
    return <Loading />;
  }

  if (loading === "success") {
    return (
      <div className="bg-white min-h-screen">
        <div className="container mx-auto">
          <div className="relative">
            <div className="absolute top-60 left-0 w-full h-full">
              <div className="flex flex-col items-center justify-center gap-6">
                <div className="w-50 h-50 rounded-full overflow-hidden">
                  <Image src="/Grmps/grmps.jpg" alt="Grmps" width={100} height={100} className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col items-center justify-center gap-2">
                  <h1 className="text-display font-bold text-[#7E3FF2]">Welcome to Grumpus</h1>
                  <p className="text-normal font-regular text-[#7E3FF2]">The platform for freelancers and clients (Beta Version)</p>
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
