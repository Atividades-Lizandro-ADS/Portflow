import { Tier } from './tier';
import { ProfileMinimal } from './profile';
import { Briefing } from './briefing';
import { ChatAttachment } from './chat-attachment';

export type ChatMessageType =
  | 'text'
  | 'briefing_sent'
  | 'briefing_response'
  | 'extension_request'
  | 'extension_response';

export interface LastMessagePreview {
  body: string;
  message_type: ChatMessageType;
  sender: number;
  created_at: string;
}

export interface Conversation {
  id: number;
  tier: number;
  tier_detail: Tier;
  client: number;
  artist: number;
  other_profile: ProfileMinimal;
  last_message: LastMessagePreview | null;
  can_send_message: boolean;
  created_at: string;
}

export interface ChatMessage {
  id: number;
  conversation: number;
  sender: number;
  body: string;
  message_type: ChatMessageType;
  related_briefing: number | null;
  related_briefing_detail: Briefing | null;
  related_extension_request: number | null;
  is_read: boolean;
  created_at: string;
  attachments: ChatAttachment[];
}
