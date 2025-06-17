// Auth types

export interface LoginRequest {
  email: string;
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
  email: string;
  name: string;
}
