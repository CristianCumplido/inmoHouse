import { MsalService } from '@azure/msal-angular';
import { PublicClientApplication } from '@azure/msal-browser';
import { msalConfig } from 'src/app/msal.config';

export function MSALInstanceFactory(): PublicClientApplication {
  return new PublicClientApplication(msalConfig);
}

export function MSALServiceFactory(
  msalService: MsalService
): () => Promise<void> {
  return () => msalService.instance.initialize();
}
