import { Request } from 'express';

export interface jwtAuthTokenPayload {
  userId: string;
  email: string;
}

export type AuthRequest = Request & { user: jwtAuthTokenPayload };
