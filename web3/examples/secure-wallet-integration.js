/**
 * Secure Wallet Integration Example
 * 
 * This example shows how to properly integrate with user wallets
 * without exposing private keys in your application.
 */

import { ethers } from 'ethers';
import { CONFIG } from '../config.js';

/**
 * Connect to user's wallet (MetaMask, WalletConnect, etc.)
 * This is the secure way to handle user authentication
 */
export async function connectUserWallet() {
  if (typeof window === 'undefined') {
    throw new Error('This function should only be called in a browser environment');
  }

  if (typeof window.ethereum === 'undefined') {
    throw new Error('MetaMask or compatible wallet not found');
  }

  try {
    // Request account access
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts'
    });

    // Create provider and signer
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();

    console.log('Connected wallet:', address);
    return { provider, signer, address };
  } catch (error) {
    console.error('Failed to connect wallet:', error);
    throw error;
  }
}

/**
 * Create an escrow using the connected user wallet
 * This is how users should interact with the system
 */
export async function createEscrowWithUserWallet(userSigner, escrowParams) {
  const factory = new ethers.Contract(
    CONFIG.factoryAddress,
    CONFIG.factoryABI,
    userSigner
  );

  try {
    const tx = await factory.createEscrow(
      escrowParams.jobId,
      escrowParams.buyer,
      escrowParams.vendor,
      escrowParams.arbiter,
      escrowParams.feeRecipient,
      escrowParams.feeBps,
      escrowParams.paymentToken,
      escrowParams.amount,
      escrowParams.deadline,
      escrowParams.buyerFeeBps,
      escrowParams.vendorFeeBps,
      escrowParams.disputeFeeBps,
      escrowParams.rewardRateBps
    );

    console.log('Transaction sent:', tx.hash);
    const receipt = await tx.wait();
    console.log('Transaction confirmed:', receipt.hash);

    return receipt;
  } catch (error) {
    console.error('Failed to create escrow:', error);
    throw error;
  }
}

/**
 * Fund an escrow using the connected user wallet
 */
export async function fundEscrowWithUserWallet(userSigner, escrowAddress, amount) {
  const escrow = new ethers.Contract(
    escrowAddress,
    CONFIG.escrowABI,
    userSigner
  );

  try {
    const tx = await escrow.fund({ 
      value: ethers.parseEther(amount.toString()) 
    });

    console.log('Funding transaction sent:', tx.hash);
    const receipt = await tx.wait();
    console.log('Funding confirmed:', receipt.hash);

    return receipt;
  } catch (error) {
    console.error('Failed to fund escrow:', error);
    throw error;
  }
}

/**
 * Example of how to use this in a React component
 */
export const ReactWalletExample = `
import React, { useState, useEffect } from 'react';
import { connectUserWallet, createEscrowWithUserWallet } from './secure-wallet-integration.js';

function EscrowCreator() {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(false);

  const connectWallet = async () => {
    try {
      const walletData = await connectUserWallet();
      setWallet(walletData);
    } catch (error) {
      alert('Failed to connect wallet: ' + error.message);
    }
  };

  const createEscrow = async () => {
    if (!wallet) {
      alert('Please connect your wallet first');
      return;
    }

    setLoading(true);
    try {
      const escrowParams = {
        jobId: ethers.keccak256(ethers.toUtf8Bytes('job-' + Date.now())),
        buyer: wallet.address,
        vendor: '0x...', // Get from form
        arbiter: '0x...', // Get from form
        feeRecipient: '0x...',
        feeBps: 100,
        paymentToken: ethers.ZeroAddress,
        amount: ethers.parseEther('1.0'),
        deadline: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
        buyerFeeBps: 50,
        vendorFeeBps: 50,
        disputeFeeBps: 50,
        rewardRateBps: 25
      };

      await createEscrowWithUserWallet(wallet.signer, escrowParams);
      alert('Escrow created successfully!');
    } catch (error) {
      alert('Failed to create escrow: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {!wallet ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <div>
          <p>Connected: {wallet.address}</p>
          <button onClick={createEscrow} disabled={loading}>
            {loading ? 'Creating...' : 'Create Escrow'}
          </button>
        </div>
      )}
    </div>
  );
}
`;

/**
 * Example for Node.js backend (using secure key management)
 */
export const BackendSecureExample = `
// For backend operations that require private keys
// Use secure key management services

import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

async function getSecurePrivateKey() {
  const client = new SecretManagerServiceClient();
  const [version] = await client.accessSecretVersion({
    name: 'projects/your-project/secrets/deployer-key/versions/latest',
  });
  return version.payload.data.toString();
}

async function deployContract() {
  const privateKey = await getSecurePrivateKey();
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  const wallet = new ethers.Wallet(privateKey, provider);
  
  // Deploy contract using secure key
  const factory = await ethers.deployContract('EscrowFactory', [], wallet);
  console.log('Contract deployed:', factory.target);
}
`;
