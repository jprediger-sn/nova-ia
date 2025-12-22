export interface User {
  sub: string;
  email: string;
  tenantId: string;
  role: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthenticating: boolean;
}

export interface NewPasswordRequiredParams {
  session: string;
  email: string;
}

export interface ResetPasswordParams {
  username: string;
}

export interface ConfirmResetPasswordParams {
  username: string;
  confirmationCode: string;
  newPassword: string;
}

export interface AuthContextValue extends AuthState {
  login: (credentials: LoginCredentials) => Promise<User>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  confirmNewPassword: (session: string, newPassword: string) => Promise<void>;
  resetPassword: (username: string) => Promise<void>;
  confirmResetPassword: (username: string, confirmationCode: string, newPassword: string) => Promise<void>;
}


