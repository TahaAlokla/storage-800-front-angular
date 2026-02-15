import { isPlatformBrowser } from '@angular/common';
import { effect, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly platformId = inject(PLATFORM_ID);
  isDarkMode = signal<boolean>(this.getInitialThemeMode());

  constructor() {
    effect(() => {
      if (!isPlatformBrowser(this.platformId)) {
        return;
      }

      const isDark = this.isDarkMode();
      const html = document.documentElement;

      html.classList.toggle('dark', isDark);
      html.style.colorScheme = isDark ? 'dark' : 'light';
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
  }

  toggleTheme(): void {
    this.isDarkMode.update((current) => !current);
  }

  private getInitialThemeMode(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }

    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'dark') {
      return true;
    }

    if (storedTheme === 'light') {
      return false;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
}
