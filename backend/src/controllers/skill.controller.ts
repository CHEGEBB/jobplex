// src/controllers/skill.controller.ts
import { Request, Response } from 'express';
import skillService from '../services/skill.service';
import { SkillCreateDTO, SkillUpdateDTO } from '../interfaces/skill.interface';

export class SkillController {
  /**
   * Get all skills for the authenticated user
   */
  async getUserSkills(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user || !req.user.id) {
        res.status(401).json({ message: 'Authentication required' });
        return;
      }

      const skills = await skillService.getUserSkills(req.user.id);
      res.status(200).json(skills);
    } catch (error) {
      console.error('Error fetching user skills:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * Get user skills by category
   */
  async getUserSkillsByCategory(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user || !req.user.id) {
        res.status(401).json({ message: 'Authentication required' });
        return;
      }

      const { category } = req.params;
      
      // Validate category
      const validCategories = ['technical', 'soft', 'language', 'tool'];
      if (!validCategories.includes(category)) {
        res.status(400).json({ message: 'Invalid category. Must be technical, soft, language, or tool.' });
        return;
      }

      const skills = await skillService.getUserSkillsByCategory(req.user.id, category);
      res.status(200).json(skills);
    } catch (error) {
      console.error('Error fetching user skills by category:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * Get a specific skill by ID
   */
  async getSkillById(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user || !req.user.id) {
        res.status(401).json({ message: 'Authentication required' });
        return;
      }

      const skillId = parseInt(req.params.id);
      if (isNaN(skillId)) {
        res.status(400).json({ message: 'Invalid skill ID' });
        return;
      }

      const skill = await skillService.getSkillById(skillId);
      
      if (!skill) {
        res.status(404).json({ message: 'Skill not found' });
        return;
      }
      
      // Check if the skill belongs to the requesting user
      if (skill.userId !== req.user.id) {
        res.status(403).json({ message: 'Access denied: You do not have permission to view this skill' });
        return;
      }

      res.status(200).json(skill);
    } catch (error) {
      console.error('Error fetching skill by ID:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * Create a new skill
   */
  async createSkill(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user || !req.user.id) {
        res.status(401).json({ message: 'Authentication required' });
        return;
      }

      const skillData: SkillCreateDTO = req.body;
      
      // Validate required fields
      if (!skillData.name || !skillData.level || !skillData.category) {
        res.status(400).json({ message: 'Name, level, and category are required' });
        return;
      }
      
      // Validate level range (1-5)
      if (skillData.level < 1 || skillData.level > 5) {
        res.status(400).json({ message: 'Skill level must be between 1 and 5' });
        return;
      }
      
      // Validate category
      const validCategories = ['technical', 'soft', 'language', 'tool'];
      if (!validCategories.includes(skillData.category as string)) {
        res.status(400).json({ message: 'Invalid category. Must be technical, soft, language, or tool.' });
        return;
      }

      const newSkill = await skillService.createSkill(req.user.id, skillData);
      res.status(201).json(newSkill);
    } catch (error) {
      console.error('Error creating skill:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * Update an existing skill
   */
  async updateSkill(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user || !req.user.id) {
        res.status(401).json({ message: 'Authentication required' });
        return;
      }

      const skillId = parseInt(req.params.id);
      if (isNaN(skillId)) {
        res.status(400).json({ message: 'Invalid skill ID' });
        return;
      }

      const skillData: SkillUpdateDTO = req.body;
      
      // Validate level range if provided
      if (skillData.level !== undefined && (skillData.level < 1 || skillData.level > 5)) {
        res.status(400).json({ message: 'Skill level must be between 1 and 5' });
        return;
      }
      
      // Validate category if provided
      if (skillData.category !== undefined) {
        const validCategories = ['technical', 'soft', 'language', 'tool'];
        if (!validCategories.includes(skillData.category as string)) {
          res.status(400).json({ message: 'Invalid category. Must be technical, soft, language, or tool.' });
          return;
        }
      }

      // Check if skill exists and belongs to user
      const isUserSkill = await skillService.isUserSkill(skillId, req.user.id);
      if (!isUserSkill) {
        res.status(404).json({ message: 'Skill not found or access denied' });
        return;
      }

      const updatedSkill = await skillService.updateSkill(skillId, req.user.id, skillData);
      if (!updatedSkill) {
        res.status(404).json({ message: 'Skill not found or update failed' });
        return;
      }

      res.status(200).json(updatedSkill);
    } catch (error) {
      console.error('Error updating skill:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * Delete a skill
   */
  async deleteSkill(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user || !req.user.id) {
        res.status(401).json({ message: 'Authentication required' });
        return;
      }

      const skillId = parseInt(req.params.id);
      if (isNaN(skillId)) {
        res.status(400).json({ message: 'Invalid skill ID' });
        return;
      }

      const isDeleted = await skillService.deleteSkill(skillId, req.user.id);
      if (!isDeleted) {
        res.status(404).json({ message: 'Skill not found or already deleted' });
        return;
      }

      res.status(200).json({ message: 'Skill deleted successfully' });
    } catch (error) {
      console.error('Error deleting skill:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

export default new SkillController();