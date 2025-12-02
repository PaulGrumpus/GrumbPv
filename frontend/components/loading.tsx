import Image from "next/image";

const Loading = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-white text-slate-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(251,146,60,0.45),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(56,189,248,0.32),transparent_60%)]" />
      <div className="absolute inset-0 bg-linear-to-b from-[#ffffff] via-[#fefefe] to-[#ffffff]" />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center gap-10 px-6 py-12 text-center">
        <div className="relative flex h-60 w-60 items-center justify-center rounded-full border border-slate-200 bg-white shadow-[0_25px_60px_rgba(251,146,60,0.18)]">
          <div className="pointer-events-none absolute inset-0 rounded-full border border-orange-200 blur-[1px] animate-[pulseGlow_2.5s_ease-in-out_infinite]" />
          <div className="relative flex h-40 w-40 items-center justify-center rounded-full bg-white overflow-hidden">
            <Image
              src="/Grmps/grmps.jpg"
              alt="Grmps logo"
              width={1000}
              height={1000}
              className="animate-[zoomInOut_2.8s_ease-in-out_infinite] drop-shadow-[0_20px_40px_rgba(14,116,144,0.25)] object-cover w-full h-full"
            />
          </div>
        </div>

        <div className="w-full max-w-xl space-y-3">
          <div className="relative h-2 rounded-full bg-slate-100 shadow-[inset_0_0_15px_rgba(15,23,42,0.05)] overflow-hidden">
            <div className="absolute inset-0 w-[180%] rounded-full bg-linear-to-r from-amber-300 via-sky-400 to-fuchsia-300 opacity-80 animate-[slideBar_1.9s_linear_infinite]" />
          </div>
        </div>
      </div>


      <style jsx global>{`
        @keyframes zoomInOut {
          0% {
            transform: scale(0.95);
          }
          50% {
            transform: scale(1.08) rotate(0.4deg);
          }
          100% {
            transform: scale(0.95);
          }
        }

        @keyframes pulseGlow {
          0% {
            opacity: 0.35;
            transform: scale(1);
          }
          50% {
            opacity: 0.85;
            transform: scale(1.12);
          }
          100% {
            opacity: 0.35;
            transform: scale(1);
          }
        }

        @keyframes slideBar {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(0%);
          }
        }
      `}</style>
    </div>
  );
};

export default Loading;