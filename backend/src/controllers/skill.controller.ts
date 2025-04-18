import { Request, Response } from 'express';
import skillService from '../services/skill.service';
import { ISkill, IUserSkill } from '../interfaces/skill.interface';
import { UserRole } from '../interfaces/user.interface';

export class SkillController {
  async createSkill(req: Request, res: Response) {
    try {
      // Only jobseekers can create new skills
      if (req.user?.role !== UserRole.JOBSEEKER) {
        return res.status(403).json({
          success: false,
          message: 'Only jobseekers can create new skills'
        });
      }

      const skillData: ISkill = {
        name: req.body.name,
        category: req.body.category
      };

      const skill = await skillService.createSkill(skillData);
      res.status(201).json({ success: true, data: skill });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ 
        success: false, 
        message: error.message || 'Error creating skill' 
      });
    }
  }

  async getAllSkills(req: Request, res: Response) {
    try {
      const skills = await skillService.getAllSkills();
      res.status(200).json({ success: true, data: skills });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ 
        success: false, 
        message: error.message || 'Error fetching skills' 
      });
    }
  }

  async getSkillById(req: Request, res: Response) {
    try {
      const skillId = parseInt(req.params.id);
      const skill = await skillService.getSkillById(skillId);
      res.status(200).json({ success: true, data: skill });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ 
        success: false, 
        message: error.message || 'Error fetching skill' 
      });
    }
  }

  async addUserSkill(req: Request, res: Response) {
    try {
      const userId = req.user?.id || parseInt(req.body.userId); // Allow passing userId in request body for testing
      
      if (!userId) {
        return res.status(401).json({ 
          success: false, 
          message: 'User ID is required' 
        });
      }

      const userSkillData: IUserSkill = {
        userId: userId,
        skillId: parseInt(req.body.skillId),
        proficiencyLevel: parseInt(req.body.proficiencyLevel),
        yearsOfExperience: req.body.yearsOfExperience ? parseInt(req.body.yearsOfExperience) : undefined
      };

      const userSkill = await skillService.addUserSkill(userSkillData);
      res.status(201).json({ success: true, data: userSkill });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ 
        success: false, 
        message: error.message || 'Error adding user skill' 
      });
    }
  }

  async getUserSkills(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.userId);
      const userSkills = await skillService.getUserSkills(userId);
      res.status(200).json({ success: true, data: userSkills });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ 
        success: false, 
        message: error.message || 'Error fetching user skills' 
      });
    }
  }

  async removeUserSkill(req: Request, res: Response) {
    try {
      const userId = req.user?.id || parseInt(req.query.userId as string); // Allow passing userId in query for testing
      
      if (!userId) {
        return res.status(401).json({ 
          success: false, 
          message: 'User ID is required' 
        });
      }

      const skillId = parseInt(req.params.skillId);
      await skillService.removeUserSkill(userId, skillId);
      
      res.status(200).json({ 
        success: true, 
        message: 'User skill removed successfully' 
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ 
        success: false, 
        message: error.message || 'Error removing user skill' 
      });
    }
  }
}

export default new SkillController();
