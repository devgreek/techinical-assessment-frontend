// Auth types

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export interface AccessTokenResponse {
  accessToken: string;
}

export interface User {
  id: string;
  username: string;
  name: string;
}
