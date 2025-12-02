import { Router, Request, Response, NextFunction } from 'express';
import { body, param } from 'express-validator';
import { validate } from '../../middlewares/validateRequest.js';
import { gigController } from '../../controllers/database/gig.controller.js';
import { AppError } from '../../middlewares/errorHandler.js';
import multer from 'multer';
import { mkdirSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import path from 'node:path';


const router = Router();
const IMAGE_UPLOAD_DIR = path.resolve(process.cwd(), 'uploads', 'images');
mkdirSync(IMAGE_UPLOAD_DIR, { recursive: true });

const imageStorage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, IMAGE_UPLOAD_DIR);
    },
    filename: (_req, file, cb) => {
        const extension = path.extname(file.originalname) || '.jpg';
        cb(null, `${randomUUID()}${extension}`);
    },
});

const MAX_IMAGE_SIZE_BYTES = Number(process.env.IMAGE_UPLOAD_MAX_SIZE_BYTES || 5 * 1024 * 1024);

const imageUpload = multer({
    storage: imageStorage,
    limits: {
        fileSize: MAX_IMAGE_SIZE_BYTES,
    },
    fileFilter: (_req, file, cb) => {
        if (file.mimetype && file.mimetype.startsWith('image/')) {
            cb(null, true);
            return;
        }
        cb(new AppError('Only image uploads are allowed', 400, 'INVALID_IMAGE_TYPE'));
    },
});

const optionalImageUpload = (req: Request, res: Response, next: NextFunction) => {
    const contentType = req.headers['content-type'] || '';
    const isMultipart = contentType.includes('multipart/form-data');

    if (!isMultipart) {
        return next();
    }

    imageUpload.single('image')(req, res, next);
};

/**
 * @openapi
 * /api/v1/database/gigs:
 *   post:
 *     tags: [Gigs]
 *     summary: Create a gig
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateGigRequest'
 *     responses:
 *       200:
 *         description: Gig created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Gig'
 *       400:
 *         description: Bad request due to validation or business rule errors
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
    '/',
    optionalImageUpload,
    [body('title').isString().notEmpty(), body('description_md').isString().notEmpty(), body('freelancer_id').isString().notEmpty()],
    validate([body('title'), body('description_md'), body('freelancer_id')]),
    gigController.createGig.bind(gigController)
);

/**
 * @openapi
 * /api/v1/database/gigs/{id}:
 *   post:
 *     tags: [Gigs]
 *     summary: Update a gig by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateGigRequest'
 *     responses:
 *       200:
 *         description: Gig updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Gig'
 *       400:
 *         description: Bad request due to validation or business rule errors
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
    '/:id',
    optionalImageUpload,
    [param('id').isString().notEmpty()],
    validate([param('id')]),
    gigController.updateGig.bind(gigController)
);

/**
 * @openapi
 * /api/v1/database/gigs/{id}:
 *   delete:
 *     tags: [Gigs]
 *     summary: Delete a gig by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
*         description: Gig deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Bad request due to validation or business rule errors
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete(
    '/:id',
    [param('id').isString().notEmpty()],
    validate([param('id')]),
    gigController.deleteGig.bind(gigController)
);

/**
 * @openapi
 * /api/v1/database/gigs/by-id/{id}:
 *   get:
 *     tags: [Gigs]
 *     summary: Get gig by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Gig retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Gig'
 *       400:
 *         description: Bad request due to validation or business rule errors
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
    '/by-id/:id',
    [param('id').isString().notEmpty()],
    validate([param('id')]),
    gigController.getGigById.bind(gigController)
);

/**
 * @openapi
 * /api/v1/database/gigs/by-freelancer-id/{freelancer_id}:
 *   get:
 *     tags: [Gigs]
 *     summary: List gigs by freelancer ID
 *     parameters:
 *       - in: path
 *         name: freelancer_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Gigs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
*                         $ref: '#/components/schemas/Gig'
 *       400:
 *         description: Bad request due to validation or business rule errors
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
    '/by-freelancer-id/:freelancer_id',
    [param('freelancer_id').isString().notEmpty()],
    validate([param('freelancer_id')]),
    gigController.getGigsByFreelancerId.bind(gigController)
);

/**
 * @openapi
 * /api/v1/database/gigs:
 *   get:
 *     tags: [Gigs]
 *     summary: List all gigs
 *     responses:
 *       200:
 *         description: Gigs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Gig'
 *       400:
 *         description: Bad request due to validation or business rule errors
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
    '/',
    gigController.getGigs.bind(gigController)
);

export default router;