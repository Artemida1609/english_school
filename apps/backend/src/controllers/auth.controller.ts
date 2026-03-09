import { Request, Response } from 'express'
import * as bcrypt from 'bcryptjs'
import * as jwt from 'jsonwebtoken'
import { prisma } from '../config/prisma'
import { AuthRequest } from '../middleware/auth.middleware'

const generateTokens = (payload: { id: string; email: string; role: string }) => {
  const secret = process.env.JWT_SECRET || process.env.JWT_SECRET_KEY
  const refreshSecret = process.env.JWT_REFRESH_SECRET || process.env.JWT_REFRESH_SECRET_KEY
  if (!secret || !refreshSecret) {
    throw new Error('JWT_SECRET and JWT_REFRESH_SECRET must be set in environment')
  }
  const accessToken = jwt.sign(payload, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  } as jwt.SignOptions)

  const refreshToken = jwt.sign(payload, refreshSecret, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  } as jwt.SignOptions)

  return { accessToken, refreshToken }
}

// POST /api/auth/register
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name } = req.body

    if (!email || !password || !name) {
      res.status(400).json({ message: 'Email, password and name are required' })
      return
    }

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      res.status(409).json({ message: 'Email already in use' })
      return
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: { email, passwordHash, name },
    })

    const tokens = generateTokens({ id: user.id, email: user.email, role: user.role })

    res.status(201).json({
      message: 'Registration successful',
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      ...tokens,
    })
  } catch (error) {
    console.error('Register error:', error)
    const msg = error instanceof Error ? error.message : 'Internal server error'
    res.status(500).json({
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : msg,
    })
  }
}

// POST /api/auth/login
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' })
      return
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      res.status(401).json({ message: 'Invalid email or password' })
      return
    }

    const isValid = await bcrypt.compare(password, user.passwordHash)
    if (!isValid) {
      res.status(401).json({ message: 'Invalid email or password' })
      return
    }

    const tokens = generateTokens({ id: user.id, email: user.email, role: user.role })

    res.json({
      message: 'Login successful',
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      ...tokens,
    })
  } catch (error) {
    console.error('Login error:', error)
    const msg = error instanceof Error ? error.message : 'Internal server error'
    res.status(500).json({
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : msg,
    })
  }
}

// GET /api/auth/me
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        _count: { select: { enrollments: true } },
      },
    })

    if (!user) {
      res.status(404).json({ message: 'User not found' })
      return
    }

    res.json(user)
  } catch (error) {
    console.error('GetMe error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// POST /api/auth/refresh
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body
    if (!refreshToken) {
      res.status(400).json({ message: 'Refresh token required' })
      return
    }

    const refreshSecret = process.env.JWT_REFRESH_SECRET || process.env.JWT_REFRESH_SECRET_KEY
    if (!refreshSecret) throw new Error('JWT_REFRESH_SECRET not configured')
    const decoded = jwt.verify(refreshToken, refreshSecret) as {
      id: string; email: string; role: string
    }

    const tokens = generateTokens({ id: decoded.id, email: decoded.email, role: decoded.role })
    res.json(tokens)
  } catch {
    res.status(401).json({ message: 'Invalid refresh token' })
  }
}