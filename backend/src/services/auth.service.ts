import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db.config';
import { IUser, UserRole, IUserResponse } from '../interfaces/user.interface';

import { Secret } from 'jsonwebtoken';

const JWT_SECRET: Secret = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

export class AuthService {
  async register(userData: IUser): Promise<IUserResponse> {
    const { email, password, firstName, lastName, role } = userData;

    // Check if user with the same email already exists
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if ((existingUser.rowCount ?? 0) > 0) {
      throw { statusCode: 400, message: 'User with this email already exists' };
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert new user
    const result = await pool.query(
      `INSERT INTO users (email, password, first_name, last_name, role, 
        company, position, location, bio, phone, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW()) 
       RETURNING id, email, first_name, last_name, role, company, position, location, bio, phone, created_at, updated_at`,
      [
        email,
        hashedPassword,
        firstName,
        lastName,
        role,
        userData.company || null,
        userData.position || null,
        userData.location || null,
        userData.bio || null,
        userData.phone || null,
      ]
    );

    const user = result.rows[0];

    return {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      company: user.company,
      position: user.position,
      location: user.location,
      bio: user.bio,
      phone: user.phone,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    };
  }

  async login(email: string, password: string): Promise<{ user: IUserResponse; token: string }> {
    // Find user by email
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rowCount === 0) {
      throw { statusCode: 401, message: 'Invalid credentials' };
    }

    const user = result.rows[0];

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw { statusCode: 401, message: 'Invalid credentials' };
    }
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: typeof JWT_EXPIRES_IN === 'string' ? parseInt(JWT_EXPIRES_IN, 10) : JWT_EXPIRES_IN }
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        company: user.company,
        position: user.position,
        location: user.location,
        bio: user.bio,
        phone: user.phone,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      },
      token
    };
  }
}

export default new AuthService();