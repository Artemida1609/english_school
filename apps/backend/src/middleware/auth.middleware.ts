import { Request, Response, NextFunction } from 'express'
import * as jwt from 'jsonwebtoken'

// Extend Express Request type to include user
export interface AuthRequest extends Request {
  user?: {
    id: string
    email: string
    role: string
  }
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'No token provided' })
    return
  }

  const token = authHeader.split(' ')[1]

  try {
    const secret = process.env.JWT_SECRET || process.env.JWT_SECRET_KEY
    if (!secret) {
      res.status(503).json({ message: 'Server misconfigured' })
      return
    }
    const decoded = jwt.verify(token, secret) as {
      id: string
      email: string
      role: string
    }
    req.user = decoded
    next()
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' })
  }
}

// Middleware to check role
export const requireRole = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ message: 'Forbidden: insufficient permissions' })
      return
    }
    next()
  }
}
