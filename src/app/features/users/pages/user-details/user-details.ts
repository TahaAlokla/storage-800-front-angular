import { Location, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { catchError, EMPTY, finalize, map, switchMap, tap } from 'rxjs';
import { UserService } from '../../user.service';
import { ReqResUser } from '../../user.types';
import {
  LoadingSkeleton,
  LoadingSkeletonType,
} from '@shared/components/loading-skeleton/loading-skeleton';

@Component({
  selector: 'app-user-details',
  imports: [TranslocoModule, NgOptimizedImage, LoadingSkeleton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './user-details.html',
  styleUrl: './user-details.css',
})
export class UserDetails {
  readonly loadingSkeletonType = LoadingSkeletonType;
  private readonly route = inject(ActivatedRoute);
  private readonly userService = inject(UserService);
  private readonly location = inject(Location);

  readonly isLoading = signal(false);
  readonly errorKey = signal<string | null>(null);
  readonly user = signal<ReqResUser | null>(null);
  readonly userId = signal<string | null>(null);

  constructor() {
    this.route.paramMap
      .pipe(
        map((params) => params.get('id')),
        tap((id) => {
          this.userId.set(id);
          this.isLoading.set(true);
          this.errorKey.set(null);
        }),
        switchMap((id) => {
          if (!id) {
            this.user.set(null);
            this.errorKey.set('users.details.errors.loadFailed');
            this.isLoading.set(false);
            return EMPTY;
          }

          return this.userService.getUserById(id).pipe(
            tap((response) => {
              this.user.set(response.data);
            }),
            catchError(() => {
              this.user.set(null);
              this.errorKey.set('users.details.errors.loadFailed');
              return EMPTY;
            }),
            finalize(() => {
              this.isLoading.set(false);
            })
          );
        }),
        takeUntilDestroyed()
      )
      .subscribe();
  }

  goBack(): void {
    this.location.back();
  }
}
