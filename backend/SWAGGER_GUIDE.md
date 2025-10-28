# Swagger API Documentation Guide

## 🎯 Overview

The BSC Escrow API now includes interactive Swagger/OpenAPI documentation for all endpoints.

## 📚 Accessing Swagger Documentation

### Development

When running the development server:

```bash
npm run dev
```

Access Swagger UI at:
- **Swagger UI**: http://localhost:3000/api-docs
- **OpenAPI JSON**: http://localhost:3000/api-docs.json

### Production

Replace `localhost:3000` with your production domain.

## 🔧 Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

This installs:
- `swagger-jsdoc` - Generates OpenAPI spec from JSDoc comments
- `swagger-ui-express` - Serves Swagger UI
- `@types/swagger-jsdoc` - TypeScript types
- `@types/swagger-ui-express` - TypeScript types

### 2. Configuration

Swagger configuration is in `src/config/swagger.ts`:
- API info (title, version, description)
- Server URLs
- Security schemes
- Reusable schemas
- Tags

### 3. Start Server

```bash
npm run dev
```

Visit http://localhost:3000/api-docs to see the interactive documentation!

## 📖 Using Swagger UI

### Features

1. **Try It Out** - Test endpoints directly from the browser
2. **Schema Definitions** - View request/response structures
3. **Examples** - See example payloads
4. **Authentication** - Test with your private keys
5. **Export** - Download OpenAPI JSON spec

### Testing an Endpoint

1. Navigate to http://localhost:3000/api-docs
2. Click on an endpoint to expand it
3. Click "Try it out" button
4. Fill in the parameters
5. Click "Execute"
6. View the response

### Example: Create Escrow

1. Expand `POST /api/v1/factory/escrow`
2. Click "Try it out"
3. Fill in the request body:
```json
{
  "privateKey": "0xYourPrivateKey",
  "jobId": "JOB-001",
  "buyer": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "seller": "0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed",
  "arbiter": "0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359",
  "amount": "1.0",
  "deadline": 1735689600
}
```
4. Click "Execute"
5. See the response with escrow address and transaction hash

## 🛠️ Adding Documentation to New Endpoints

### Basic Structure

Add JSDoc comments above your route definition:

```typescript
/**
 * @swagger
 * /api/v1/your-endpoint:
 *   post:
 *     summary: Short description
 *     description: Detailed description
 *     tags: [YourTag]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               param1:
 *                 type: string
 *     responses:
 *       200:
 *         description: Success response
 */
router.post('/your-endpoint', yourController.method);
```

### Example: GET Endpoint

```typescript
/**
 * @swagger
 * /api/v1/escrow/{address}:
 *   get:
 *     summary: Get escrow information
 *     description: Returns detailed information about an escrow
 *     tags: [Escrow]
 *     parameters:
 *       - in: path
 *         name: address
 *         required: true
 *         schema:
 *           type: string
 *         description: Escrow contract address
 *     responses:
 *       200:
 *         description: Escrow information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EscrowInfo'
 *       404:
 *         description: Escrow not found
 */
router.get('/:address', escrowController.getInfo);
```

### Example: POST Endpoint with Body

```typescript
/**
 * @swagger
 * /api/v1/escrow/{address}/fund:
 *   post:
 *     summary: Fund escrow
 *     tags: [Escrow]
 *     parameters:
 *       - in: path
 *         name: address
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - privateKey
 *               - value
 *             properties:
 *               privateKey:
 *                 type: string
 *                 description: Buyer's private key
 *               value:
 *                 type: string
 *                 description: Amount in BNB to fund
 *     responses:
 *       200:
 *         description: Escrow funded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TransactionResponse'
 */
router.post('/:address/fund', escrowController.fund);
```

## 📝 Reusable Schemas

Define reusable schemas in `src/config/swagger.ts`:

```typescript
components: {
  schemas: {
    YourSchema: {
      type: 'object',
      properties: {
        field1: {
          type: 'string',
          example: 'value',
        },
        field2: {
          type: 'number',
          example: 123,
        },
      },
    },
  },
}
```

Reference in routes:

```typescript
/**
 * @swagger
 * responses:
 *   200:
 *     content:
 *       application/json:
 *         schema:
 *           $ref: '#/components/schemas/YourSchema'
 */
```

## 🏷️ Tags

Organize endpoints with tags:

- **Health** - Health check endpoints
- **Escrow** - Escrow operations
- **Factory** - Factory operations
- **Rewards** - Reward distribution

Add new tags in `src/config/swagger.ts`:

```typescript
tags: [
  {
    name: 'YourTag',
    description: 'Your tag description',
  },
],
```

## 🔐 Security

Document authentication requirements:

```typescript
/**
 * @swagger
 * security:
 *   - PrivateKey: []
 */
```

## 📤 Exporting Documentation

### Download OpenAPI JSON

```bash
curl http://localhost:3000/api-docs.json > openapi.json
```

### Generate Client SDKs

Use tools like:
- **openapi-generator** - Generate client libraries
- **swagger-codegen** - Generate API clients
- **Postman** - Import OpenAPI spec

### Share with Team

1. Export OpenAPI JSON
2. Share the Swagger UI URL
3. Generate documentation site (Redoc, Slate, etc.)

## 🎨 Customization

### Custom CSS

In `src/index.ts`:

```typescript
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'BSC Escrow API Docs',
  customfavIcon: '/favicon.ico',
}));
```

### Custom Logo

```typescript
swaggerUi.setup(swaggerSpec, {
  customCssUrl: '/custom-swagger.css',
  customJs: '/custom-swagger.js',
});
```

## 🚀 Best Practices

1. **Document All Endpoints** - Every public endpoint should have docs
2. **Provide Examples** - Include realistic example values
3. **Describe Errors** - Document all possible error responses
4. **Use Schemas** - Reuse common schemas for consistency
5. **Keep Updated** - Update docs when endpoints change
6. **Test in Swagger** - Verify docs match actual behavior

## 📚 Resources

- [OpenAPI Specification](https://swagger.io/specification/)
- [Swagger UI](https://swagger.io/tools/swagger-ui/)
- [swagger-jsdoc](https://github.com/Surnet/swagger-jsdoc)
- [swagger-ui-express](https://github.com/scottie1984/swagger-ui-express)

## 🔄 Updating Documentation

After adding/modifying endpoints:

1. Add/update JSDoc comments
2. Restart dev server: `npm run dev`
3. Refresh Swagger UI
4. Test the endpoint
5. Export updated OpenAPI JSON if needed

## 🎯 Complete Example

See `src/routes/health.routes.ts` and `src/routes/factory.routes.ts` for complete examples of documented endpoints.

---

**Your API is now fully documented! 📚✨**

