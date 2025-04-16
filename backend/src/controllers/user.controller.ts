import { Request, Response } from 'express';
import userService from '../services/user.service';

export class UserController {
  async getCurrentUser(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ 
          success: false, 
          message: 'Not authenticated' 
        });
      }

      const user = await userService.getUserById(userId);
      res.status(200).json({ success: true, data: user });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ 
        success: false, 
        message: error.message || 'Error fetching user' 
      });
    }
  }

  async getUserById(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.id);
      const user = await userService.getUserById(userId);
      res.status(200).json({ success: true, data: user });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ 
        success: false, 
        message: error.message || 'Error fetching user' 
      });
    }
  }

  async updateUser(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ 
          success: false, 
          message: 'Not authenticated' 
        });
      }

      const userData = req.body;
      const updatedUser = await userService.updateUser(userId, userData);
      res.status(200).json({ success: true, data: updatedUser });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ 
        success: false, 
        message: error.message || 'Error updating user' 
      });
    }
  }

  async getAllUsers(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const result = await userService.getAllUsers(page, limit);
      res.status(200).json({ 
        success: true, 
        data: result.users,
        meta: {
          total: result.total,
          page,
          limit,
          pages: Math.ceil(result.total / limit)
        }
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ 
        success: false, 
        message: error.message || 'Error fetching users' 
      });
    }
  }

  async deleteUser(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.id);
      await userService.deleteUser(userId);
      res.status(200).json({ 
        success: true, 
        message: 'User deleted successfully' 
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ 
        success: false, 
        message: error.message || 'Error deleting user' 
      });
    }
  }
}

export default new UserController();