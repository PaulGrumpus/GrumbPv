import { Router } from 'express';
import { contactController } from '../controllers/contact.controller.js';

const router = Router();

/**
 * @swagger
 * /api/v1/contact:
 *   post:
 *     summary: Submit contact form
 *     description: Submit a contact form inquiry that will be sent via email
 *     tags: [Contact]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - enquiry
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@example.com
 *               enquiry:
 *                 type: string
 *                 example: I would like to know more about your services.
 *     responses:
 *       200:
 *         description: Contact form submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Contact form submitted successfully. We will get back to you soon.
 *       400:
 *         description: Bad request - missing or invalid fields
 *       500:
 *         description: Server error
 */
router.post('/', contactController.submitContactForm.bind(contactController));

export default router;

