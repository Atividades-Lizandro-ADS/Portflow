export interface Conversation {
  id: number;
  tier: number;
  client: number;
  artist: number;
  created_at: string;
}

export type ChatMessageType =
  | 'text'
  | 'briefing_sent'
  | 'briefing_response'
  | 'extension_request'
  | 'extension_response';

export interface ChatMessage {
  id: number;
  conversation: number;
  sender: number;
  body: string;
  message_type: ChatMessageType;
  related_briefing: number | null;
  related_extension_request: number | null;
  is_read: boolean;
  created_at: string;
}
