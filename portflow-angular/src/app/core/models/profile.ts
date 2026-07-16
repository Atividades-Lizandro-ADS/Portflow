import { Program, PostFeed } from './post';
import { Tier } from './tier';

export interface ProfileMinimal {
  id: number;
  first_name: string;
  username: string;
  user_picture: string | null;
  commissions_open: boolean;
}

export interface ProfilePage {
  count: number;
  next: string | null;
  previous: string | null;
  results: ProfileMinimal[];
}

export interface Hiring {
  id: number;
  hire_type: string;
}

export interface Skill {
  id: number;
  skill_type: string;
}

export interface ProfileAbout {
  id: number;
  summary: string;
  hiring: Hiring[];
  skills: Skill[];
  programs_known: Program[];
}

export interface Profile {
  id: number;
  first_name: string;
  username: string;
  user_picture: string | null;
  profile_banner: string | null;
  commissions_open: boolean;
  commission_tiers: Tier[];
  about: ProfileAbout | null;
  posts: PostFeed[];
  drafts: PostFeed[];
  liked_posts: PostFeed[];
  saved_posts: PostFeed[];
}
