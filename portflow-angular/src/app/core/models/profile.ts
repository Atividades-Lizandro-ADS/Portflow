import { Program, PostFeed } from './post';

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
  about: ProfileAbout | null;
  posts: PostFeed[];
  drafts: PostFeed[];
  liked_posts: PostFeed[];
  saved_posts: PostFeed[];
}
