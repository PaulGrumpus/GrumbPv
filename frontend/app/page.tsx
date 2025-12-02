'use client';

import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoadingCtx } from "@/context/loadingContext";
import Loading from "@/components/loading";
import { UserInfoCtx } from "@/context/userContext";

const Home = () => {
  const { loadingState } = useContext(LoadingCtx);
  const [loading, setLoading] = useState("pending");

  useEffect(() => {
    if(loadingState !== "pending") {
        const load = async () => {
            await new Promise(resolve => setTimeout(resolve, 3000));
            setLoading("success");
        }
        load();
    }
}, [loadingState])

  if (loading === "pending") {
    return <Loading />;
  }

  if (loading === "success") {
    return <div className="bg-white min-h-screen"></div>;
  } else {
    return <Loading />;
  }
};

export default Home;
