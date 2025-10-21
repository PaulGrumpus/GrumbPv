/**
 * Example: Frontend Integration with MetaMask
 * 
 * This file shows how to integrate the escrow contract
 * into a React/Next.js/Vue frontend application
 */

import { ethers } from 'ethers';

// Import ABI
import escrowABI from '../abi/Escrow.json';

const ESCROW_ADDRESS = '0x4035920Dee6bb6DF73e68ED06b5666ca28BD247B';

// ============================================
// 1. Connect to MetaMask
// ============================================

export async function connectWallet() {
  if (!window.ethereum) {
    throw new Error('MetaMask not installed');
  }
  
  // Request account access
  const accounts = await window.ethereum.request({ 
    method: 'eth_requestAccounts' 
  });
  
  // Create provider and signer
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  
  console.log('Connected:', await signer.getAddress());
  
  return { provider, signer };
}

// ============================================
// 2. Switch to BSC Testnet
// ============================================

export async function switchToBSCTestnet() {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x61' }], // 97 in hex
    });
  } catch (switchError) {
    // Chain not added, add it
    if (switchError.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: '0x61',
          chainName: 'BSC Testnet',
          nativeCurrency: {
            name: 'BNB',
            symbol: 'BNB',
            decimals: 18
          },
          rpcUrls: ['https://bsc-testnet-rpc.publicnode.com/'],
          blockExplorerUrls: ['https://testnet.bscscan.com/']
        }]
      });
    } else {
      throw switchError;
    }
  }
}

// ============================================
// 3. Contract Interactions
// ============================================

export async function getEscrowInfo(provider) {
  const escrow = new ethers.Contract(
    ESCROW_ADDRESS,
    escrowABI,
    provider
  );
  
  const info = await escrow.getAllInfo();
  
  return {
    buyer: info.buyer,
    vendor: info.vendor,
    arbiter: info.arbiter,
    feeRecipient: info.feeRecipient,
    amount: ethers.formatEther(info.amount),
    buyerFeeReserve: ethers.formatEther(info.buyerFeeReserve),
    state: info.state,
    stateName: ['Unfunded', 'Funded', 'Delivered', 'Disputed', 'Releasable', 'Paid', 'Refunded'][info.state],
    buyerApproved: info.buyerApproved,
    vendorApproved: info.vendorApproved,
    proposedCID: info.proposedCID,
    finalizedCID: info.cid,
    deadline: new Date(Number(info.deadline) * 1000),
    isReleasable: await escrow.isReleasable()
  };
}

export async function fundEscrow(signer, amountBNB) {
  const escrow = new ethers.Contract(ESCROW_ADDRESS, escrowABI, signer);
  
  const tx = await escrow.fund({ 
    value: ethers.parseEther(amountBNB.toString())
  });
  
  return await tx.wait();
}

export async function deliverWork(signer, cid, contentHash = ethers.ZeroHash) {
  const escrow = new ethers.Contract(ESCROW_ADDRESS, escrowABI, signer);
  
  const tx = await escrow.deliver(cid, contentHash);
  return await tx.wait();
}

export async function approveWork(signer, cid) {
  const escrow = new ethers.Contract(ESCROW_ADDRESS, escrowABI, signer);
  
  const tx = await escrow.approve(cid);
  return await tx.wait();
}

export async function withdrawPayment(signer) {
  const escrow = new ethers.Contract(ESCROW_ADDRESS, escrowABI, signer);
  
  const tx = await escrow.withdraw();
  return await tx.wait();
}

export async function cancelEscrow(signer) {
  const escrow = new ethers.Contract(ESCROW_ADDRESS, escrowABI, signer);
  
  const tx = await escrow.cancel();
  return await tx.wait();
}

// ============================================
// 4. Listen to Events
// ============================================

export function subscribeToEvents(provider, callbacks) {
  const escrow = new ethers.Contract(ESCROW_ADDRESS, escrowABI, provider);
  
  escrow.on('Funded', (buyer, amount, buyerFee, event) => {
    if (callbacks.onFunded) {
      callbacks.onFunded({
        buyer,
        amount: ethers.formatEther(amount),
        buyerFee: ethers.formatEther(buyerFee),
        event
      });
    }
  });
  
  escrow.on('Delivered', (vendor, cid, contentHash, event) => {
    if (callbacks.onDelivered) {
      callbacks.onDelivered({ vendor, cid, contentHash, event });
    }
  });
  
  escrow.on('Approved', (buyer, cid, event) => {
    if (callbacks.onApproved) {
      callbacks.onApproved({ buyer, cid, event });
    }
  });
  
  escrow.on('Withdrawn', (to, amount, event) => {
    if (callbacks.onWithdrawn) {
      callbacks.onWithdrawn({
        to,
        amount: ethers.formatEther(amount),
        event
      });
    }
  });
  
  escrow.on('RewardPaid', (to, amount, reason, event) => {
    if (callbacks.onRewardPaid) {
      callbacks.onRewardPaid({
        to,
        amount: ethers.formatEther(amount),
        reason,
        event
      });
    }
  });
  
  return escrow; // Return to allow unsubscribing later
}

// ============================================
// 5. React Hook Example
// ============================================

export const useEscrow = () => {
  const [escrowInfo, setEscrowInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const loadInfo = async () => {
    setLoading(true);
    try {
      const { provider } = await connectWallet();
      const info = await getEscrowInfo(provider);
      setEscrowInfo(info);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  const fund = async (amount) => {
    const { signer } = await connectWallet();
    await fundEscrow(signer, amount);
    await loadInfo();
  };
  
  const deliver = async (cid) => {
    const { signer } = await connectWallet();
    await deliverWork(signer, cid);
    await loadInfo();
  };
  
  const approve = async (cid) => {
    const { signer } = await connectWallet();
    await approveWork(signer, cid);
    await loadInfo();
  };
  
  const withdraw = async () => {
    const { signer } = await connectWallet();
    await withdrawPayment(signer);
    await loadInfo();
  };
  
  return {
    escrowInfo,
    loading,
    loadInfo,
    fund,
    deliver,
    approve,
    withdraw
  };
};

