import * as jwt from 'jsonwebtoken'

interface JWTPayload {
  userId: string
  email: string
  role: string
}

interface UserForToken {
  id: string
  email: string
  role: string
}

export function generateToken(user: UserForToken): string {
  const jwtSecret = process.env['JWT_SECRET'] || 'dev-secret-key-change-in-production'
  
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    role: user.role
  }
  
  return jwt.sign(payload, jwtSecret, { expiresIn: '7d' })
}

export function verifyToken(token: string): JWTPayload {
  const jwtSecret = process.env['JWT_SECRET'] || 'dev-secret-key-change-in-production'
  return jwt.verify(token, jwtSecret) as JWTPayload
}
