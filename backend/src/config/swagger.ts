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
    ],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);

