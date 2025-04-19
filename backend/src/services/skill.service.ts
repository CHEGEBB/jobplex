// src/services/skill.service.ts
import { Pool } from 'pg';
import { Skill, SkillCreateDTO, SkillUpdateDTO } from '../interfaces/skill.interface';
import pool from '../config/db.config';

export class SkillService {
  private db: Pool;

  constructor() {
    this.db = pool;
  }

  /**
   * Get all skills for a specific user
   */
  async getUserSkills(userId: number): Promise<Skill[]> {
    const query = `
      SELECT id, name, level, category, years_experience as "yearsExperience", 
             created_at as "createdAt", updated_at as "updatedAt"
      FROM skills 
      WHERE user_id = $1
      ORDER BY category, name
    `;
    
    const { rows } = await this.db.query(query, [userId]);
    return rows;
  }

  /**
   * Get skills by category for a specific user
   */
  async getUserSkillsByCategory(userId: number, category: string): Promise<Skill[]> {
    const query = `
      SELECT id, name, level, category, years_experience as "yearsExperience", 
             created_at as "createdAt", updated_at as "updatedAt"
      FROM skills 
      WHERE user_id = $1 AND category = $2
      ORDER BY name
    `;
    
    const { rows } = await this.db.query(query, [userId, category]);
    return rows;
  }

  /**
   * Get a specific skill by ID
   */
  async getSkillById(skillId: number): Promise<Skill | null> {
    const query = `
      SELECT id, name, level, category, years_experience as "yearsExperience", 
             user_id as "userId", created_at as "createdAt", updated_at as "updatedAt"
      FROM skills 
      WHERE id = $1
    `;
    
    const { rows } = await this.db.query(query, [skillId]);
    return rows.length ? rows[0] : null;
  }

  /**
   * Create a new skill for a user
   */
  async createSkill(userId: number, skillData: SkillCreateDTO): Promise<Skill> {
    const query = `
      INSERT INTO skills (name, level, category, years_experience, user_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, name, level, category, years_experience as "yearsExperience", 
               user_id as "userId", created_at as "createdAt", updated_at as "updatedAt"
    `;
    
    const values = [
      skillData.name,
      skillData.level,
      skillData.category,
      skillData.yearsExperience || null,
      userId
    ];
    
    const { rows } = await this.db.query(query, values);
    return rows[0];
  }

  /**
   * Update an existing skill
   */
  async updateSkill(skillId: number, userId: number, skillData: SkillUpdateDTO): Promise<Skill | null> {
    // First check if skill exists and belongs to the user
    const skill = await this.getSkillById(skillId);
    if (!skill || skill.userId !== userId) {
      return null;
    }
    
    // Build the SET clause dynamically based on provided fields
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;
    
    if (skillData.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(skillData.name);
    }
    
    if (skillData.level !== undefined) {
      updates.push(`level = $${paramIndex++}`);
      values.push(skillData.level);
    }
    
    if (skillData.category !== undefined) {
      updates.push(`category = $${paramIndex++}`);
      values.push(skillData.category);
    }
    
    if (skillData.yearsExperience !== undefined) {
      updates.push(`years_experience = $${paramIndex++}`);
      values.push(skillData.yearsExperience);
    }
    
    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    
    // Add skill ID and user ID to values array
    values.push(skillId);
    values.push(userId);
    
    const query = `
      UPDATE skills
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex++} AND user_id = $${paramIndex++}
      RETURNING id, name, level, category, years_experience as "yearsExperience", 
                user_id as "userId", created_at as "createdAt", updated_at as "updatedAt"
    `;
    
    const { rows } = await this.db.query(query, values);
    return rows.length ? rows[0] : null;
  }

  /**
   * Delete a skill
   */
  async deleteSkill(skillId: number, userId: number): Promise<boolean> {
    const query = `
      DELETE FROM skills
      WHERE id = $1 AND user_id = $2
      RETURNING id
    `;
    
    const { rowCount } = await this.db.query(query, [skillId, userId]);
    return (rowCount ?? 0) > 0;
  }

  /**
   * Check if a user owns a specific skill
   */
  async isUserSkill(skillId: number, userId: number): Promise<boolean> {
    const query = 'SELECT id FROM skills WHERE id = $1 AND user_id = $2';
    const { rowCount } = await this.db.query(query, [skillId, userId]);
    return (rowCount ?? 0) > 0;
  }
}

export default new SkillService();