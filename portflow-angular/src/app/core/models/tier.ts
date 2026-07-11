export type NegotiationDirection = 'up' | 'down' | 'both';

export interface Tier {
  id: number;
  profile: number;
  name: string;
  description: string;
  thumb: string | null;
  price: string;
  negotiable: boolean;
  negotiation_direction: NegotiationDirection | null;
}
