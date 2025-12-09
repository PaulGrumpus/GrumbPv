import swaggerJsdoc from 'swagger-jsdoc';
import dotenv from 'dotenv';
dotenv.config();

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
        JobBid: {
          type: 'object',
          required: ['id', 'job_id', 'freelancer_id', 'status', 'created_at'],
          properties: {
            id: { type: 'string', format: 'uuid', readOnly: true },
            job_id: { type: 'string', format: 'uuid' },
            freelancer_id: { type: 'string', format: 'uuid' },
            cover_letter_md: { type: 'string', nullable: true },
            bid_amount: { type: 'number', nullable: true },
            token_symbol: { type: 'string', nullable: true },
            status: { type: 'string', enum: ['pending', 'accepted', 'rejected', 'withdrawn'] },
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
            bid_amount: { type: 'number', nullable: true },
            token_symbol: { type: 'string', nullable: true },
          },
        },
        UpdateJobBidRequest: {
          type: 'object',
          properties: {
            job_id: { type: 'string', format: 'uuid' },
            freelancer_id: { type: 'string', format: 'uuid' },
            cover_letter_md: { type: 'string', nullable: true },
            bid_amount: { type: 'number', nullable: true },
            token_symbol: { type: 'string', nullable: true },
            status: { type: 'string', enum: ['pending', 'accepted', 'rejected', 'withdrawn'] },
          },
        },
        JobMilestone: {
          type: 'object',
          required: ['id', 'job_id', 'title', 'amount', 'order_index', 'status', 'created_at'],
          properties: {
            id: { type: 'string', format: 'uuid', readOnly: true },
            job_id: { type: 'string', format: 'uuid' },
            freelancer_id: { type: 'string', format: 'uuid', nullable: true },
            title: { type: 'string' },
            amount: { type: 'number', nullable: true },
            token_symbol: { type: 'string', nullable: true },
            due_at: { type: 'string', format: 'date-time', nullable: true },
            order_index: { type: 'integer', example: 1 },
            status: {
              type: 'string',
              enum: [
                'pending_fund',
                'funded',
                'submitted',
                'approved',
                'released',
                'disputed',
                'cancelled',
              ],
            },
            escrow: { type: 'string', nullable: true },
            created_at: { type: 'string', format: 'date-time', readOnly: true },
          },
        },
        CreateJobMilestoneRequest: {
          type: 'object',
          required: ['job_id', 'order_index', 'title', 'amount', 'freelancer_id'],
          properties: {
            job_id: { type: 'string', format: 'uuid' },
            freelancer_id: { type: 'string', format: 'uuid', nullable: true },
            title: { type: 'string' },
            amount: { type: 'number', nullable: true },
            token_symbol: { type: 'string', nullable: true },
            due_at: { type: 'string', format: 'date-time', nullable: true },
            order_index: { type: 'integer' },
          },
        },
        UpdateJobMilestoneRequest: {
          type: 'object',
          properties: {
            job_id: { type: 'string', format: 'uuid' },
            freelancer_id: { type: 'string', format: 'uuid', nullable: true },
            title: { type: 'string' },
            amount: { type: 'number', nullable: true },
            token_symbol: { type: 'string', nullable: true },
            due_at: { type: 'string', format: 'date-time', nullable: true },
            order_index: { type: 'integer' },
            status: {
              type: 'string',
              enum: [
                'pending_fund',
                'funded',
                'submitted',
                'approved',
                'released',
                'disputed',
                'cancelled',
              ],
            },
          },
        },
        Job: {
          type: 'object',
          required: [
            'id',
            'client_id',
            'title',
            'description_md',
            'status',
            'created_at',
            'updated_at',
          ],
          properties: {
            id: { type: 'string', format: 'uuid', readOnly: true },
            client_id: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            description_md: { type: 'string' },
            budget_min_usd: { type: 'number', nullable: true },
            budget_max_usd: { type: 'number', nullable: true },
            token_symbol: { type: 'string', nullable: true },
            deadline_at: { type: 'string', format: 'date-time', nullable: true },
            status: {
              type: 'string',
              enum: ['draft', 'open', 'in_review', 'in_progress', 'completed', 'cancelled'],
            },
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
            status: {
              type: 'string',
              enum: ['draft', 'open', 'in_review', 'in_progress', 'completed', 'cancelled'],
              nullable: true,
            },
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
            status: {
              type: 'string',
              enum: ['draft', 'open', 'in_review', 'in_progress', 'completed', 'cancelled'],
            },
          },
        },
        Gig: {
          type: 'object',
          required: [
            'id',
            'freelancer_id',
            'title',
            'description_md',
            'status',
            'created_at',
            'updated_at',
          ],
          properties: {
            id: { type: 'string', format: 'uuid', readOnly: true },
            freelancer_id: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            description_md: { type: 'string' },
            budget_min_usd: { type: 'number', nullable: true },
            budget_max_usd: { type: 'number', nullable: true },
            token_symbol: { type: 'string', nullable: true },
            tags: { type: 'array', items: { type: 'string' } },
            link: { type: 'string', nullable: true },
          },
        },
        CreateGigRequest: {
          type: 'object',
          required: ['title', 'description_md', 'freelancer_id'],
          properties: {
            title: { type: 'string' },
            description_md: { type: 'string' },
            freelancer_id: { type: 'string', format: 'uuid' },
            budget_min_usd: { type: 'number', nullable: true },
            budget_max_usd: { type: 'number', nullable: true },
            token_symbol: { type: 'string', nullable: true },
            tags: { type: 'array', items: { type: 'string' } },
            link: { type: 'string', nullable: true },
          },
        },
        UpdateGigRequest: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            description_md: { type: 'string' },
            freelancer_id: { type: 'string', format: 'uuid' },
            budget_min_usd: { type: 'number', nullable: true },
            budget_max_usd: { type: 'number', nullable: true },
            token_symbol: { type: 'string', nullable: true },
            tags: { type: 'array', items: { type: 'string' } },
            link: { type: 'string', nullable: true },
          },
        },
        User: {
          type: 'object',
          required: ['id', 'handle', 'email', 'role', 'is_verified', 'created_at', 'updated_at'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              readOnly: true,
              example: 'b9e3b0d0-4d4a-4b7d-8e5a-0c9a0d5e1a2b',
            },
            address: { type: 'string', example: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb' },
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
        CreateUserWithAddressRequest: {
          type: 'object',
          required: ['address', 'role'],
          properties: {
            address: { type: 'string' },
            role: {
              type: 'string',
              enum: ['client', 'freelancer', 'admin'],
              description: 'If omitted, backend may apply defaults if any',
            },
            display_name: { type: 'string', nullable: true },
            bio: { type: 'string', nullable: true },
            country_code: { type: 'string', nullable: true },
          },
        },
        CreateUserWithEmailRequest: {
          type: 'object',
          required: ['email', 'role'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string' },
            role: {
              type: 'string',
              enum: ['client', 'freelancer', 'admin'],
              description: 'If omitted, backend may apply defaults if any',
            },
            display_name: { type: 'string', nullable: true },
            bio: { type: 'string', nullable: true },
            country_code: { type: 'string', nullable: true },
          },
        },
        GetUserByEmailAndPasswordRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string' },
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
            id: {
              type: 'string',
              format: 'uuid',
              readOnly: true,
              example: '5f47c25b-0f8d-4b6e-8b2a-7c2c1b3a1e9f',
            },
            user_id: {
              type: 'string',
              format: 'uuid',
              example: 'b9e3b0d0-4d4a-4b7d-8e5a-0c9a0d5e1a2b',
            },
            chain: { type: 'string', enum: ['evm'], example: 'evm' },
            chain_id: { type: 'integer', example: 97 },
            address: { type: 'string', example: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb' },
            is_primary: { type: 'boolean', example: true },
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
            is_primary: { type: 'boolean', example: true },
          },
        },
        UpdateUserWalletRequest: {
          type: 'object',
          properties: {
            chain: { type: 'string', enum: ['evm'], example: 'evm' },
            chain_id: { type: 'integer', example: 97 },
            address: { type: 'string', example: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb' },
            is_primary: { type: 'boolean', example: true },
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
              enum: [
                'Unfunded',
                'Funded',
                'Delivered',
                'Disputed',
                'Releasable',
                'Paid',
                'Refunded',
              ],
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
          required: ['job_milestone_id'],
          properties: {
            job_milestone_id: {
              type: 'string',
              format: 'uuid',
              example: 'b9e3b0d0-4d4a-4b7d-8e5a-0c9a0d5e1a2b',
              description:
                'Job milestone UUID - all other data (amount, addresses, deadline) will be fetched from database',
            },
          },
        },
        ChainTx: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid', readOnly: true },
            purpose: { type: 'string', example: 'escrow_funding' },
            chain_id: { type: 'integer', example: 97 },
            from_address: { type: 'string', example: '0x1234...abcd' },
            to_address: { type: 'string', nullable: true, example: '0xabcd...1234' },
            tx_hash: { type: 'string', nullable: true, example: '0xdeadbeef...' },
            status: { type: 'string', example: 'success' },
            user_id: { type: 'string', format: 'uuid', nullable: true },
            created_at: { type: 'string', format: 'date-time', readOnly: true },
            updated_at: { type: 'string', format: 'date-time', readOnly: true },
          },
        },
        CreateChainTxRequest: {
          type: 'object',
          required: [
            'purpose',
            'chain_id',
            'from_address',
            'to_address',
            'tx_hash',
            'status',
            'user_id',
          ],
          properties: {
            purpose: { type: 'string', example: 'escrow_funding' },
            chain_id: { type: 'integer', example: 97 },
            from_address: { type: 'string', example: '0x1234...abcd' },
            to_address: { type: 'string', example: '0xabcd...1234' },
            tx_hash: { type: 'string', example: '0xdeadbeef...' },
            status: { type: 'string', example: 'success' },
            user_id: { type: 'string', format: 'uuid' },
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
      {
        name: 'ChainTxs',
        description: 'Blockchain transaction records linked to users/actions',
      },
    ],
  },
  apis: ['./src/routes/**/*.ts', './src/controllers/**/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
