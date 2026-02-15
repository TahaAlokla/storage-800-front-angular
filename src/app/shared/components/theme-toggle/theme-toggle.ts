import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ThemeService } from '@core/services/theme.service';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'theme-toggle',
  imports: [MatButtonModule, MatIconModule, TranslocoModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './theme-toggle.css',
  templateUrl: './theme-toggle.html',
})
export class ThemeToggle {
  readonly themeService = inject(ThemeService);
}
