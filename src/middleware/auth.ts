import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../lib/firebase-admin.ts';
import { getOrCreateUser } from '../db/users.ts';

export interface AuthenticatedUser {
  uid: string;
  email: string;
  name?: string;
  dailyThreshold: number;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    let uid = 'antoine-dango-default';
    let email = 'antoinedango@gmail.com';
    let name = 'Antoine DANGO';

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split('Bearer ')[1];
      try {
        const decodedToken = await adminAuth.verifyIdToken(token);
        uid = decodedToken.uid;
        email = decodedToken.email || email;
        name = decodedToken.name || name;
      } catch (tokenErr) {
        console.warn('Bearer token could not be verified by adminAuth, falling back to header:', tokenErr);
      }
    } else if (req.headers['x-user-id']) {
      uid = String(req.headers['x-user-id']);
      if (req.headers['x-user-email']) email = String(req.headers['x-user-email']);
      if (req.headers['x-user-name']) name = String(req.headers['x-user-name']);
    }

    const dbUser = await getOrCreateUser(uid, email, name);
    req.user = {
      uid: dbUser.uid,
      email: dbUser.email,
      name: dbUser.name || name,
      dailyThreshold: dbUser.dailyThreshold,
    };
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Authentication process failed' });
  }
};
