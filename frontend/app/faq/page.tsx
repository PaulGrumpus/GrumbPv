'use client';

import { useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';

interface FAQItem {
  question: string;
  answer: React.ReactNode;
}

interface FAQSection {
  title: string;
  items: FAQItem[];
}

const AccordionItem = ({ item, isOpen, onToggle }: { item: FAQItem; isOpen: boolean; onToggle: () => void }) => (
  <div className="border-b border-gray-200 last:border-b-0">
    <button
      onClick={onToggle}
      className="flex w-full items-center justify-between py-5 px-1 text-left cursor-pointer group"
      aria-expanded={isOpen}
    >
      <span className="text-normal font-medium text-black group-hover:text-[#7E3FF2] transition-colors pr-4">
        {item.question}
      </span>
      <ChevronDownIcon
        className={`w-5 h-5 text-[#7E3FF2] shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
      />
    </button>
    <div
      className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[2000px] opacity-100 pb-5' : 'max-h-0 opacity-0'}`}
    >
      <div className="px-1 text-small font-regular text-gray-600 leading-relaxed space-y-3">
        {item.answer}
      </div>
    </div>
  </div>
);

const FAQSection = ({ section, openIndex, onToggle }: { section: FAQSection; openIndex: number | null; onToggle: (i: number) => void }) => (
  <div className="mb-10">
    <h2 className="text-subtitle font-bold text-[#7E3FF2] mb-4">{section.title}</h2>
    <div className="linear-border rounded-xl p-0.25">
      <div className="linear-border__inner bg-white rounded-[0.6875rem] px-5 lg:px-8">
        {section.items.map((item, i) => (
          <AccordionItem key={i} item={item} isOpen={openIndex === i} onToggle={() => onToggle(i)} />
        ))}
      </div>
    </div>
  </div>
);

const faqSections: FAQSection[] = [
  {
    title: '1. What is Grumbuild?',
    items: [
      {
        question: 'What is Grumbuild?',
        answer: (
          <>
            <p>Grumbuild is a decentralized freelance marketplace built on BNB Smart Chain (BSC), designed to bring trust and transparency to professional collaboration. It connects clients and freelancers through a structured workflow backed by on-chain escrow — meaning payments are governed by smart contracts, not held by a third party.</p>
            <p className="mt-2">On Grumbuild, you can:</p>
            <ul className="list-disc pl-5 space-y-1 mt-1">
              <li>Post jobs with defined milestones and hire verified freelancers (as a client)</li>
              <li>Create service gigs, apply to open jobs, and deliver work with on-chain proof via IPFS (as a freelancer)</li>
              <li>Negotiate terms, agree on milestone requirements, and formalize agreements through structured reference documents</li>
              <li>Fund and release payments securely through individual escrow contracts — one per milestone — deployed directly on BSC</li>
              <li>Earn GRMPS token rewards upon successful, dispute-free project completion</li>
            </ul>
            <p className="mt-2">Every payment on Grumbuild is protected by a dedicated smart contract. Funds are only released when both parties fulfill their obligations, making the process fair, verifiable, and fully transparent on-chain.</p>
          </>
        ),
      },
      {
        question: 'What makes Grumbuild different?',
        answer: (
          <>
            <p>Instead of holding money in a company bank account, Grumbuild uses smart contracts. That means:</p>
            <ul className="list-none space-y-1 pl-1">
              <li>✅ Funds move directly between wallets</li>
              <li>✅ Escrow rules are enforced by code</li>
              <li>✅ The platform never &quot;touches&quot; your money</li>
              <li>✅ Everything is transparent and verifiable on-chain</li>
            </ul>
            <p className="mt-2">In simple terms: the backend helps prepare transactions, but your wallet always stays in control.</p>
          </>
        ),
      },
    ],
  },
  {
    title: '2. Accounts, Profiles & Wallets',
    items: [
      {
        question: 'How do I sign up?',
        answer: (
          <ol className="list-decimal pl-5 space-y-1">
            <li>Visit Grumbuild.com and click Sign Up</li>
            <li>Enter your email + password</li>
            <li>Add your basic profile details</li>
            <li>Confirm your email (if prompted)</li>
            <li>(Recommended) Connect your crypto wallet so we can link it to your account</li>
          </ol>
        ),
      },
      {
        question: 'How do I log in?',
        answer: (
          <ol className="list-decimal pl-5 space-y-1">
            <li>Click Log In</li>
            <li>Enter your email + password</li>
            <li>Once you&apos;re in, connect your wallet (if it&apos;s not already connected)</li>
            <li>You&apos;ll be taken to your dashboard where you can view your jobs, gigs, applications, milestones, notifications, and chats</li>
          </ol>
        ),
      },
      {
        question: 'How do I update my profile?',
        answer: (
          <>
            <p>Open Profile / Account Settings and update things like display name, bio and skills, location, and profile photo. Your updated profile will show everywhere - job posts, gig listings, chat messages, and proposals.</p>
          </>
        ),
      },
      {
        question: 'Why do I need to "Connect Wallet"?',
        answer: (
          <>
            <p>Because Grumbuild uses blockchain escrow, your wallet becomes your identity for payments. Your wallet address is used as your client wallet (to fund escrow milestones) or freelancer wallet (to receive payouts).</p>
            <p className="mt-2">When you do important actions like funding escrow or withdrawing money:</p>
            <ol className="list-decimal pl-5 space-y-1 mt-1">
              <li>The backend prepares the transaction data</li>
              <li>Your wallet (MetaMask, etc.) asks for approval</li>
              <li>You sign it</li>
              <li>It goes on-chain</li>
            </ol>
            <ul className="list-none space-y-1 pl-1 mt-2">
              <li>✅ You stay in control</li>
              <li>✅ The platform never holds your funds</li>
              <li>✅ Escrow rules apply automatically</li>
            </ul>
          </>
        ),
      },
    ],
  },
  {
    title: '3. Jobs & Gigs',
    items: [
      {
        question: 'How do I post a job? (Clients)',
        answer: (
          <>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Go to your dashboard → click Create Job</li>
              <li>Fill out title, description, budget range (in BNB), deadline, tags/category, and optional cover image</li>
              <li>Submit</li>
            </ol>
            <p className="mt-2">Your job is saved, you receive a JOB_POSTED notification, and your job appears publicly so freelancers can apply.</p>
          </>
        ),
      },
      {
        question: 'How do I create a gig? (Freelancers)',
        answer: (
          <>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Go to Create Gig</li>
              <li>Add title, what you do, tags, budget range (BNB), and optional images</li>
              <li>Save</li>
            </ol>
            <p className="mt-2">Once posted, clients can discover you in gig search, message you, and propose work. A gig can turn into a job + milestones + escrow anytime.</p>
          </>
        ),
      },
      {
        question: 'How do I apply to a job?',
        answer: (
          <>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Open a job listing</li>
              <li>Click Apply / Bid</li>
              <li>Submit your proposal/cover letter, your price (BNB), and estimated timeline</li>
            </ol>
            <p className="mt-2">After you apply, you get a BID_SENT notification, the client gets BID_RECEIVED, and you can chat and finalize agreement details.</p>
          </>
        ),
      },
    ],
  },
  {
    title: '4. Requirement / Reference Documents',
    items: [
      {
        question: 'What are requirement documents?',
        answer: (
          <p>Think of these as your project agreement - but structured and easy to reference. They typically include what you&apos;re building/delivering, what is not included, timeline and key milestones, budget expectations, and acceptance criteria (how the client approves work). This helps prevent misunderstandings and protects both sides.</p>
        ),
      },
      {
        question: 'How do requirement docs work with clients & freelancers?',
        answer: (
          <>
            <p>Either side can propose a document, edit it, and request changes. Once it&apos;s ready, both sides confirm the final version.</p>
            <ul className="list-none space-y-1 pl-1 mt-2">
              <li>✅ The system tracks confirmation rounds</li>
              <li>✅ Notifications are triggered for creation and confirmation</li>
              <li>✅ The confirmed document becomes the &quot;source of truth&quot; for milestones and disputes</li>
            </ul>
          </>
        ),
      },
    ],
  },
  {
    title: '5. Escrow, Milestones & Fees',
    items: [
      {
        question: 'How does escrow deployment work?',
        answer: (
          <>
            <p>Each milestone gets its own dedicated escrow contract - the &quot;vault&quot; for that milestone&apos;s payment. When a milestone is ready to be funded:</p>
            <ol className="list-decimal pl-5 space-y-1 mt-1">
              <li>Backend loads platform settings (fee recipient, arbiter, fee bps)</li>
              <li>Reads milestone info (client wallet, freelancer wallet, amount, due date)</li>
              <li>Calls EscrowFactory.createEscrow()</li>
              <li>Factory deploys a gas-efficient clone (minimal proxy)</li>
              <li>Escrow address is stored + linked to the milestone</li>
            </ol>
          </>
        ),
      },
      {
        question: 'What is the milestone lifecycle?',
        answer: (
          <ol className="list-decimal pl-5 space-y-1">
            <li>Created - you agree on it in the job/requirements</li>
            <li>Escrow deployed - contract is created for that milestone</li>
            <li>Funded - client funds escrow on-chain</li>
            <li>Delivered - freelancer submits work + CID</li>
            <li>Approved - client approves the exact delivered CID</li>
            <li>Withdrawn - freelancer withdraws payout from escrow</li>
            <li>Completed - milestone marked complete</li>
          </ol>
        ),
      },
      {
        question: 'How does "Fund Escrow" work?',
        answer: (
          <ol className="list-decimal pl-5 space-y-1">
            <li>Client clicks Fund Escrow</li>
            <li>Backend prepares transaction (to = escrowAddress, data = Escrow.fund(), value = projectAmount + buyerFee)</li>
            <li>Client&apos;s wallet signs and sends on BSC</li>
            <li>Contract marks milestone as funded + holds funds safely</li>
            <li>Backend updates milestone status + sends MILESTONE_FUNDED notification</li>
          </ol>
        ),
      },
      {
        question: 'How do platform fees work?',
        answer: (
          <>
            <p>Fees are enforced by smart contracts and stored in basis points (bps). For example, 100 bps = 1% total fee, often split like 0.5% buyer fee and 0.5% freelancer fee.</p>
            <p className="mt-2">On payout, the freelancer receives the project amount minus vendor fee, and the platform receives buyer fee + vendor fee.</p>
            <p className="mt-2 italic text-gray-500">&quot;Grumbuild charges about 1% total, split between client and freelancer, and the escrow contract automatically routes it during payout.&quot;</p>
          </>
        ),
      },
    ],
  },
  {
    title: '6. Work Delivery & Results (IPFS)',
    items: [
      {
        question: 'What happens when the freelancer delivers work?',
        answer: (
          <>
            <p>When the freelancer clicks Deliver Work, they can either upload a file (up to 100MB) or paste an existing IPFS CID. If they upload:</p>
            <ol className="list-decimal pl-5 space-y-1 mt-1">
              <li>Backend uploads to Pinata (IPFS)</li>
              <li>Receives CID + calculates a content hash</li>
              <li>Builds transaction: Escrow.deliver(cid, contentHash)</li>
              <li>Freelancer signs it in their wallet</li>
            </ol>
            <p className="mt-2">The escrow contract stores the CID and marks the milestone as Delivered.</p>
          </>
        ),
      },
      {
        question: 'How does approval work?',
        answer: (
          <ol className="list-decimal pl-5 space-y-1">
            <li>Client reviews the delivered CID/files</li>
            <li>Clicks Approve Work</li>
            <li>Backend prepares approve(cid) transaction</li>
            <li>CID must match exactly what was delivered</li>
            <li>Escrow moves into Releasable state and emits an on-chain event</li>
          </ol>
        ),
      },
      {
        question: 'How does withdrawal work?',
        answer: (
          <ol className="list-decimal pl-5 space-y-1">
            <li>Click Withdraw</li>
            <li>Backend prepares withdraw() transaction</li>
            <li>Freelancer signs on-chain</li>
            <li>Contract pays: platform fee recipient, freelancer payout amount, and optional reward distribution (GRMPS) if enabled</li>
          </ol>
        ),
      },
      {
        question: 'Why is it important to always use the same wallet?',
        answer: (
          <>
            <p>Every escrow contract on Grumbuild is tied to specific wallet addresses - one for the client and one for the freelancer. These addresses are permanently written into the contract at the time of creation and cannot be changed afterwards. This means:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>As a client, the wallet you use to fund the escrow must be the same wallet that was registered on your Grumbuild account when the milestone was created. If you try to fund from a different wallet, the smart contract will reject the transaction because the sender address won&apos;t match the authorized buyer address.</li>
              <li>As a freelancer, the wallet linked to your account is the one that will receive the payout when you withdraw. If you switch wallets or connect a different address, you won&apos;t be able to call the deliver or withdraw functions - the contract only recognizes the original vendor address.</li>
              <li>Grumbuild also performs a wallet verification check before allowing sensitive actions. When you connect your wallet, the platform compares it against the address saved on your profile. If there&apos;s a mismatch, you&apos;ll be blocked from performing on-chain operations like funding, delivering, approving, or withdrawing.</li>
            </ul>
            <p className="mt-3">In short: always connect the same wallet you used when you signed up or when the milestone was created. Switching wallets mid-project can lock you out of your own escrow, and there is no way to reassign wallet addresses on an existing contract. If you need to change your wallet, make sure to do it before any new milestones are created - and keep in mind that existing milestones will still be bound to the original address.</p>
          </>
        ),
      },
      {
        question: 'What should I know about disputes during delivery?',
        answer: (
          <>
            <p>Disputes can arise at different stages of the delivery process, and understanding how they interact with the escrow lifecycle is important for protecting yourself:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>A client can initiate a dispute while the escrow is in the Funded or Delivered state. This is typically done when the client believes the work is incomplete, doesn&apos;t meet the agreed requirements, or hasn&apos;t been delivered at all despite the deadline passing.</li>
              <li>A freelancer can initiate a dispute while the escrow is in the Delivered state. This usually happens when the client is unresponsive, refuses to approve completed work without valid reason, or is deliberately stalling to avoid payment.</li>
              <li>Once a dispute is started, the escrow enters a locked state - neither party can approve, withdraw, or make further deliveries until the dispute is resolved. This protects both sides from any unilateral actions while the disagreement is being handled.</li>
              <li>The party that initiates the dispute must pay a dispute fee upfront. However, when the client initiates or responds to a dispute, their fee is automatically deducted from the funds already held in escrow — so the client does not need to make a separate payment. The freelancer, on the other hand, pays their dispute fee directly from their wallet. The other party then has a limited window to respond: 72 hours if the freelancer initiated, or 48 hours if the client initiated. If the responding party fails to pay their dispute fee within this window, the initiator can call a default resolution and automatically win the dispute.</li>
              <li>If both parties pay their dispute fees, an independent arbiter reviews the case and makes a binding decision. The arbiter can resolve in favor of either the client (funds returned) or the freelancer (funds released). The losing party&apos;s dispute fee is split between the arbiter and the platform fee recipient as compensation for the resolution service.</li>
              <li>To minimize the risk of disputes, both parties should use the requirement documents feature to clearly define deliverables, acceptance criteria, and timelines before work begins. A well-documented agreement serves as the &quot;source of truth&quot; and makes arbiter decisions faster and more predictable.</li>
            </ul>
            <p className="mt-3">The dispute system is designed to be fair but also to discourage frivolous claims - the fee structure ensures that both parties have skin in the game, and the deadline mechanism prevents anyone from stalling indefinitely.</p>
          </>
        ),
      },
    ],
  },
  {
    title: '7. Disputes',
    items: [
      {
        question: 'What is a dispute?',
        answer: (
          <p>A dispute is a protected way to resolve disagreements - like when a client feels work is incomplete, a freelancer feels the client is delaying unfairly, or either side wants a neutral resolution. Disputes are handled on-chain using an arbiter address, a dispute fee, and deadlines (so nobody can stall forever).</p>
        ),
      },
      {
        question: 'How does a dispute work?',
        answer: (
          <>
            <p className="font-medium">Step 1: Start dispute</p>
            <p>Client can start while Funded or Delivered. Freelancer can start while Delivered. The initiator pays a dispute fee. Deadlines apply: if freelancer starts → client has 72 hours to respond; if client starts → freelancer has 48 hours to pay fee and respond.</p>
            <p className="font-medium mt-3">Step 2: If the other side doesn&apos;t pay in time</p>
            <p>Initiator can call resolveDisputeByDefault() and wins by default.</p>
            <p className="font-medium mt-3">Step 3: If both pay</p>
            <p>Arbiter decides: resolveToVendor() (freelancer wins) or resolveToBuyer() (client wins). The losing dispute fee gets split between the arbiter + platform fee recipient.</p>
            <p className="mt-2 italic text-gray-500">This structure discourages fake disputes and encourages fast resolution.</p>
          </>
        ),
      },
    ],
  },
  {
    title: '8. Notifications',
    items: [
      {
        question: 'What in-app notifications will I receive?',
        answer: (
          <p>Grumbuild keeps you updated in real time with a notification center. You&apos;ll see alerts for job and gig activity, bids sent/received, requirement docs created/confirmed, milestone funded/delivered/approved/withdrawn, dispute started/resolved, and chat messages and conversation updates. Real-time delivery uses WebSockets and private user channels.</p>
        ),
      },
      {
        question: 'Are there email notifications?',
        answer: (
          <p>If email is configured, important actions can also trigger emails (welcome, milestone updates, bid updates, etc.). Email failures won&apos;t break anything - you&apos;ll still get in-app notifications.</p>
        ),
      },
    ],
  },
  {
    title: '9. Chat & Collaboration',
    items: [
      {
        question: 'How does chat work?',
        answer: (
          <p>Chat is built to keep everything connected to the actual work. Conversations can exist for jobs, gigs, and applications. Messages are saved and tied to context. Attachments can be uploaded via the platform upload API. Notifications fire on message receipt and conversation updates. Your chats aren&apos;t floating randomly - they always relate to a job, bid, or milestone.</p>
        ),
      },
    ],
  },
  {
    title: '10. File Upload Limits',
    items: [
      {
        question: 'What are the upload limits?',
        answer: (
          <>
            <p className="font-medium">General uploads (avatars, gig images, job cover images):</p>
            <p>Image-only MIME types, limited by platform constants.</p>
            <p className="font-medium mt-2">Work delivery uploads (milestone delivery):</p>
            <p>Up to 100MB per file. Supports common formats (PDF, docs, images, video, audio, etc.).</p>
          </>
        ),
      },
    ],
  },
  {
    title: '11. Blockchain & Currency',
    items: [
      {
        question: 'Which chain does Grumbuild use?',
        answer: (
          <p>Grumbuild is built for BNB Smart Chain (BSC). The default dev config uses BSC Testnet (CHAIN_ID = 97). It&apos;s designed to move to mainnet by switching RPC + chainId configs.</p>
        ),
      },
      {
        question: 'What currency is used?',
        answer: (
          <p>Right now, Grumbuild uses BNB only - budgets, milestones, fees, and payouts are all in BNB. The system is designed so tokens like USDT/USDC (BEP-20) can be added later.</p>
        ),
      },
    ],
  },
  {
    title: '12. Fees & Rewards',
    items: [
      {
        question: 'How are fees configured?',
        answer: (
          <p>Fees are controlled in two places: smart contract parameters (buyerFeeBps, vendorFeeBps) and backend system settings (mirrors these configs). They are enforced automatically at payout.</p>
        ),
      },
      {
        question: 'Are there rewards?',
        answer: (
          <>
            <p>Projects that do not have disputes are entitled to the rewards under the following considerations:</p>
            <ul className="list-disc pl-5 space-y-1 mt-1">
              <li>The distributor having token balance</li>
              <li>Proper allowances being set</li>
            </ul>
          </>
        ),
      },
    ],
  },
  {
    title: '13. Support & Contact',
    items: [
      {
        question: 'How do I get help?',
        answer: (
          <p>Use the Support / Contact page inside the app to send a message to the team. Your request is stored and forwarded to the configured support inbox, and we&apos;ll reply with next steps. Typical reasons include login or account issues, job/gig/milestone questions, escrow or dispute questions, and upload problems.</p>
        ),
      },
    ],
  },
];

const FAQPage = () => {
  const [openItems, setOpenItems] = useState<Record<number, number | null>>({});

  const handleToggle = (sectionIndex: number, itemIndex: number) => {
    setOpenItems((prev) => ({
      ...prev,
      [sectionIndex]: prev[sectionIndex] === itemIndex ? null : itemIndex,
    }));
  };

  return (
    <div className="bg-white min-h-screen pt-28 pb-20">
      <div className="container mx-auto px-4 lg:px-16 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-14">
          <h1 className="text-display font-bold text-[#7E3FF2] mb-4">Help Center & FAQ</h1>
          <p className="text-light-large font-regular text-gray-500 max-w-2xl mx-auto">
            Welcome to Grumbuild 👋 - a freelance marketplace where payments are protected by on-chain milestone escrow on BNB Smart Chain.
          </p>
        </div>

        {/* FAQ Sections */}
        {faqSections.map((section, sectionIndex) => (
          <FAQSection
            key={sectionIndex}
            section={section}
            openIndex={openItems[sectionIndex] ?? null}
            onToggle={(itemIndex) => handleToggle(sectionIndex, itemIndex)}
          />
        ))}

        {/* Bottom CTA */}
        <div className="text-center mt-14 py-12 px-8">
          <p className="text-subtitle font-bold text-black mb-3">Can&apos;t find what you&apos;re looking for?</p>
          <p className="text-normal font-regular text-gray-600 mb-6 max-w-xl mx-auto">
            Our support team is here to help. Whether you have a question about escrow, milestones, disputes, or anything else - send us a message and we&apos;ll get back to you promptly.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
