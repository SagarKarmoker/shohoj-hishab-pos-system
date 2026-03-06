import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { SentryMetricsService } from '../config/sentry-metrics.service';

@Injectable()
export class SentryMetricsInterceptor implements NestInterceptor {
  constructor(private readonly sentryMetrics: SentryMetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const path = request.route?.path || request.path || 'unknown';

    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          this.sentryMetrics.increment('http.requests', 1, {
            method: request.method,
            status: 'success',
            endpoint: path,
          });
          this.sentryMetrics.distribution('http.response_time', duration, 'milliseconds', {
            method: request.method,
            endpoint: path,
          });
        },
        error: () => {
          const duration = Date.now() - startTime;
          this.sentryMetrics.increment('http.requests', 1, {
            method: request.method,
            status: 'error',
            endpoint: path,
          });
          this.sentryMetrics.distribution('http.response_time', duration, 'milliseconds', {
            method: request.method,
            endpoint: path,
          });
        },
      }),
    );
  }
}
