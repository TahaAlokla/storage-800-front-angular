import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export enum LoadingSkeletonType {
  UserCard = 'user-card',
  UserDetails = 'user-details',
}

@Component({
  selector: 'app-loading-skeleton',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './loading-skeleton.html',
  styleUrl: './loading-skeleton.css',
})
export class LoadingSkeleton {
  readonly skeletonType = LoadingSkeletonType;
  readonly type = input<LoadingSkeletonType>(LoadingSkeletonType.UserCard);
  readonly count = input(6);
  readonly placeholders = computed(() =>
    Array.from({ length: Math.max(1, this.count()) }, (_value, index) => index)
  );
}
