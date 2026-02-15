import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal, input, effect } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { catchError, EMPTY, finalize, tap } from 'rxjs';
import { UserService } from '../../user.service';
import { ReqResUser } from '../../user.types';
import {
  LoadingSkeleton,
  LoadingSkeletonType,
} from '@shared/components/loading-skeleton/loading-skeleton';
import { UserProfile } from '../../components/user-profile/user-profile';

@Component({
  selector: 'app-user-details',
  imports: [TranslocoModule, LoadingSkeleton, UserProfile],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './user-details.html',
  styleUrl: './user-details.css',
})
export class UserDetails {
  readonly loadingSkeletonType = LoadingSkeletonType;
  private readonly userService = inject(UserService);
  private readonly location = inject(Location);
  id = input<string | null>(null);
  readonly isLoading = signal(false);
  readonly errorKey = signal<string | null>(null);
  readonly user = signal<ReqResUser | null>(null);
  constructor() {
    effect((onCleanup) => {
      const id = this.id();
      this.errorKey.set(null);
      this.user.set(null);
      if (!id) {
        this.isLoading.set(false);
        this.errorKey.set('users.details.errors.loadFailed');
        return;
      }
      this.isLoading.set(true);
      const sub = this.userService
        .getUserById(id)
        .pipe(
          tap((r) => this.user.set(r.data)),
          catchError(() => {
            this.errorKey.set('users.details.errors.loadFailed');
            return EMPTY;
          }),
          finalize(() => this.isLoading.set(false)),
        )
        .subscribe();
      onCleanup(() => sub.unsubscribe());
    });
  }

  goBack() {
    this.location.back();
  }
}
