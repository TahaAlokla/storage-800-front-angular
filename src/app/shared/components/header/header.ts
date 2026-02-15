import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import {
  EMPTY,
  catchError,
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  startWith,
  switchMap,
  tap,
} from 'rxjs';
import { UserService } from '../../../features/users/user.service';
import { ReqResUser } from '../../../features/users/user.types';

type SearchState = 'idle' | 'loading' | 'found' | 'notFound' | 'invalid' | 'error';

@Component({
  selector: 'app-header',
  imports: [TranslocoModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly searchInput = signal('');
  readonly searchState = signal<SearchState>('idle');
  readonly searchResult = signal<ReqResUser | null>(null);
  readonly isUsersListPage = signal(false);
  readonly hasSearchInput = computed(() => this.searchInput().trim().length > 0);
  readonly showSearchPanel = computed(
    () => !this.isUsersListPage() && this.hasSearchInput() && this.searchState() !== 'idle'
  );

  constructor() {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        startWith(null),
        map(() => this.router.url.split('?')[0]),
        tap((url) => {
          const isListPage = url === '/users' || url === '/users/';
          this.isUsersListPage.set(isListPage);

          if (!isListPage) {
            this.userService.clearListSearchQuery();
          }

          this.searchResult.set(null);
          this.searchState.set('idle');
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();

    toObservable(this.searchInput)
      .pipe(
        map((value) => value.trim()),
        debounceTime(250),
        distinctUntilChanged(),
        tap(() => {
          this.searchResult.set(null);
          this.searchState.set('idle');
        }),
        switchMap((value) => {
          if (this.isUsersListPage()) {
            this.userService.setListSearchQuery(value);
            return EMPTY;
          }

          this.userService.clearListSearchQuery();
          return this.searchUserById(value);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }

  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchInput.set(target.value);
  }

  onSearchEnter(event: Event): void {
    if (this.isUsersListPage()) {
      return;
    }

    const user = this.searchResult();
    if (!user) {
      return;
    }

    event.preventDefault();
    this.navigateToUser(user.id);
  }

  navigateToUser(userId: number): void {
    this.searchState.set('idle');
    this.router.navigate(['/users', userId]);
  }

  private searchUserById(value: string) {
    if (value.length === 0) {
      return EMPTY;
    }

    if (!/^\d+$/.test(value)) {
      this.searchState.set('invalid');
      return EMPTY;
    }

    this.searchState.set('loading');
    return this.userService.getUserById(value).pipe(
      tap((response) => {
        this.searchResult.set(response.data);
        this.searchState.set('found');
      }),
      catchError((error: unknown) => {
        if (error instanceof HttpErrorResponse && error.status === 404) {
          this.searchState.set('notFound');
          return EMPTY;
        }

        this.searchState.set('error');
        return EMPTY;
      })
    );
  }
}
