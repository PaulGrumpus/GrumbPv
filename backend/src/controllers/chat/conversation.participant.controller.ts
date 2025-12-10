import { conversationParticipantService } from '../../services/database/conversation.participant';
import { newConversationParticipantParam     } from '../../types/conversation.participant';
import { AppError } from '../../middlewares/errorHandler';

export class ConversationParticipantController {
    public async createConversationParticipant(params: newConversationParticipantParam) {
        try {
            const result = await conversationParticipantService.createConversationParticipant(params);
            if (!result) {
                throw new AppError('Conversation participant not created', 400, 'CONVERSATION_PARTICIPANT_NOT_CREATED');
            }
            return result;
        }
        catch (error) {
            throw new AppError('Error creating conversation participant', 500, 'CONVERSATION_PARTICIPANT_CREATE_FAILED');
        }
    }
}

export const conversationParticipantController = new ConversationParticipantController();