import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { AbstractHttpAdapter, HttpAdapterHost } from '@nestjs/core';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    // Adapter typing defaults to `any` generics in Nest; suppress unsafe assignment warning.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const httpAdapter: AbstractHttpAdapter = this.httpAdapterHost.httpAdapter;
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const path = String(httpAdapter.getRequestUrl(request));
    const responsePayload = this.buildResponsePayload(exception, status, path);

    Logger.error(
      `HTTP ${status} - ${JSON.stringify(responsePayload)}`,
      exception instanceof Error ? exception.stack : undefined,
      'AllExceptionsFilter',
    );

    httpAdapter.reply(response, responsePayload, status);
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
