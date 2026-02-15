import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { PLATFORM_ID } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';

@Component({
  selector: 'lang-toggle',
  imports: [TranslocoModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './lang-toggle.html',
  styleUrl: './lang-toggle.css',
})
export class LangToggle implements OnInit {
  private _transloco = inject(TranslocoService);
  private _destroyRef = inject(DestroyRef);
  private _platformId = inject(PLATFORM_ID);

  activeLang = signal(this._transloco.getActiveLang());

  ngOnInit(): void {
    if (isPlatformBrowser(this._platformId)) {
      const savedLang = localStorage.getItem('lang');
      if ((savedLang === 'en' || savedLang === 'ar') && savedLang !== this.activeLang()) {
        this._transloco.setActiveLang(savedLang);
      }
    }

    this._transloco.langChanges$
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((lang) => {
        this.activeLang.set(lang);
        if (isPlatformBrowser(this._platformId)) {
          localStorage.setItem('lang', lang);
          document.documentElement.lang = lang;
          document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
        }
      });
  }

  toggleLanguage(): void {
    const next = this.activeLang() === 'ar' ? 'en' : 'ar';
    this._transloco.setActiveLang(next);
  }
}
