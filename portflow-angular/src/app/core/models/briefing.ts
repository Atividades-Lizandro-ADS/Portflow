export type BriefingStatus = 'pending' | 'accepted' | 'declined';

export interface BriefingAttachment {
  id: number;
  briefing: number;
  file: string;
  original_filename: string;
  file_size: number;
}

export interface Briefing {
  id: number;
  conversation: number;
  tier: number;
  tier_name_snapshot: string;
  tier_price_snapshot: string;
  agreed_price: string;
  request_details: string;
  status: BriefingStatus;
  requested_deadline: string;
  deadline: string | null;
  decline_reason: string;
  created_at: string;
  responded_at: string | null;
  attachments: BriefingAttachment[];
}
