import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'BSC Escrow API',
      version: '1.0.0',
      description: 'RESTful API for BSC Escrow smart contracts with GRMPS rewards',
      contact: {
        name: 'API Support',
      },
      license: {
        name: 'MIT',
      },
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:5000',
        description: 'Development server',
      },
      {
        url: 'https://api.bsc-escrow.com',
        description: 'Production server (when deployed)',
      },
    ],
    components: {
      schemas: {
        DatabaseEscrow: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            job_id: { type: 'string', format: 'uuid' },
            milestone_id: { type: 'string', format: 'uuid', nullable: true },
            buyer_id: { type: 'string', format: 'uuid' },
            seller_id: { type: 'string', format: 'uuid' },
            arbiter_id: { type: 'string', format: 'uuid', nullable: true },
            feerecipient_id: { type: 'string', format: 'uuid', nullable: true },
            rewardToken: { type: 'string', nullable: true },
            rewardRateVsNative: { type: 'integer', nullable: true },
            amount: { type: 'string', nullable: true, description: 'Big integer as string (token units)' },
            buyerFeeReserve: { type: 'string', nullable: true },
            disputeFeeAmount: { type: 'string', nullable: true },
            fee_bps: { type: 'integer' },
            dispute_fee_bps: { type: 'integer' },
            rewardRateBps: { type: 'integer' },
            escrow_created_at: { type: 'integer' },
            escrow_funded_at: { type: 'integer' },
            escrow_deadline: { type: 'integer' },
            escrow_dispute_fee_deadline: { type: 'integer' },
            dispute_initiator: { type: 'string', nullable: true },
            buyer_paid_dispute_fee: { type: 'boolean', nullable: true },
            vender_paid_dispute_fee: { type: 'boolean', nullable: true },
            cid: { type: 'string' },
            contentHash: { type: 'string' },
            proposed_cid: { type: 'string' },
            proposed_content_hash: { type: 'string' },
            buyer_approved: { type: 'boolean' },
            vender_approved: { type: 'boolean' },
            current_state: { type: 'string', enum: ['unfunded','funded','delivered','disputed','releasable','paid','refunded'] },
            chain_id: { type: 'integer' },
            factory_address: { type: 'string' },
            implementation_addr: { type: 'string' },
            proxy_address: { type: 'string' },
            deployment_tx_hash: { type: 'string' },
            token_address: { type: 'string', nullable: true },
            token_type: { type: 'string', enum: ['native','erc20'] },
            token_decimals: { type: 'integer', default: 18 },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
        CreateDatabaseEscrowRequest: {
          type: 'object',
          required: ['job_id','buyer_id','seller_id','arbiter_id','proxy_address'],
          properties: {
            job_id: { type: 'string', format: 'uuid' },
            buyer_id: { type: 'string', format: 'uuid' },
            seller_id: { type: 'string', format: 'uuid' },
            arbiter_id: { type: 'string', format: 'uuid' },
            proxy_address: { type: 'string' },
          },
        },
        UpdateEscrowStateRequest: {
          type: 'object',
          required: ['current_state'],
          properties: {
            current_state: { type: 'string', enum: ['unfunded','funded','delivered','disputed','releasable','paid','refunded'] },
          },
        },
        JobBid: {
          type: 'object',
          required: ['id', 'job_id', 'freelancer_id', 'status', 'created_at'],
          properties: {
            id: { type: 'string', format: 'uuid', readOnly: true },
            job_id: { type: 'string', format: 'uuid' },
            freelancer_id: { type: 'string', format: 'uuid' },
            cover_letter_md: { type: 'string', nullable: true },
            bid_amount: { type: 'string', nullable: true, description: 'Big integer as string (token units)' },
            token_address: { type: 'string', nullable: true },
            token_type: { type: 'string', enum: ['native','erc20'], default: 'native' },
            token_decimals: { type: 'integer', default: 18 },
            status: { type: 'string', enum: ['pending','accepted','rejected','withdrawn'] },
            created_at: { type: 'string', format: 'date-time', readOnly: true },
          },
        },
        CreateJobBidRequest: {
          type: 'object',
          required: ['job_id', 'freelancer_id'],
          properties: {
            job_id: { type: 'string', format: 'uuid' },
            freelancer_id: { type: 'string', format: 'uuid' },
            cover_letter_md: { type: 'string', nullable: true },
            bid_amount: { type: 'string', nullable: true, description: 'Big integer as string (token units)' },
            token_address: { type: 'string', nullable: true },
            token_type: { type: 'string', enum: ['native','erc20'], nullable: true },
            token_decimals: { type: 'integer', nullable: true },
          },
        },
        UpdateJobBidRequest: {
          type: 'object',
          properties: {
            job_id: { type: 'string', format: 'uuid' },
            freelancer_id: { type: 'string', format: 'uuid' },
            cover_letter_md: { type: 'string', nullable: true },
            bid_amount: { type: 'string', nullable: true, description: 'Big integer as string (token units)' },
            token_address: { type: 'string', nullable: true },
            token_type: { type: 'string', enum: ['native','erc20'], nullable: true },
            token_decimals: { type: 'integer', nullable: true },
            status: { type: 'string', enum: ['pending','accepted','rejected','withdrawn'] },
          },
        },
        JobMilestone: {
          type: 'object',
          required: ['id', 'job_id', 'title', 'amount', 'order_index', 'status', 'created_at'],
          properties: {
            id: { type: 'string', format: 'uuid', readOnly: true },
            job_id: { type: 'string', format: 'uuid' },
            creator_id: { type: 'string', format: 'uuid', nullable: true },
            title: { type: 'string' },
            amount: { type: 'string', description: 'Big integer as string (wei or token units)' },
            token_address: { type: 'string', nullable: true },
            token_type: { type: 'string', enum: ['native','erc20'], default: 'native' },
            token_decimals: { type: 'integer', default: 18 },
            due_at: { type: 'string', format: 'date-time', nullable: true },
            order_index: { type: 'integer', example: 1 },
            status: { type: 'string', enum: ['pending_fund','funded','submitted','approved','released','disputed','cancelled'] },
            created_at: { type: 'string', format: 'date-time', readOnly: true },
          },
        },
        CreateJobMilestoneRequest: {
          type: 'object',
          required: ['job_id', 'order_index', 'title', 'amount'],
          properties: {
            job_id: { type: 'string', format: 'uuid' },
            creator_id: { type: 'string', format: 'uuid', nullable: true },
            title: { type: 'string' },
            amount: { type: 'string', description: 'Big integer as string (wei or token units)' },
            token_address: { type: 'string', nullable: true },
            token_type: { type: 'string', enum: ['native','erc20'], nullable: true },
            token_decimals: { type: 'integer', nullable: true },
            due_at: { type: 'string', format: 'date-time', nullable: true },
            order_index: { type: 'integer' },
          },
        },
        UpdateJobMilestoneRequest: {
          type: 'object',
          properties: {
            job_id: { type: 'string', format: 'uuid' },
            creator_id: { type: 'string', format: 'uuid', nullable: true },
            title: { type: 'string' },
            amount: { type: 'string', description: 'Big integer as string (wei or token units)' },
            token_address: { type: 'string', nullable: true },
            token_type: { type: 'string', enum: ['native','erc20'], nullable: true },
            token_decimals: { type: 'integer', nullable: true },
            due_at: { type: 'string', format: 'date-time', nullable: true },
            order_index: { type: 'integer' },
            status: { type: 'string', enum: ['pending_fund','funded','submitted','approved','released','disputed','cancelled'] },
          },
        },
        Job: {
          type: 'object',
          required: ['id', 'client_id', 'title', 'description_md', 'status', 'created_at', 'updated_at'],
          properties: {
            id: { type: 'string', format: 'uuid', readOnly: true },
            client_id: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            description_md: { type: 'string' },
            budget_min_usd: { type: 'number', nullable: true },
            budget_max_usd: { type: 'number', nullable: true },
            token_symbol: { type: 'string', nullable: true },
            deadline_at: { type: 'string', format: 'date-time', nullable: true },
            status: { type: 'string', enum: ['draft','open','in_review','in_progress','completed','cancelled'] },
            is_remote: { type: 'boolean' },
            created_at: { type: 'string', format: 'date-time', readOnly: true },
            updated_at: { type: 'string', format: 'date-time', readOnly: true },
          },
        },
        CreateJobRequest: {
          type: 'object',
          required: ['title', 'description_md', 'client_id'],
          properties: {
            title: { type: 'string' },
            description_md: { type: 'string' },
            client_id: { type: 'string', format: 'uuid' },
            budget_min_usd: { type: 'number', nullable: true },
            budget_max_usd: { type: 'number', nullable: true },
            token_symbol: { type: 'string', nullable: true },
            deadline_at: { type: 'string', format: 'date-time', nullable: true },
            is_remote: { type: 'boolean', nullable: true },
            status: { type: 'string', enum: ['draft','open','in_review','in_progress','completed','cancelled'], nullable: true },
          },
        },
        UpdateJobRequest: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            description_md: { type: 'string' },
            client_id: { type: 'string', format: 'uuid' },
            budget_min_usd: { type: 'number', nullable: true },
            budget_max_usd: { type: 'number', nullable: true },
            token_symbol: { type: 'string', nullable: true },
            deadline_at: { type: 'string', format: 'date-time', nullable: true },
            is_remote: { type: 'boolean' },
            status: { type: 'string', enum: ['draft','open','in_review','in_progress','completed','cancelled'] },
          },
        },
        User: {
          type: 'object',
          required: ['id', 'handle', 'email', 'role', 'is_verified', 'created_at', 'updated_at'],
          properties: {
            id: { type: 'string', format: 'uuid', readOnly: true, example: 'b9e3b0d0-4d4a-4b7d-8e5a-0c9a0d5e1a2b' },
            handle: { type: 'string', example: 'satoshi' },
            email: { type: 'string', format: 'email', example: 'satoshi@nchain.org' },
            role: { type: 'string', enum: ['client', 'freelancer', 'admin'], example: 'client' },
            display_name: { type: 'string', nullable: true, example: 'Satoshi Nakamoto' },
            bio: { type: 'string', nullable: true, example: 'Cryptography enthusiast' },
            country_code: { type: 'string', nullable: true, example: 'USA' },
            is_verified: { type: 'boolean', example: false },
            created_at: { type: 'string', format: 'date-time', readOnly: true },
            updated_at: { type: 'string', format: 'date-time', readOnly: true },
            deleted_at: { type: 'string', format: 'date-time', nullable: true, readOnly: true },
          },
        },
        CreateUserRequest: {
          type: 'object',
          required: ['handle', 'email'],
          properties: {
            handle: { type: 'string' },
            email: { type: 'string', format: 'email' },
            role: { type: 'string', enum: ['client', 'freelancer', 'admin'], description: 'If omitted, backend may apply defaults if any' },
            display_name: { type: 'string', nullable: true },
            bio: { type: 'string', nullable: true },
            country_code: { type: 'string', nullable: true },
            password: { type: 'string', nullable: true, writeOnly: true },
          },
        },
        UpdateUserRequest: {
          type: 'object',
          properties: {
            handle: { type: 'string' },
            email: { type: 'string', format: 'email' },
            role: { type: 'string', enum: ['client', 'freelancer', 'admin'] },
            display_name: { type: 'string', nullable: true },
            bio: { type: 'string', nullable: true },
            country_code: { type: 'string', nullable: true },
            is_verified: { type: 'boolean' },
            password: { type: 'string', nullable: true, writeOnly: true },
          },
        },
        UserWallet: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid', readOnly: true, example: '5f47c25b-0f8d-4b6e-8b2a-7c2c1b3a1e9f' },
            user_id: { type: 'string', format: 'uuid', example: 'b9e3b0d0-4d4a-4b7d-8e5a-0c9a0d5e1a2b' },
            chain: { type: 'string', enum: ['evm'], example: 'evm' },
            chain_id: { type: 'integer', example: 97 },
            address: { type: 'string', example: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb' },
            created_at: { type: 'string', format: 'date-time', readOnly: true },
            updated_at: { type: 'string', format: 'date-time', readOnly: true },
          },
        },
        CreateUserWalletRequest: {
          type: 'object',
          required: ['chain_id', 'address'],
          properties: {
            chain: { type: 'string', enum: ['evm'], example: 'evm' },
            chain_id: { type: 'integer', example: 97 },
            address: { type: 'string', example: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb' },
            user_id: { type: 'string', format: 'uuid', description: 'Owner user ID' },
          },
        },
        UpdateUserWalletRequest: {
          type: 'object',
          properties: {
            chain: { type: 'string', enum: ['evm'], example: 'evm' },
            chain_id: { type: 'integer', example: 97 },
            address: { type: 'string', example: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  example: 'Error description',
                },
                code: {
                  type: 'string',
                  example: 'ERROR_CODE',
                },
              },
            },
          },
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            data: {
              type: 'object',
            },
            message: {
              type: 'string',
            },
          },
        },
        TransactionResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            data: {
              type: 'object',
              properties: {
                transactionHash: {
                  type: 'string',
                  example: '0x1234567890abcdef...',
                },
              },
            },
            message: {
              type: 'string',
            },
          },
        },
        EscrowInfo: {
          type: 'object',
          properties: {
            buyer: {
              type: 'string',
              example: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
            },
            vendor: {
              type: 'string',
              example: '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed',
            },
            arbiter: {
              type: 'string',
              example: '0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359',
            },
            amount: {
              type: 'string',
              example: '1000000000000000000',
            },
            state: {
              type: 'string',
              enum: ['Unfunded', 'Funded', 'Delivered', 'Disputed', 'Releasable', 'Paid', 'Refunded'],
              example: 'Funded',
            },
            deadline: {
              type: 'number',
              example: 1735689600,
            },
            cid: {
              type: 'string',
              example: 'QmTestCID123',
            },
          },
        },
        CreateEscrowRequest: {
          type: 'object',
          required: ['jobId', 'buyer', 'seller', 'arbiter', 'amount', 'deadline'],
          properties: {
            jobId: {
              type: 'string',
              example: 'JOB-001',
              description: 'Unique job identifier',
            },
            buyer: {
              type: 'string',
              example: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
              description: 'Buyer wallet address',
            },
            seller: {
              type: 'string',
              example: '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed',
              description: 'Vendor/seller wallet address',
            },
            arbiter: {
              type: 'string',
              example: '0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359',
              description: 'Arbiter wallet address',
            },
            amount: {
              type: 'string',
              example: '1.0',
              description: 'Project amount in BNB',
            },
            deadline: {
              type: 'number',
              example: 1735689600,
              description: 'Unix timestamp for deadline',
            },
            buyerFeeBps: {
              type: 'number',
              example: 50,
              description: 'Buyer fee in basis points (optional)',
            },
            vendorFeeBps: {
              type: 'number',
              example: 50,
              description: 'Vendor fee in basis points (optional)',
            },
            disputeFeeBps: {
              type: 'number',
              example: 50,
              description: 'Dispute fee in basis points (optional)',
            },
            rewardRateBps: {
              type: 'number',
              example: 25,
              description: 'Reward rate in basis points (optional)',
            },
          },
        },
      },
      securitySchemes: {
        PrivateKey: {
          type: 'apiKey',
          in: 'header',
          name: 'X-Private-Key',
          description: 'Wallet private key for signing transactions',
        },
      },
    },
    tags: [
      {
        name: 'Health',
        description: 'Health check endpoints',
      },
      {
        name: 'Escrow',
        description: 'Escrow management operations',
      },
      {
        name: 'Factory',
        description: 'Escrow factory operations',
      },
      {
        name: 'Rewards',
        description: 'GRMPS reward distribution',
      },
      {
        name: 'Users',
        description: 'User management and wallets',
      },
      {
        name: 'Wallets',
        description: 'User wallet management',
      },
      {
        name: 'Jobs',
        description: 'Job management endpoints',
      },
      {
        name: 'Job Milestones',
        description: 'Job milestone management',
      },
      {
        name: 'Job Bids',
        description: 'Job bid management',
      },
    ],
  },
  apis: ['./src/routes/**/*.ts', './src/controllers/**/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);

