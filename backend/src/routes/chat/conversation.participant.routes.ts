import { Router } from 'express';
import { conversationParticipantController } from '../../controllers/chat/conversation.participant.controller.js';
import { body, param } from 'express-validator';
import { validate } from '../../middlewares/validateRequest.js';

const router = Router();

router.post('/', 
    [
        body('conversation_id').isString().notEmpty(),
        body('user_id').isString().notEmpty(),
        body('is_muted').isBoolean().optional(),
        body('blocked_until').isDate().optional(),
        body('is_pinned').isBoolean().optional(),
        body('last_read_msg_id').isString().optional(),
    ], 
    validate([
        body('conversation_id'),
        body('user_id'),
        body('is_muted'),
        body('blocked_until'),
        body('is_pinned'),
        body('last_read_msg_id'),
    ]),
    conversationParticipantController.createConversationParticipant.bind(conversationParticipantController)
);

router.get('/:id', 
    [
        param('id').isString().notEmpty(),
    ],
    validate([
        param('id'),
    ]),
    conversationParticipantController.getConversationParticipantById.bind(conversationParticipantController)
);

router.get('/conversation/:conversationId', 
    [
        param('conversationId').isString().notEmpty(),
    ],
    validate([
        param('conversationId'),
    ]),
    conversationParticipantController.getConversationParticipantsByConversationId.bind(conversationParticipantController)
);

router.get('/user/:userId', 
    [
        param('userId').isString().notEmpty(),
    ],
    validate([
        param('userId'),
    ]),
    conversationParticipantController.getConversationParticipantsByUserId.bind(conversationParticipantController)
);

router.get('/conversation/:conversationId/user/:userId', 
    [
        param('conversationId').isString().notEmpty(),
        param('userId').isString().notEmpty(),
    ],
    validate([
        param('conversationId'),
        param('userId'),
    ]),
    conversationParticipantController.getConversationParticipantsByConversationIdAndUserId.bind(conversationParticipantController)
);

router.post('/:id', 
    [
        param('id').isString().notEmpty(),
    ],
    validate([
        param('id'),
    ]),
    conversationParticipantController.updateConversationParticipant.bind(conversationParticipantController)
);

router.delete('/:id', 
    [
        param('id').isString().notEmpty(),
    ],
    validate([
        param('id'),
    ]),
    conversationParticipantController.deleteConversationParticipant.bind(conversationParticipantController)
);

export default router;