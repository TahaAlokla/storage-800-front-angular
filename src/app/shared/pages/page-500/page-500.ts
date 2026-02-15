import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-page-500',
  imports: [RouterLink, TranslocoModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './page-500.html',
  styleUrl: './page-500.css',
})
export class Page500 {
  private readonly location = inject(Location);

  goBack(): void {
    this.location.back();
  }
}
