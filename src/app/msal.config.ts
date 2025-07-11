import { Configuration, PopupRequest } from '@azure/msal-browser';

export const msalConfig: Configuration = {
  auth: {
    clientId: 'e0ab1369-844a-45fe-8453-a70597fefff5',
    authority:
      'https://login.microsoftonline.com/4f50b506-f401-4dd5-8ba3-6a3986c04477',
    redirectUri: 'https://inmo-house.vercel.app',
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false,
  },
};

export const loginRequest: PopupRequest = {
  scopes: ['openid', 'profile', 'User.Read'],
};
