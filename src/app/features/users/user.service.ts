import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ENDPOINTS } from '@constants/app.endpoints.constants';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';
import { UserDetailsResponse, UsersListResponse } from './user.types';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly http = inject(HttpClient);

  getUsers(page = 1, perPage = 6): Observable<UsersListResponse> {
    const params = new HttpParams()
      .set('page', page)
      .set('per_page', perPage);

    return this.http.get<UsersListResponse>(
      `${environment.apiUrl}${ENDPOINTS.user_list}`,
      { params }
    );
  }

  getUserById(id: string | number): Observable<UserDetailsResponse> {
    return this.http.get<UserDetailsResponse>(
      `${environment.apiUrl}${ENDPOINTS.user_details.replace(':id', id.toString())}`
    );
  }
}
