import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { LoginResponse, AccessTokenResponse, User } from '../../types/auth';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,
  isRefreshing: false,
  error: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<LoginResponse>) => {
      state.accessToken = action.payload.accessToken;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.error = null;
    },
    updateAccessToken: (state, action: PayloadAction<AccessTokenResponse>) => {
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
    },
    clearCredentials: (state) => {
      state.accessToken = null;
      state.user = null;
      state.isAuthenticated = false;
    },
    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setRefreshing: (state, action: PayloadAction<boolean>) => {
      state.isRefreshing = action.payload;
    },
    setAuthError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
  },
});

// Selectors
const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;
const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
const selectAccessToken = (state: { auth: AuthState }) => state.auth.accessToken;
const selectAuthError = (state: { auth: AuthState }) => state.auth.error;

export const { 
  setCredentials,
  updateAccessToken,
  clearCredentials,
  setAuthLoading,
  setRefreshing,
  setAuthError 
} = authSlice.actions;

// Export selectors
export { 
  selectCurrentUser,
  selectIsAuthenticated,
  selectAccessToken,
  selectAuthError
};

export default authSlice.reducer;
