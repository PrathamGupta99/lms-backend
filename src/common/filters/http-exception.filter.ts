import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const responsePayload = this.buildResponsePayload(exception, status, httpAdapter.getRequestUrl(request));

    Logger.error(
      `HTTP ${status} - ${JSON.stringify(responsePayload)}`,
      exception instanceof Error ? exception.stack : undefined,
      'AllExceptionsFilter',
    );

    httpAdapter.reply(ctx.getResponse(), responsePayload, status);
  }

  private buildResponsePayload(
    exception: unknown,
    status: number,
    path: string,
  ): Record<string, unknown> {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      const message =
        typeof response === 'string'
          ? response
          : (response as { message?: unknown; error?: unknown }).message ||
            (response as { error?: unknown }).error ||
            'Error';

      return {
        statusCode: status,
        message,
        path,
        timestamp: new Date().toISOString(),
      };
    }

    return {
      statusCode: status,
      message: 'Internal server error',
      path,
      timestamp: new Date().toISOString(),
    };
  }
}
