import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import { Logger } from 'winston';
import { Inject } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

@Injectable()
export class MorganMiddleware implements NestMiddleware {
  private morganMiddleware: any;

  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {
    // Custom morgan token for response time in ms
    morgan.token('response-time-ms', (req: any, res: any) => {
      if (!req._startAt || !res._startAt) {
        return '0';
      }
      const ms = (res._startAt[0] - req._startAt[0]) * 1e3 +
                 (res._startAt[1] - req._startAt[1]) * 1e-6;
      return ms.toFixed(2);
    });

    // Define custom morgan format
    const morganFormat = ':method :url :status :response-time-ms ms - :res[content-length]';

    // Create morgan middleware that logs to Winston
    this.morganMiddleware = morgan(morganFormat, {
      stream: {
        write: (message: string) => {
          // Remove trailing newline
          const logMessage = message.trim();
          
          // Parse status code to determine log level
          const statusMatch = logMessage.match(/\s(\d{3})\s/);
          const status = statusMatch ? parseInt(statusMatch[1]) : 0;

          // Log based on status code
          if (status >= 500) {
            this.logger.error(logMessage, { context: 'HTTP' });
          } else if (status >= 400) {
            this.logger.warn(logMessage, { context: 'HTTP' });
          } else {
            this.logger.http(logMessage, { context: 'HTTP' });
          }
        },
      },
    });
  }

  use(req: Request, res: Response, next: NextFunction) {
    this.morganMiddleware(req, res, next);
  }
}
