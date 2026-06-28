export interface CommentOwner {
  id: number;
  username: string;
  user_picture: string | null;
}

export interface Comment {
  id: number;
  comment_text: string;
  comment_owner: CommentOwner;
  created: string;
}

export interface PostOwner {
  id: number;
  first_name: string;
  username: string;
  user_picture: string | null;
  commissions_open: boolean;
}

export interface PostFeed {
  id: number;
  tittle: string;
  caption: string;
  post_thumb: string | null;
  art_type: '2' | '3';
  post_owner: PostOwner;
  like_num: number;
  view_number: number;
  creation_date: string;
  is_mature: boolean;
}

export interface PostImage {
  id: number;
  post_img: string;
  caption: string;
  acessibility_caption: string;
  cell_size_x: string;
  cell_size_y: string;
  is_mature: boolean;
}

export interface Program {
  id: number;
  program_name: string;
  program_logo: string | null;
}

export interface PostDetail extends PostFeed {
  description: string;
  category: string | null;
  images: PostImage[];
  used_programs: Program[];
  display_type: 'list' | 'album';
  liked: boolean;
  favorited: boolean;
  youtube_link: string | null;
  sketchfab_link: string | null;
  marmoview: string | null;
  keywords: string;
  keywords_list: string[];
  published: boolean;
  comments_count: number;
}
