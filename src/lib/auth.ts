import { NextRequest } from 'next/server';
import { jwtVerify, SignJWT } from 'jose';
import prisma from './db';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'xuanlv-ai-default-secret-change-me'
);

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

export async function createToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(process.env.JWT_EXPIRES_IN || '7d')
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

export async function getCurrentUser(
  request: NextRequest
): Promise<JWTPayload | null> {
  const token = request.cookies.get('xuanlv-token')?.value;
  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload) return null;

  // Check if user is banned
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { isBanned: true },
  });

  if (user?.isBanned) return null;

  return payload;
}

export async function requireAdmin(
  request?: NextRequest
): Promise<JWTPayload> {
  // For admin routes that may not have request context
  if (!request) {
    throw new Error('Unauthorized');
  }

  const user = await getCurrentUser(request);
  if (!user || user.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }

  return user;
}
