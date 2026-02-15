import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { ENDPOINTS } from '@constants/app.endpoints.constants';
import { environment } from '@env/environment';
import { catchError, map, Observable, of, shareReplay, throwError } from 'rxjs';
import { ReqResUser, UserDetailsResponse, UsersListResponse } from './user.types';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly usersCache = new Map<string, Observable<UsersListResponse>>();
  private readonly userDetailsCache = new Map<string, Observable<UserDetailsResponse>>();
  private readonly userEntityCache = new Map<number, ReqResUser>();

  readonly listPage = signal(1);
  readonly listPerPage = signal(10);

  setListPage(page: number): void {
    this.listPage.set(page);
  }

  setListPerPage(perPage: number): void {
    this.listPerPage.set(perPage);
  }

  getUsers(page = 1, perPage = 6): Observable<UsersListResponse> {
    const cacheKey = `${page}:${perPage}`;
    const cachedResponse = this.usersCache.get(cacheKey);
    if (cachedResponse) {
      return cachedResponse;
    }

    const params = new HttpParams()
      .set('page', page)
      .set('per_page', perPage);

    const request$ = this.http.get<UsersListResponse>(
      `${environment.apiUrl}${ENDPOINTS.user_list}`,
      { params }
    ).pipe(
      map((response) => {
        this.cacheUsers(response.data);
        return response;
      }),
      shareReplay({ bufferSize: 1, refCount: false }),
      catchError((error: unknown) => {
        this.usersCache.delete(cacheKey);
        return throwError(() => error);
      })
    );

    this.usersCache.set(cacheKey, request$);
    return request$;
  }

  getUserById(id: string | number): Observable<UserDetailsResponse> {
    const normalizedId = id.toString().trim();
    const cachedResponse = this.userDetailsCache.get(normalizedId);
    if (cachedResponse) {
      return cachedResponse;
    }

    const parsedId = Number(normalizedId);
    if (Number.isInteger(parsedId) && this.userEntityCache.has(parsedId)) {
      return of({
        data: this.userEntityCache.get(parsedId)!,
        support: {
          url: '',
          text: '',
        },
      });
    }

    const request$ = this.http.get<UserDetailsResponse>(
      `${environment.apiUrl}${ENDPOINTS.user_details.replace(':id', id.toString())}`
    ).pipe(
      map((response) => {
        this.userEntityCache.set(response.data.id, response.data);
        return response;
      }),
      shareReplay({ bufferSize: 1, refCount: false }),
      catchError((error: unknown) => {
        if (!(error instanceof HttpErrorResponse) || error.status !== 404) {
          this.userDetailsCache.delete(normalizedId);
        }

        return throwError(() => error);
      })
    );

    this.userDetailsCache.set(normalizedId, request$);
    return request$;
  }

  private cacheUsers(users: ReqResUser[]): void {
    for (const user of users) {
      this.userEntityCache.set(user.id, user);
    }
  }
}
