import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { TranslocoModule } from '@jsverse/transloco';
import { ReqResUser } from '../../user.types';

@Component({
  selector: 'app-user-profile',
  imports: [NgOptimizedImage, TranslocoModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.css',
})
export class UserProfile {
  readonly user = input<ReqResUser | null>(null);
}
