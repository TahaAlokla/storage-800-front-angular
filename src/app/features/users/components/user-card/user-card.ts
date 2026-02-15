import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReqResUser } from '../../user.types';
import { NgOptimizedImage } from '@angular/common';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-user-card',
  imports: [RouterLink, NgOptimizedImage, TranslocoModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './user-card.html',
  styleUrl: './user-card.css',
})
export class UserCard {
  user = input<ReqResUser | null>(null);
}
