import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { prisma } from './prisma';

const getSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret && process.env.NODE_ENV === 'production') {
    throw new Error('FATAL: JWT_SECRET environment variable is missing in production environment.');
  }
  return new TextEncoder().encode(secret || 'hometown_hub_secure_jwt_secret_key_2026_roots_connected');
};

export const COOKIE_NAME = 'hometown_session';

export interface UserPayload {
  id: string;
  email: string;
  name: string;
  role: string;
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

export async function signJWT(payload: { id: string; email: string; name: string; role: string }) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSecret());
}

export async function verifyJWT(token: string) {
  try {
    const verified = await jwtVerify(token, getSecret());
    return verified.payload as unknown as { id: string; email: string; name: string; role: string };
  } catch (err) {
    return null;
  }
}

export async function getSessionUser() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const payload = await verifyJWT(token);
    if (!payload?.id) return null;

    try {
      const user = await prisma.user.findUnique({
        where: { id: payload.id },
        include: { profile: true, panditProfile: true },
      });
      if (user) {
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          profile: user.profile,
          panditProfile: user.panditProfile,
        };
      }
    } catch {
      return {
        id: payload.id,
        email: payload.email,
        name: payload.name,
        role: payload.role,
        profile: null,
        panditProfile: null,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export const getAuthUser = getSessionUser;
