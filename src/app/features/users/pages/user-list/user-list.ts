import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { EMPTY, switchMap, tap, catchError, finalize } from 'rxjs';
import { UserService } from '../../user.service';
import { ReqResUser, UsersListResponse } from '../../user.types';
import { UserCard } from '../../components/user-card/user-card';
import { TranslocoModule } from '@jsverse/transloco';
import {
  LoadingSkeleton,
  LoadingSkeletonType,
} from '@shared/components/loading-skeleton/loading-skeleton';
import { Pagination } from '@shared/components/pagination/pagination';

@Component({
  selector: 'app-user-list',
  imports: [UserCard, TranslocoModule, LoadingSkeleton, Pagination],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './user-list.html',
  styleUrl: './user-list.css',
})
export class UsersList {
  readonly loadingSkeletonType = LoadingSkeletonType;
  private readonly userService = inject(UserService);
  private readonly destroyRef = inject(DestroyRef);

  readonly page = this.userService.listPage;
  readonly perPage = this.userService.listPerPage;
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly usersResponse = signal<UsersListResponse | null>(null);

  readonly users = computed(() => this.usersResponse()?.data ?? []);
  readonly total = computed(() => this.usersResponse()?.total ?? 0);
  readonly totalPages = computed(() => this.usersResponse()?.total_pages ?? 1);
  readonly currentPage = computed(() => this.usersResponse()?.page ?? this.page());
  readonly support = computed(() => this.usersResponse()?.support ?? null);
  readonly canGoPrevious = computed(() => this.currentPage() > 1 && !this.isLoading());
  readonly canGoNext = computed(() => this.currentPage() < this.totalPages() && !this.isLoading());
  readonly pageNumbers = computed(() => {
    const pages: number[] = [];
    for (let index = 1; index <= this.totalPages(); index += 1) {
      pages.push(index);
    }

    return pages;
  });
  readonly startItem = computed(() => {
    const total = this.total();
    if (total === 0) {
      return 0;
    }

    return (this.currentPage() - 1) * this.perPage() + 1;
  });
  readonly endItem = computed(() => {
    const total = this.total();
    if (total === 0) {
      return 0;
    }

    return Math.min(this.currentPage() * this.perPage(), total);
  });

  constructor() {
    toObservable(computed(() => ({ page: this.page(), perPage: this.perPage() })))
      .pipe(
        tap(() => {
          this.isLoading.set(true);
          this.errorMessage.set(null);
        }),
        switchMap(({ page, perPage }) =>
          this.userService.getUsers(page, perPage).pipe(
            tap((response) => {
              this.usersResponse.set(response);
            }),
            catchError(() => {
              this.usersResponse.set(null);
              this.errorMessage.set('users.list.errors.loadFailed');
              return EMPTY;
            }),
            finalize(() => {
              this.isLoading.set(false);
            }),
          ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  goToPreviousPage(): void {
    if (!this.canGoPrevious()) {
      return;
    }

    this.userService.setListPage(this.page() - 1);
  }

  goToNextPage(): void {
    if (!this.canGoNext()) {
      return;
    }

    this.userService.setListPage(this.page() + 1);
  }

  goToPage(pageNumber: number): void {
    if (pageNumber < 1 || pageNumber > this.totalPages() || pageNumber === this.page()) {
      return;
    }

    this.userService.setListPage(pageNumber);
  }

  trackUserById(_index: number, user: ReqResUser): number {
    return user.id;
  }

  trackPage(_index: number, pageNumber: number): number {
    return pageNumber;
  }

  onPerPageChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const newPerPage = parseInt(target.value, 10);
    if (newPerPage > 0 && newPerPage !== this.perPage()) {
      this.userService.setListPerPage(newPerPage);
      this.userService.setListPage(1);
    }
  }
}
