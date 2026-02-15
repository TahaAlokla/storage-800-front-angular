import {
    HttpErrorResponse,
    HttpEvent,
    HttpHandlerFn,
    HttpRequest,
} from '@angular/common/http';

import { KEYS_KEYWORD } from '@constants/keys.constants';
import { environment } from '@env/environment.development';


import { catchError, Observable, tap, throwError } from 'rxjs';



export const authInterceptor = (
    req: HttpRequest<unknown>,
    next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
    // const authService = inject(AuthService);

    // Clone the request object
    let newReq = req.clone();

    newReq = req.clone({
        headers: req.headers.set(KEYS_KEYWORD.reqres_key, environment.reqres_key),
        // headers: req.headers.set('Authorization', token),
    });

    // Response
    return next(newReq).pipe(
        tap((newReq) => {

        }),
        catchError((error) => {
            // code not neded for this task but I will keep it here for future use
            // console.error('HTTP error occurred:', error);
            // Catch "401 Unauthorized" responses
            // if (error instanceof HttpErrorResponse) {
            //     // Sign out
            //     if (error.status === 401) {
            //         console.error('HTTP error occurred:', error);
            //         // authService.signOut();
            //         // Reload the app
            //         location.reload();
            //     }
            // }
            if (error.error instanceof ErrorEvent) {
                // Client-side network error occurred
                console.error('An error occurred:', error.error.message);
            } else {
                // Server-side error occurred
                console.error(
                    `Backend returned code ${error.status}, body was: ${error.error}`
                );
            }

            return throwError(error);
        })
    );
};
