export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  first_name: string;
  username: string;
  email: string;
  password: string;
  password2: string;
}

export interface TokenResponse {
  access: string;
  refresh: string;
}

export interface AuthUser {
  profile_id: number;
  username: string;
  first_name: string;
  user_picture: string | null;
}
