import { isPlatformBrowser } from '@angular/common';
import {
  ApplicationConfig,
  inject,
  isDevMode,
  PLATFORM_ID,
  provideBrowserGlobalErrorListeners,
  provideEnvironmentInitializer,
} from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { provideTransloco, TranslocoService } from '@jsverse/transloco';
import { routes } from './app.routes';
import { TranslocoHttpLoader } from '@core/transloco-loader';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { TranslocoPaginatorIntlService } from '@core/services/transloco-paginator';
import { SplashScreenService } from '@core/services/splash-screen';
import { LoadingService } from '@core/services/loading.service';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { LoadingInterceptor } from '@core/interceptors/loading.interceptor';
import { authInterceptor } from '@core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withViewTransitions(), withComponentInputBinding()),
    provideHttpClient(withInterceptors([LoadingInterceptor, authInterceptor])),
    provideEnvironmentInitializer(() => {
      inject(SplashScreenService);
      inject(LoadingService);
      const transloco = inject(TranslocoService);
      const platformId = inject(PLATFORM_ID);

      if (isPlatformBrowser(platformId)) {
        const savedLang = localStorage.getItem('lang');
        if (savedLang === 'en' || savedLang === 'ar') {
          transloco.setActiveLang(savedLang);
        }
      }
    }),
    provideTransloco({
      config: {
        availableLangs: ['en', 'ar'],
        defaultLang: 'en',
        // Remove this option if your application doesn't support changing language in runtime.
        reRenderOnLangChange: true,
        prodMode: !isDevMode(),
      },
      loader: TranslocoHttpLoader,
    }),
    { provide: MatPaginatorIntl, useClass: TranslocoPaginatorIntlService },
  ],
};
