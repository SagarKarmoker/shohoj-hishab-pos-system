import * as Sentry from '@sentry/nestjs';
import dotenv from 'dotenv';
dotenv.config();


Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
  _experiments: {
    metricsAggregator: true,
  },
});
