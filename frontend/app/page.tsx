'use client';

import { useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoadingCtx } from "@/context/loadingContext";
import Loading from "@/components/loading";

const Home = () => {
  const router = useRouter();
  const { loadingState } = useContext(LoadingCtx);

  useEffect(() => {
    if (loadingState === "failure") {
      router.push("/");
    }
  }, [loadingState, router]);

  if (loadingState === "pending") {
    return <Loading />;
  }

  if (loadingState === "success") {
    return <div className="bg-white min-h-screen"></div>;
  } else {
    return <div className="bg-white min-h-screen"></div>;
  }
};

export default Home;
