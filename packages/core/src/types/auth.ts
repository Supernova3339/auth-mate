import {Provider} from "./providers";

export interface User {
    id: string;
    email: string;
    name: string;
    picture?: string | null;
    provider: Provider;
    raw: any;
}

export interface AuthState {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: User | null;
    error: Error | null;
}

export interface AuthContextValue extends AuthState {
    login: (provider: Provider) => Promise<void>;
    logout: () => Promise<void>;
    getToken: () => Promise<string | null>;
}