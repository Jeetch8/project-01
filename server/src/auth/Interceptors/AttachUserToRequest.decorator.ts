import {
  BadGatewayException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { verify } from 'jsonwebtoken';

@Injectable()
export class AttachUserToRequest implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      request.user = undefined;
      return next.handle();
    }

    try {
      const token = authHeader.split('Bearer ')[1];
      const decoded = verify(token, process.env.JWT_ACCESS_TOKEN_SECRET!);
      request.user = decoded;
    } catch (err) {
      request.user = undefined;
    }

    return next.handle();
  }
}
