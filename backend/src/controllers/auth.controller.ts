import { Request, Response } from 'express';
import authService from '../services/auth.service';
import { IUser, UserRole } from '../interfaces/user.interface';

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const userData: IUser = {
        email: req.body.email,
        password: req.body.password,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        role: req.body.role as UserRole,
        company: req.body.company,
        position: req.body.position,
        location: req.body.location,
        bio: req.body.bio,
        phone: req.body.phone
      };

      const user = await authService.register(userData);
      res.status(201).json({ success: true, data: user });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ 
        success: false, 
        message: error.message || 'Error registering user' 
      });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ 
          success: false, 
          message: 'Email and password are required' 
        });
      }

      const result = await authService.login(email, password);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ 
        success: false, 
        message: error.message || 'Error during login' 
      });
    }
  }
}

export default new AuthController();