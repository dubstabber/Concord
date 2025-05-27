export interface SignupFormData {
  fullName: string;
  email: string;
  password: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface SettingsFormData {
  theme: string;
  notifications: boolean;
  language: string;
}
