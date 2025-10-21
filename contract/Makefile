# BSC Escrow Makefile
# Quick commands for common operations

-include .env

.PHONY: help build test clean deploy-testnet deploy-mainnet

help:
	@echo "BSC Escrow - Available Commands:"
	@echo ""
	@echo "  make build           - Compile contracts"
	@echo "  make test            - Run tests"
	@echo "  make test-gas        - Run tests with gas report"
	@echo "  make clean           - Clean build artifacts"
	@echo ""
	@echo "  make deploy-testnet  - Deploy to BSC testnet"
	@echo "  make deploy-mainnet  - Deploy to BSC mainnet"
	@echo ""
	@echo "  make setup-rewards   - Configure GRMPS rewards"
	@echo "  make fund-grmps      - Fund escrow with GRMPS"
	@echo ""
	@echo "  make buyer-fund      - Buyer funds escrow"
	@echo "  make vendor-deliver  - Vendor delivers work"
	@echo "  make buyer-approve   - Buyer approves work"
	@echo "  make vendor-withdraw - Vendor withdraws payment"
	@echo ""
	@echo "  make buyer-cancel    - Buyer cancels (before delivery)"
	@echo "  make dispute-init    - Initiate dispute"
	@echo "  make dispute-pay     - Pay dispute fee"
	@echo "  make dispute-resolve - Arbiter resolves dispute"
	@echo ""
	@echo "  make info            - View escrow info"
	@echo "  make balance         - Check address balances"

build:
	forge build

test:
	forge test -vv

test-gas:
	forge test --gas-report

clean:
	forge clean

# Deployment
deploy-testnet:
	@echo "Deploying to BSC Testnet..."
	forge script script/Deploy.s.sol:DeployScript \
		--rpc-url $(BSC_TESTNET_RPC_URL) \
		--broadcast \
		--verify \
		-vvvv

deploy-mainnet:
	@echo "⚠️  Deploying to BSC MAINNET ⚠️"
	@echo "Press Ctrl+C to cancel or Enter to continue..."
	@read confirm
	forge script script/Deploy.s.sol:DeployScript \
		--rpc-url $(BSC_MAINNET_RPC_URL) \
		--broadcast \
		--verify \
		--legacy \
		-vvvv

# Configuration
setup-rewards:
	@echo "Configuring GRMPS rewards..."
	forge script script/Interact.s.sol:ConfigureRewardsScript \
		--rpc-url $(BSC_TESTNET_RPC_URL) \
		--private-key $(ARBITER_PRIVATE_KEY) \
		--broadcast

fund-grmps:
	@echo "Funding escrow with GRMPS..."
	forge script script/Interact.s.sol:FundGRMPSScript \
		--rpc-url $(BSC_TESTNET_RPC_URL) \
		--broadcast

# Normal Flow
buyer-fund:
	@echo "Buyer funding escrow..."
	forge script script/Interact.s.sol:FundEscrowScript \
		--rpc-url $(BSC_TESTNET_RPC_URL) \
		--private-key $(BUYER_PRIVATE_KEY) \
		--broadcast

vendor-deliver:
	@echo "Vendor delivering work..."
	forge script script/Interact.s.sol:DeliverWorkScript \
		--rpc-url $(BSC_TESTNET_RPC_URL) \
		--private-key $(VENDOR_PRIVATE_KEY) \
		--broadcast

buyer-approve:
	@echo "Buyer approving work..."
	forge script script/Interact.s.sol:ApproveWorkScript \
		--rpc-url $(BSC_TESTNET_RPC_URL) \
		--private-key $(BUYER_PRIVATE_KEY) \
		--broadcast

vendor-withdraw:
	@echo "Vendor withdrawing..."
	forge script script/Interact.s.sol:WithdrawScript \
		--rpc-url $(BSC_TESTNET_RPC_URL) \
		--private-key $(VENDOR_PRIVATE_KEY) \
		--broadcast

# Cancellation
buyer-cancel:
	@echo "Buyer cancelling escrow..."
	forge script script/Interact.s.sol:CancelEscrowScript \
		--rpc-url $(BSC_TESTNET_RPC_URL) \
		--private-key $(BUYER_PRIVATE_KEY) \
		--broadcast

# Dispute Flow
dispute-init:
	@echo "Initiating dispute..."
	forge script script/Interact.s.sol:InitiateDisputeScript \
		--rpc-url $(BSC_TESTNET_RPC_URL) \
		--broadcast

dispute-pay:
	@echo "Paying dispute fee..."
	forge script script/Interact.s.sol:PayDisputeFeeScript \
		--rpc-url $(BSC_TESTNET_RPC_URL) \
		--broadcast

dispute-resolve:
	@echo "Resolving dispute..."
	forge script script/Interact.s.sol:ResolveDisputeScript \
		--rpc-url $(BSC_TESTNET_RPC_URL) \
		--private-key $(ARBITER_PRIVATE_KEY) \
		--broadcast

# Utilities
info:
	@echo "Fetching escrow info..."
	forge script script/Interact.s.sol:ViewEscrowInfoScript \
		--rpc-url $(BSC_TESTNET_RPC_URL)

balance:
	@echo "Buyer balance:"
	@cast balance $(BUYER_ADDRESS) --rpc-url $(BSC_TESTNET_RPC_URL)
	@echo "Vendor balance:"
	@cast balance $(VENDOR_ADDRESS) --rpc-url $(BSC_TESTNET_RPC_URL)
	@echo "Arbiter balance:"
	@cast balance $(ARBITER_ADDRESS) --rpc-url $(BSC_TESTNET_RPC_URL)
	@echo "Escrow balance:"
	@cast balance $(ESCROW_ADDRESS) --rpc-url $(BSC_TESTNET_RPC_URL)

verify:
	@echo "Verifying contract..."
	forge verify-contract \
		$(ESCROW_ADDRESS) \
		src/Escrow.sol:Escrow \
		--chain-id 97 \
		--etherscan-api-key $(BSCSCAN_API_KEY) \
		--watch

