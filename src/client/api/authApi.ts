import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { LoginRequest, LoginResponse, AccessTokenResponse } from '../types/auth';
import { RootState } from '../store';

// Define the API base URL
const API_BASE_URL = 'http://localhost:5000';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      // Get token from state
      const token = (getState() as RootState).auth.accessToken;
      
      // If we have a token, add the Authorization header
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      
      return headers;
    },
    credentials: 'include', // Important for cookies (refresh token)
  }),
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    refresh: builder.mutation<AccessTokenResponse, void>({
      query: () => ({
        url: '/auth/refresh',
        method: 'POST',
      }),
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
    }),
    // User data endpoint to fetch the user's profile information
    getUserData: builder.query<{ user: { id: string; name: string; username: string } }, void>({
      query: () => '/user/profile',
    }),
  }),
});

// Export the generated hooks
export const {
  useLoginMutation,
  useRefreshMutation,
  useLogoutMutation,
  useGetUserDataQuery,
} = authApi;
