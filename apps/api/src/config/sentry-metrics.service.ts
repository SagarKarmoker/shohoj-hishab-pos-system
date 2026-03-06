import * as Sentry from '@sentry/nestjs';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SentryMetricsService {
  private get metrics() {
    return (Sentry.metrics as any) || (Sentry as any).metrics;
  }

  increment(name: string, value: number = 1, tags?: Record<string, string>) {
    this.metrics?.increment?.(name, value, { tags });
  }

  gauge(name: string, value: number, tags?: Record<string, string>) {
    this.metrics?.gauge?.(name, value, { tags });
  }

  distribution(name: string, value: number, unit?: string, tags?: Record<string, string>) {
    this.metrics?.distribution?.(name, value, { unit, tags });
  }

  set(name: string, value: number, tags?: Record<string, string>) {
    this.metrics?.set?.(name, value, { tags });
  }
}
