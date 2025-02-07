export type BuiltInProvider = 'google' | 'github' | 'microsoft';
export type Provider = BuiltInProvider | (string & {});

export interface ProviderBaseConfig {
    clientId: string;
    redirectUri: string;
    scope?: string;
    domain?: string;
}

export interface ExtraParamsConfig {
    authorization?: Record<string, string>;
    token?: Record<string, string>;
    refresh?: Record<string, string>;
}

export interface StandardProviderConfig extends ProviderBaseConfig {
    extraParams?: Record<string, string>;
}

export interface CustomProviderConfig extends ProviderBaseConfig {
    authorizationUrl: string;
    tokenUrl: string;
    userInfoUrl: string;
    refreshTokenUrl?: string;
    userInfoMapping: {
        id: string;
        email: string;
        name: string;
        picture?: string;
        [key: string]: string | undefined;
    };
    headers?: {
        authorization?: Record<string, string>;
        token?: Record<string, string>;
        refresh?: Record<string, string>;
        userInfo?: Record<string, string>;
    };
    extraParams?: ExtraParamsConfig;
}

export interface GoogleConfig extends StandardProviderConfig {
    responseType?: 'code' | 'token';
    accessType?: 'online' | 'offline';
    prompt?: 'none' | 'consent' | 'select_account';
}

export interface GithubConfig extends StandardProviderConfig {
    enterprise?: {
        domain: string;
    };
    allowSignup?: boolean;
}

export interface MicrosoftConfig extends StandardProviderConfig {
    tenant?: string;
    responseMode?: 'query' | 'fragment' | 'form_post';
}