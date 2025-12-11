import { Router } from 'express';
import { body, param } from 'express-validator';
import { validate } from '../../middlewares/validateRequest.js';
import { conversationController } from '../../controllers/chat/conversation.controller.js';

const router = Router();

router.post('/', 
    [
        body('type').isString().notEmpty(),
        body('job_application_doc_id').isString().notEmpty(),
    ], 
    validate([
        body('type'),
        body('job_application_doc_id'),
    ]),
    conversationController.createConversation.bind(conversationController)
);

router.post('/:id',
    [
        param('id').isString().notEmpty(),
    ],
    validate([
        param('id'),
    ]),
    conversationController.updateConversation.bind(conversationController)
);

router.get('/:id', 
    [
        param('id').isString().notEmpty(),
    ],
    validate([
        param('id'),
    ]),
    conversationController.getConversationById.bind(conversationController)
);

router.delete('/:id', 
    [
        param('id').isString().notEmpty(),
    ],
    validate([
        param('id'),
    ]),
    conversationController.deleteConversation.bind(conversationController)
);

export default router;