# USDT / USDC (BEP-20) escrow scripts

Scripts to test the BEP-20 token workflow: create escrow with USDT or USDC, fund (approve + fund), deliver, approve, withdraw. Dispute flows (initiate and pay fee) are also supported.

## Prerequisites

- `.env` in `web3/` with:
  - `FACTORY_ADDRESS`, `BUYER_ADDRESS`, `VENDOR_ADDRESS`, `FEE_RECIPIENT_ADDRESS`
  - `BUYER_PRIVATE_KEY`, `VENDOR_PRIVATE_KEY`
  - `DEPLOYER_PRIVATE_KEY` or `PRIVATE_KEY` (for creating escrows)
  - `BSC_TESTNET_RPC_URL` (or default)
- On BSC Testnet, buyer must have testnet USDT or USDC to fund. Use a faucet if needed.

## Token addresses (BSC Testnet)

| Token | Address |
|-------|---------|
| USDT  | `0x337610d27c682E347C9cD60BD4b3b107C9d34dDd` |
| USDC  | `0x64544969ed7EBf083679233325356EbE738930` |

Set `PAYMENT_TOKEN=USDT` or `PAYMENT_TOKEN=USDC` (or the contract address).

## Scripts

| Script | Description |
|--------|-------------|
| `createEscrowBep20.js` | Create escrow with BEP-20 payment token. Sets project amount in token units (e.g. 100 USDT = 100e6). |
| `approveAndFundBep20.js` | Buyer: (1) Approve escrow to spend token, (2) Call `fund()` with no BNB. |
| `deliver` | Use main `npm run deliver` (same for BNB and BEP-20). |
| `approve` | Use main `npm run approve` (buyer approves CID). |
| `withdrawBep20.js` | Vendor withdraws; shows token balance before/after. |
| `disputeInitBep20.js` | Initiate dispute. Buyer uses reserved fee; vendor must approve then call. |
| `disputePayBep20.js` | Counterparty (vendor) pays dispute fee: approve then `payDisputeFee()`. |
| `getInfoBep20.js` | Show escrow info with token symbol and formatted amounts. |
| `fullFlowTest.js` | End-to-end: create → fund → deliver → approve → withdraw. |

## Usage

**1. Create escrow (USDT, 100 units)**

```bash
cd web3
PAYMENT_TOKEN=USDT AMOUNT=100 node scripts/usdt-usdc/createEscrowBep20.js
# Set ESCROW_ADDRESS in .env from output
```

**2. Buyer funds (approve + fund)**

```bash
ESCROW_ADDRESS=0x... node scripts/usdt-usdc/approveAndFundBep20.js
```

**3. Vendor delivers**

```bash
IPFS_CID=QmYourCID CONTENT_HASH=0x... npm run deliver
```

**4. Buyer approves**

```bash
IPFS_CID=QmYourCID npm run approve
```

**5. Vendor withdraws**

```bash
node scripts/usdt-usdc/withdrawBep20.js
```

**Full flow test (one shot)**

```bash
PAYMENT_TOKEN=USDT AMOUNT=10 node scripts/usdt-usdc/fullFlowTest.js
```

Requires buyer to have at least ~10.05 USDT (10 + 0.5% fee) on testnet.

## NPM scripts

From `web3/package.json` you can run:

- `npm run usdt:create` — create BEP-20 escrow
- `npm run usdt:fund` — buyer approve + fund
- `npm run usdt:withdraw` — vendor withdraw (BEP-20)
- `npm run usdt:info` — escrow info with token amounts
- `npm run usdt:dispute-init` — initiate dispute (BEP-20)
- `npm run usdt:dispute-pay` — pay dispute fee (BEP-20)
- `npm run usdt:full-flow` — full flow test
