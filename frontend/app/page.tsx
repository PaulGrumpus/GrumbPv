'use client';

import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserLoadingCtx } from "@/context/userLoadingContext";
import Loading from "@/components/loading";
import { UserInfoCtx } from "@/context/userContext";
import Image from "next/image";
import Link from "next/link";
import { useWallet } from '@/context/walletContext';
import { DashboardLoadingCtx } from "@/context/dashboardLoadingContext";
import LoginSignupModal from "@/components/loginSignupModal";

/* ── static data ── */

const categories = [
  { icon: "💻", label: "Development & IT" },
  { icon: "🎨", label: "Design & Creative" },
  { icon: "📝", label: "Writing & Content" },
  { icon: "📊", label: "Sales & Marketing" },
  { icon: "🤖", label: "AI & Blockchain" },
  { icon: "📱", label: "Mobile Development" },
  { icon: "🔧", label: "Admin & Support" },
  { icon: "📈", label: "Finance & Accounting" },
];

const howItWorksClient = [
  {
    step: "01",
    title: "Post a Job",
    description: "Describe what you need, set your budget in BNB, and define milestones. Your job goes live instantly for freelancers to discover.",
  },
  {
    step: "02",
    title: "Review & Hire",
    description: "Receive proposals from skilled freelancers, review their profiles and portfolios, chat to align on requirements, and hire the right fit.",
  },
  {
    step: "03",
    title: "Pay Securely via Escrow",
    description: "Fund milestones through on-chain escrow. Funds are held safely in a smart contract and only released when you approve the delivered work.",
  },
];

const howItWorksFreelancer = [
  {
    step: "01",
    title: "Create Your Profile & Gigs",
    description: "Showcase your skills, set your rates in BNB, and create gigs that clients can discover. Connect your wallet to get paid directly.",
  },
  {
    step: "02",
    title: "Find Work & Apply",
    description: "Browse open jobs, submit proposals with your price and timeline, and chat with clients to finalize the scope and requirements.",
  },
  {
    step: "03",
    title: "Deliver & Get Paid",
    description: "Submit your work with on-chain proof via IPFS. Once the client approves, withdraw your payment directly from the escrow contract.",
  },
];

const testimonials = [
  {
    quote: "The escrow system gave me confidence to take on larger projects. Knowing my payment is secured on-chain before I start working changes everything.",
    name: "Alex R.",
    role: "Full-Stack Developer",
    image: "/Grmps/lancer-1.jpg",
  },
  {
    quote: "As a client, I love that I can fund milestones and only release payment when the work meets my standards. The smart contract handles everything fairly.",
    name: "Sarah M.",
    role: "Startup Founder",
    image: "/Grmps/lancer-2.jpg",
  },
  {
    quote: "Grumbuild combines the best of freelancing with blockchain transparency. The milestone-based workflow keeps projects on track and payments predictable.",
    name: "James K.",
    role: "UI/UX Designer",
    image: "/Grmps/lancer-3.jpg",
  },
  {
    quote: "I switched from traditional platforms because of the fees and payment delays. Here, I withdraw directly from escrow the moment my work is approved.",
    name: "Maria L.",
    role: "Content Strategist",
    image: "/Grmps/lancer-4.jpg",
  },
  {
    quote: "The dispute resolution system is fair and transparent. Both parties have skin in the game, which means disagreements get resolved quickly.",
    name: "David C.",
    role: "Project Manager",
    image: "/Grmps/lancer-5.jpg",
  },
  {
    quote: "Being able to earn GRMPS rewards on top of my project payment is a great incentive. It rewards good work and dispute-free collaboration.",
    name: "Nina T.",
    role: "Blockchain Developer",
    image: "/Grmps/lancer-6.jpg",
  },
];

const stats = [
  { value: "100%", label: "On-Chain Transparency" },
  { value: "1%", label: "Platform Fee" },
  { value: "BSC", label: "BNB Smart Chain" },
  { value: "24/7", label: "Escrow Protection" },
];

/* ── component ── */

const Home = () => {
  const router = useRouter();
  const { userLoadingState } = useContext(UserLoadingCtx);
  const { userInfo } = useContext(UserInfoCtx);
  const [loading, setLoading] = useState("pending");
  const { dashboardLoadingState } = useContext(DashboardLoadingCtx);
  const [loginSignupModalOpen, setLoginSignupModalOpen] = useState(false);
  const [howItWorksTab, setHowItWorksTab] = useState<"client" | "freelancer">("client");

  useEffect(() => {
    if (userLoadingState === "failure") {
      const load = async () => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setLoading("success");
      };
      load();
    }
    if (userLoadingState === "success") {
      if (dashboardLoadingState === "success") {
        const load = async () => {
          await new Promise(resolve => setTimeout(resolve, 1000));
          setLoading("success");
        };
        load();
      }
    }
  }, [userLoadingState, dashboardLoadingState]);

  if (loading === "pending") {
    return <Loading />;
  }

  const loggedIn = !!userInfo.id;

  return (
    <>
      <div className="bg-white min-h-screen">

        {/* ═══════ HERO ═══════ */}
        <section className="relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-28">
          {/* Background gradient blobs */}
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#7E3FF2] opacity-[0.06] rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[#2F3DF6] opacity-[0.06] rounded-full blur-[120px]" />

          <div className="container mx-auto px-4 lg:px-16">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
              {/* Left content */}
              <div className="flex-1 text-center lg:text-left">
                <div className="inline-block mb-6 px-4 py-1.5 rounded-full bg-[#7E3FF2]/10 text-[#7E3FF2] text-small font-medium">
                  Powered by BNB Smart Chain
                </div>
                <h1 className="text-display font-bold text-black leading-tight mb-6">
                  Work with confidence.{" "}
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#2F3DF6] to-[#7E3FF2]">
                    Get paid securely.
                  </span>
                </h1>
                <p className="text-light-large font-regular text-gray-500 mb-8 max-w-xl mx-auto lg:mx-0">
                  Grumbuild connects clients and freelancers through milestone-based escrow on the blockchain. No middlemen holding your funds - just smart contracts, transparency, and fair payments.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  {loggedIn ? (
                    <>
                      <button
                        onClick={() => router.push("/dashboard")}
                        className="button-primary text-white text-normal font-medium rounded-lg px-8 py-3.5 transition-transform duration-150 hover:scale-105"
                      >
                        Go to Dashboard
                      </button>
                      <button
                        onClick={() => router.push("/jobs")}
                        className="linear-border rounded-lg p-0.25 transition-transform duration-150 hover:scale-105"
                      >
                        <span className="linear-border__inner block bg-white text-[#7E3FF2] text-normal font-medium rounded-[0.4375rem] px-8 py-3.5 hover:bg-gradient-to-r hover:from-[#2F3DF6] hover:to-[#7E3FF2] hover:text-white transition-colors">
                          Browse Jobs
                        </span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setLoginSignupModalOpen(true)}
                        className="button-primary text-white text-normal font-medium rounded-lg px-8 py-3.5 transition-transform duration-150 hover:scale-105"
                      >
                        I want to hire
                      </button>
                      <button
                        onClick={() => setLoginSignupModalOpen(true)}
                        className="linear-border rounded-lg p-0.25 transition-transform duration-150 hover:scale-105"
                      >
                        <span className="linear-border__inner block bg-white text-[#7E3FF2] text-normal font-medium rounded-[0.4375rem] px-8 py-3.5 hover:bg-gradient-to-r hover:from-[#2F3DF6] hover:to-[#7E3FF2] hover:text-white transition-colors">
                          I want to work
                        </span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Right - freelancer grid */}
              <div className="flex-1 relative hidden lg:block">
                <div className="grid grid-cols-3 gap-3 max-w-md ml-auto">
                  {["/Grmps/lancer-1.jpg", "/Grmps/lancer-2.jpg", "/Grmps/lancer-3.jpg",
                    "/Grmps/lancer-4.jpg", "/Grmps/lancer-5.jpg", "/Grmps/lancer-6.jpg"].map((src, i) => (
                    <div
                      key={i}
                      className={`rounded-2xl overflow-hidden shadow-lg ${i === 0 ? "col-span-2 row-span-2" : ""}`}
                      style={{ animationDelay: `${i * 0.1}s` }}
                    >
                      <Image
                        src={src}
                        alt={`Freelancer ${i + 1}`}
                        width={300}
                        height={300}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════ STATS BAR ═══════ */}
        <section className="from-bg-light-bule-to-bg-purple py-10">
          <div className="container mx-auto px-4 lg:px-16">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-display font-bold text-black">{stat.value}</p>
                  <p className="text-small font-regular text-gray-700 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════ CATEGORIES ═══════ */}
        <section className="py-20">
          <div className="container mx-auto px-4 lg:px-16">
            <h2 className="md:text-title font-bold text-black mb-2 leading-8 text-[2rem]">Find freelancers for every type of work</h2>
            <p className="text-normal font-regular text-gray-500 mb-10">Whatever your project needs, there&apos;s a skilled professional ready to help.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories.map((cat) => (
                <Link
                  key={cat.label}
                  href="/gigs"
                  className="group flex items-center gap-3 p-5 rounded-xl border border-gray-200 bg-white hover:border-[#7E3FF2]/40 hover:shadow-lg transition-all duration-300"
                >
                  <span className="text-subtitle">{cat.icon}</span>
                  <span className="text-small font-medium text-black group-hover:text-[#7E3FF2] transition-colors">{cat.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════ HOW IT WORKS ═══════ */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 lg:px-16">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-12 gap-4">
              <h2 className="text-title font-bold text-black md:text-left text-center">How it works</h2>
              <div className="flex rounded-lg border border-gray-200 overflow-hidden md:self-start justify-center">
                <button
                  onClick={() => setHowItWorksTab("client")}
                  className={`px-5 py-2.5 text-small font-medium transition-colors cursor-pointer ${
                    howItWorksTab === "client"
                      ? "bg-linear-to-r from-[#2F3DF6] to-[#7E3FF2] text-white"
                      : "bg-white text-gray-600 hover:text-[#7E3FF2]"
                  }`}
                >
                  For Hiring
                </button>
                <button
                  onClick={() => setHowItWorksTab("freelancer")}
                  className={`px-5 py-2.5 text-small font-medium transition-colors cursor-pointer ${
                    howItWorksTab === "freelancer"
                      ? "bg-gradient-to-r from-[#2F3DF6] to-[#7E3FF2] text-white"
                      : "bg-white text-gray-600 hover:text-[#7E3FF2]"
                  }`}
                >
                  For Finding Work
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(howItWorksTab === "client" ? howItWorksClient : howItWorksFreelancer).map((item) => (
                <div
                  key={item.step}
                  className="relative bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg hover:border-[#7E3FF2]/20 transition-all duration-300 group"
                >
                  <span className="text-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#2F3DF6] to-[#7E3FF2] opacity-30 group-hover:opacity-60 transition-opacity">
                    {item.step}
                  </span>
                  <h3 className="text-large font-bold text-black mt-2 mb-3">{item.title}</h3>
                  <p className="text-small font-regular text-gray-500 leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════ BLOCKCHAIN PROOF ═══════ */}
        <section className="py-20">
          <div className="container mx-auto px-4 lg:px-16">
            <div className="text-center mb-12">
              <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-[#7E3FF2]/10 text-[#7E3FF2] text-small font-medium">
                Verified On-Chain
              </div>
              <h2 className="md:text-title font-bold text-black mb-3 leading-8 text-[2rem]">Real transactions. Real transparency.</h2>
              <p className="text-normal font-regular text-gray-500 max-w-2xl mx-auto">
                Every escrow fund, delivery, approval, and withdrawal on Grumbuild is a real transaction on BNB Smart Chain - publicly verifiable by anyone, anytime.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
              {/* Screenshot 1 - Escrow funding */}
              <div className="linear-border rounded-2xl p-0.25">
                <div className="linear-border__inner bg-white rounded-[0.9375rem] p-5">
                  <a href="https://testnet.bscscan.com/tx/0x69e4fea1552de884b1dd7abf61b76c84902005c2f4819274f50fcb99e07e1da4" target="_blank" className="rounded-xl overflow-hidden border border-gray-100 bg-gray-50 aspect-video flex items-center justify-center">
                    {/* Replace src with your actual screenshot */}
                    <Image
                      src="/Grmps/fund.png"
                      alt="BSC transaction showing escrow funding on BscScan"
                      width={800}
                      height={450}
                      className="w-full h-full object-cover"
                    />
                  </a>
                  <div className="mt-4">
                    <p className="text-normal font-medium text-black">Escrow Funding Transaction</p>
                    <p className="text-small font-regular text-gray-500 mt-1">
                      When a client funds a milestone, BNB is sent directly to the escrow smart contract. This transaction is recorded on BSC and visible on BscScan - proving the funds are locked and protected.
                    </p>
                  </div>
                </div>
              </div>

              {/* Screenshot 2 - Withdrawal / payout */}
              <div className="linear-border rounded-2xl p-0.25">
                <div className="linear-border__inner bg-white rounded-[0.9375rem] p-5">
                  <a href="https://testnet.bscscan.com/tx/0xb0bb378bce9528b2e71260c95094627f912cff45522c6bd094751d15e1193af8" target="_blank" className="rounded-xl overflow-hidden border border-gray-100 bg-gray-50 aspect-video flex items-center justify-center">
                    {/* Replace src with your actual screenshot */}
                    <Image
                      src="/Grmps/withdraw.png"
                      alt="BSC transaction showing freelancer withdrawal on BscScan"
                      width={800}
                      height={450}
                      className="w-full h-full object-cover"
                    />
                  </a>
                  <div className="mt-4">
                    <p className="text-normal font-medium text-black">Freelancer Withdrawal Transaction</p>
                    <p className="text-small font-regular text-gray-500 mt-1">
                      Once work is approved, the freelancer withdraws their payout directly from the escrow contract. The transaction shows the exact BNB amount, platform fee split, and GRMPS reward distribution.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Optional: third screenshot full-width */}
            <div className="linear-border rounded-2xl p-0.25">
              <div className="linear-border__inner bg-white rounded-[0.9375rem] p-5">
                <a href="https://testnet.bscscan.com/address/0x0121ea8ab3c62d614B425d66aC5D628246BEef1D" target="_blank" className="rounded-xl overflow-hidden border border-gray-100 bg-gray-50 aspect-[21/9] flex items-center justify-center">
                  {/* Replace src with your actual screenshot */}
                  <Image
                    src="/Grmps/transaction.png"
                    alt="BSC smart contract overview showing escrow contract on BscScan"
                    width={1200}
                    height={500}
                    className="w-full h-full object-cover"
                  />
                </a>
                <div className="mt-4">
                  <p className="text-normal font-medium text-black">Escrow Smart Contract on BscScan</p>
                  <p className="text-small font-regular text-gray-500 mt-1">
                    Each milestone deploys its own escrow contract via the EscrowFactory using gas-efficient minimal proxies. Every contract is publicly accessible on BscScan - you can inspect the code, verify transactions, and confirm that funds are handled exactly as the rules define.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════ WHY GRUMBUILD ═══════ */}
        <section className="py-20">
          <div className="container mx-auto px-4 lg:px-16">
            <div className="text-center mb-14">
              <h2 className="text-title font-bold text-black mb-3">Why Grumbuild?</h2>
              <p className="text-normal font-regular text-gray-500 max-w-2xl mx-auto">
                Traditional platforms hold your money and charge high fees. Grumbuild puts you in control with blockchain-powered escrow.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: "🔒",
                  title: "On-Chain Escrow",
                  desc: "Every milestone gets its own smart contract. Funds are locked until work is approved - no one can touch them, not even us.",
                },
                {
                  icon: "💰",
                  title: "Low Fees, Fair Split",
                  desc: "Just ~1% total platform fee, split between client and freelancer. The smart contract handles routing automatically at payout.",
                },
                {
                  icon: "⚡",
                  title: "Direct Wallet Payments",
                  desc: "No waiting for bank transfers. Freelancers withdraw directly from escrow to their wallet the moment work is approved.",
                },
                {
                  icon: "📋",
                  title: "Milestone Workflow",
                  desc: "Break projects into clear milestones with defined deliverables. Fund, deliver, approve, and pay - step by step.",
                },
                {
                  icon: "⚖️",
                  title: "Fair Dispute Resolution",
                  desc: "Disagreements are handled on-chain with an independent arbiter. Fee-based disputes discourage bad actors and resolve quickly.",
                },
                {
                  icon: "🎁",
                  title: "GRMPS Rewards",
                  desc: "Complete projects without disputes and earn GRMPS token rewards. Good collaboration is rewarded for both clients and freelancers.",
                },
              ].map((feature) => (
                <div
                  key={feature.title}
                  className="linear-border rounded-2xl p-0.25 hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="linear-border__inner bg-white rounded-[0.9375rem] p-7 h-full">
                    <span className="text-title mb-4 block">{feature.icon}</span>
                    <h3 className="text-large font-bold text-black mb-2">{feature.title}</h3>
                    <p className="text-small font-regular text-gray-500 leading-relaxed">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════ TESTIMONIALS ═══════ */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 lg:px-16">
            <h2 className="text-title font-bold text-black mb-12 md:text-left text-center">What people are saying</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map((t) => (
                <div
                  key={t.name}
                  className="bg-white rounded-2xl p-7 shadow-sm border border-gray-100 hover:shadow-lg hover:border-[#7E3FF2]/20 transition-all duration-300 flex flex-col"
                >
                  <p className="text-small font-regular text-gray-600 leading-relaxed flex-1 mb-6">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden">
                      <Image src={t.image} alt={t.name} width={40} height={40} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-small font-medium text-black">{t.name}</p>
                      <p className="text-tiny font-regular text-gray-400">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════ CTA ═══════ */}
        <section className="py-20">
          <div className="container mx-auto px-4 lg:px-16">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#2F3DF6] to-[#7E3FF2] px-8 py-16 lg:px-16 lg:py-20 text-center">
              {/* Decorative circles */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

              <div className="relative z-10">
                <h2 className="text-title lg:text-display font-bold text-white mb-4">
                  Ready to get started?
                </h2>
                <p className="text-light-large font-regular text-white/80 mb-8 max-w-xl mx-auto">
                  Join Grumbuild today and experience freelancing backed by blockchain transparency, fair payments, and on-chain escrow protection.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {loggedIn ? (
                    <>
                      <button
                        onClick={() => router.push("/dashboard")}
                        className="bg-white text-[#7E3FF2] text-normal font-medium rounded-lg px-8 py-3.5 transition-transform duration-150 hover:scale-105 shadow-lg cursor-pointer"
                      >
                        Go to Dashboard
                      </button>
                      <button
                        onClick={() => router.push("/faq")}
                        className="border border-white/40 text-white text-normal font-medium rounded-lg px-8 py-3.5 transition-all duration-150 hover:bg-white/10 hover:scale-105 cursor-pointer"
                      >
                        Learn More
                      </button>
                    </>
                    
                  ) : (
                    <>
                      <button
                        onClick={() => setLoginSignupModalOpen(true)}
                        className="bg-white text-[#7E3FF2] text-normal font-medium rounded-lg px-8 py-3.5 transition-transform duration-150 hover:scale-105 shadow-lg cursor-pointer"
                      >
                        Sign Up Free
                      </button>
                      <button
                        onClick={() => router.push("/faq")}
                        className="border border-white/40 text-white text-normal font-medium rounded-lg px-8 py-3.5 transition-all duration-150 hover:bg-white/10 hover:scale-105 cursor-pointer"
                      >
                        Learn More
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>

      <LoginSignupModal
        isOpen={loginSignupModalOpen}
        setIsOpen={setLoginSignupModalOpen}
        signedUp={loggedIn}
      />
    </>
  );
};

export default Home;
