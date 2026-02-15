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
import { Router, RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import {
  EMPTY,
  catchError,
  debounceTime,
  distinctUntilChanged,
  map,
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
  readonly hasSearchInput = computed(() => this.searchInput().trim().length > 0);
  readonly showSearchPanel = computed(() => this.hasSearchInput() && this.searchState() !== 'idle');

  constructor() {
    toObservable(this.searchInput)
      .pipe(
        map((value) => value.trim()),
        debounceTime(250),
        distinctUntilChanged(),
        tap(() => {
          this.searchResult.set(null);
          this.searchState.set('idle');
        }),
        switchMap((value) => this.searchUserById(value)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }

  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchInput.set(target.value);
  }

  onSearchEnter(event: Event): void {
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
