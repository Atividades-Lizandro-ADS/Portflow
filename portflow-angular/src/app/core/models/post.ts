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
