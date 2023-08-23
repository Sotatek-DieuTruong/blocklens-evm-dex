import { isEmpty, safeToString } from '@sotatek/blocklens-libs';
import Transport from 'winston-transport';
import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';

const { combine, colorize, printf } = winston.format;
const { timestamp } = winston.format;

export const LogTransport = {
  Console: 'consoleLog',
  DailyRotateFile: 'dailyRotateFileLog',
};

const enumerateErrorFormat = winston.format((info) => {
  if (info instanceof Error) {
    const output = Object.assign(
      {
        message: info.message,
        stack: info.stack,
      },
      info,
    );

    return output;
  }
  return info;
});

const getConfigTransports = (transportNames: string[], name?: string) => {
  const configTransports = [];
  if (transportNames.includes(LogTransport.Console)) {
    configTransports.push(
      new winston.transports.Console({
        format: combine(
          colorize(),
          printf((info) => {
            const { timestamp, level, message, ...extra } = info;
            return `${timestamp} [${level}]: ${message}` + (isEmpty(extra) ? '' : ` | ${safeToString(extra)}`);
          }),
        ),
      }),
    );
  }
  if (transportNames.includes(LogTransport.DailyRotateFile)) {
    configTransports.push(
      new DailyRotateFile({
        filename: `${name}-%DATE%.log`,
        format: combine(
          colorize(),
          printf((info) => {
            const { timestamp, level, message, ...extra } = info;
            return `${timestamp} [${level}]: ${message}` + (isEmpty(extra) ? '' : ` | ${safeToString(extra)}`);
          }),
        ),
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '1024m',
        maxFiles: '14d',
        utc: true,
        dirname: process.env.APP_LOGS_PATH || `${process.cwd()}/logs`,
      }),
    );
  }
  return configTransports;
};

const defaultTransports = getConfigTransports([LogTransport.Console]);

export class LoggerService {
  static get(name = '', transportNames?: string[]): winston.Logger {
    const isLoggerExisted = winston.loggers.has(name as string);
    if (!isLoggerExisted) {
      this.create(name, transportNames);
    }

    return winston.loggers.get(name as string);
  }

  private static create = (name?: string, transportNames?: string[]) => {
    const transports: Transport[] = [];
    if (transportNames) {
      const configTransports = getConfigTransports(transportNames, name);
      transports.push(...configTransports);
    } else {
      transports.push(...(defaultTransports as any));
    }
    winston.loggers.add(name as string, {
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(timestamp(), enumerateErrorFormat()),
      transports,
    });
  };
}
