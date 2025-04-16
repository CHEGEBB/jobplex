import { pool } from '../config/db.config';
import { ISkill, IUserSkill } from '../interfaces/skill.interface';

class SkillService {
  async createSkill(skillData: ISkill): Promise<ISkill> {
    // Check if skill already exists
    const existingSkill = await pool.query(
      'SELECT * FROM skills WHERE name = $1',
      [skillData.name]
    );

    if (existingSkill.rowCount && existingSkill.rowCount > 0) {
      throw { statusCode: 400, message: 'Skill already exists' };
    }

    // Create new skill
    const result = await pool.query(
      `INSERT INTO skills (name, category, created_at, updated_at) 
       VALUES ($1, $2, NOW(), NOW()) 
       RETURNING *`,
      [skillData.name, skillData.category]
    );

    const skill = result.rows[0];
    return {
      id: skill.id,
      name: skill.name,
      category: skill.category,
      createdAt: skill.created_at,
      updatedAt: skill.updated_at
    };
  }

  async getAllSkills(): Promise<ISkill[]> {
    const result = await pool.query(
      'SELECT * FROM skills ORDER BY category, name'
    );

    return result.rows.map(skill => ({
      id: skill.id,
      name: skill.name,
      category: skill.category,
      createdAt: skill.created_at,
      updatedAt: skill.updated_at
    }));
  }

  async getSkillById(id: number): Promise<ISkill> {
    const result = await pool.query(
      'SELECT * FROM skills WHERE id = $1',
      [id]
    );

    if (result.rowCount === 0) {
      throw { statusCode: 404, message: 'Skill not found' };
    }

    const skill = result.rows[0];
    return {
      id: skill.id,
      name: skill.name,
      category: skill.category,
      createdAt: skill.created_at,
      updatedAt: skill.updated_at
    };
  }

  async addUserSkill(userSkillData: IUserSkill): Promise<IUserSkill> {
    // Check if user already has this skill
    const existingUserSkill = await pool.query(
      'SELECT * FROM user_skills WHERE user_id = $1 AND skill_id = $2',
      [userSkillData.userId, userSkillData.skillId]
    );

    if (existingUserSkill.rowCount && existingUserSkill.rowCount > 0) {
      // Update existing user skill
      const result = await pool.query(
        `UPDATE user_skills 
         SET proficiency_level = $1, years_of_experience = $2, updated_at = NOW() 
         WHERE user_id = $3 AND skill_id = $4 
         RETURNING *`,
        [
          userSkillData.proficiencyLevel,
          userSkillData.yearsOfExperience || null,
          userSkillData.userId,
          userSkillData.skillId
        ]
      );

      const userSkill = result.rows[0];
      return {
        id: userSkill.id,
        userId: userSkill.user_id,
        skillId: userSkill.skill_id,
        proficiencyLevel: userSkill.proficiency_level,
        yearsOfExperience: userSkill.years_of_experience,
        createdAt: userSkill.created_at,
        updatedAt: userSkill.updated_at
      };
    } else {
      // Create new user skill
      const result = await pool.query(
        `INSERT INTO user_skills (user_id, skill_id, proficiency_level, years_of_experience, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, NOW(), NOW()) 
         RETURNING *`,
        [
          userSkillData.userId,
          userSkillData.skillId,
          userSkillData.proficiencyLevel,
          userSkillData.yearsOfExperience || null
        ]
      );

      const userSkill = result.rows[0];
      return {
        id: userSkill.id,
        userId: userSkill.user_id,
        skillId: userSkill.skill_id,
        proficiencyLevel: userSkill.proficiency_level,
        yearsOfExperience: userSkill.years_of_experience,
        createdAt: userSkill.created_at,
        updatedAt: userSkill.updated_at
      };
    }
  }

  async getUserSkills(userId: number): Promise<Array<IUserSkill & { skillName: string; category: string }>> {
    const result = await pool.query(
      `SELECT us.*, s.name as skill_name, s.category 
       FROM user_skills us 
       JOIN skills s ON us.skill_id = s.id 
       WHERE us.user_id = $1 
       ORDER BY us.proficiency_level DESC`,
      [userId]
    );

    return result.rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      skillId: row.skill_id,
      proficiencyLevel: row.proficiency_level,
      yearsOfExperience: row.years_of_experience,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      skillName: row.skill_name,
      category: row.category
    }));
  }

  async removeUserSkill(userId: number, skillId: number): Promise<void> {
    const result = await pool.query(
      'DELETE FROM user_skills WHERE user_id = $1 AND skill_id = $2',
      [userId, skillId]
    );

    if (result.rowCount === 0) {
      throw { statusCode: 404, message: 'User skill not found' };
    }
  }
}

export default new SkillService();