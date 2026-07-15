import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

const PUBLIC_ENDPOINTS = ['/api/auth/login/', '/api/auth/register/', '/api/auth/token/refresh/'];

function isPublic(url: string): boolean {
  return PUBLIC_ENDPOINTS.some(e => url.includes(e));
}

function withBearer(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const notifStream = inject(NotificationService);
  const router = inject(Router);

  if (isPublic(req.url)) return next(req);

  const token = auth.getAccessToken();
  const authReq = token ? withBearer(req, token) : req;

  return next(authReq).pipe(
    catchError(err => {
      if (err.status !== 401) return throwError(() => err);

      return auth.refresh().pipe(
        switchMap(res => next(withBearer(req, res.access))),
        catchError(refreshErr => {
          auth.clearSession();
          notifStream.disconnect();
          router.navigate(['/login']);
          return throwError(() => refreshErr);
        })
      );
    })
  );
};
