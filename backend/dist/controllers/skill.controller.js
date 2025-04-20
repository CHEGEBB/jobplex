"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserSkills = exports.deleteSkill = exports.updateSkill = exports.createSkill = exports.getSkillById = exports.getAllSkills = void 0;
const db_config_1 = __importDefault(require("../config/db.config"));
// Get all skills
const getAllSkills = async (req, res) => {
    try {
        const result = await db_config_1.default.query('SELECT * FROM skills ORDER BY name ASC');
        res.json(result.rows);
    }
    catch (error) {
        console.error('Error fetching skills:', error);
        res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : String(error) });
    }
};
exports.getAllSkills = getAllSkills;
// Get skill by ID
const getSkillById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db_config_1.default.query('SELECT * FROM skills WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Skill not found' });
        }
        res.json(result.rows[0]);
    }
    catch (error) {
        console.error('Error fetching skill:', error);
        res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : String(error) });
    }
};
exports.getSkillById = getSkillById;
// Create new skill (job seeker only)
const createSkill = async (req, res) => {
    try {
        const userId = req.user?.id;
        // Check if user ID exists
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated or missing ID' });
        }
        const { name, proficiency, yearsExperience } = req.body;
        // Log the request data for debugging
        console.log('Create skill request:', { userId, name, proficiency, yearsExperience });
        // Validate required fields
        if (!name || !proficiency) {
            return res.status(400).json({ message: 'Name and proficiency are required' });
        }
        // Validate proficiency value
        const validProficiencies = ['beginner', 'intermediate', 'advanced', 'expert'];
        if (!validProficiencies.includes(proficiency)) {
            return res.status(400).json({
                message: `Proficiency must be one of: ${validProficiencies.join(', ')}`
            });
        }
        // Check if skill with same name already exists for this user
        const existingSkill = await db_config_1.default.query('SELECT * FROM skills WHERE user_id = $1 AND LOWER(name) = LOWER($2)', [userId, name]);
        if (existingSkill.rows.length > 0) {
            return res.status(409).json({
                message: 'You already have a skill with this name'
            });
        }
        // Insert new skill with proper error handling
        const client = await db_config_1.default.connect();
        try {
            await client.query('BEGIN');
            const result = await client.query('INSERT INTO skills (user_id, name, proficiency, years_experience) VALUES ($1, $2, $3, $4) RETURNING *', [userId, name, proficiency, yearsExperience || null]);
            await client.query('COMMIT');
            res.status(201).json(result.rows[0]);
        }
        catch (insertError) {
            await client.query('ROLLBACK');
            console.error('Database error when creating skill:', insertError);
            throw insertError; // This will be caught by the outer try-catch
        }
        finally {
            client.release();
        }
    }
    catch (error) {
        console.error('Error creating skill:', error);
        // More detailed error response
        res.status(500).json({
            message: 'Server error',
            error: error instanceof Error ? error.message : String(error)
        });
    }
};
exports.createSkill = createSkill;
// Update skill (job seeker who created it only)
const updateSkill = async (req, res) => {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ message: 'User not authenticated or missing ID' });
    }
    const { name, proficiency, yearsExperience } = req.body;
    // Validate that at least one field is being updated
    if (!name && !proficiency && yearsExperience === undefined) {
        return res.status(400).json({ message: 'No update fields provided' });
    }
    // Validate proficiency if provided
    if (proficiency) {
        const validProficiencies = ['beginner', 'intermediate', 'advanced', 'expert'];
        if (!validProficiencies.includes(proficiency)) {
            return res.status(400).json({
                message: `Proficiency must be one of: ${validProficiencies.join(', ')}`
            });
        }
    }
    try {
        // Check if skill exists and belongs to the user
        const skillCheck = await db_config_1.default.query('SELECT * FROM skills WHERE id = $1', [id]);
        if (skillCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Skill not found' });
        }
        if (skillCheck.rows[0].user_id !== userId) {
            return res.status(403).json({ message: 'You can only update your own skills' });
        }
        // Check for name uniqueness if updating name
        if (name) {
            const nameCheck = await db_config_1.default.query('SELECT * FROM skills WHERE user_id = $1 AND LOWER(name) = LOWER($2) AND id != $3', [userId, name, id]);
            if (nameCheck.rows.length > 0) {
                return res.status(409).json({ message: 'You already have another skill with this name' });
            }
        }
        // Update skill
        const result = await db_config_1.default.query(`UPDATE skills 
       SET name = COALESCE($1, name), 
           proficiency = COALESCE($2, proficiency), 
           years_experience = COALESCE($3, years_experience),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4 AND user_id = $5
       RETURNING *`, [name, proficiency, yearsExperience, id, userId]);
        res.json(result.rows[0]);
    }
    catch (error) {
        console.error('Error updating skill:', error);
        res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : String(error) });
    }
};
exports.updateSkill = updateSkill;
// Delete skill (job seeker who created it only)
const deleteSkill = async (req, res) => {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ message: 'User not authenticated or missing ID' });
    }
    try {
        // Check if skill exists and belongs to the user
        const skillCheck = await db_config_1.default.query('SELECT * FROM skills WHERE id = $1', [id]);
        if (skillCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Skill not found' });
        }
        if (skillCheck.rows[0].user_id !== userId) {
            return res.status(403).json({ message: 'You can only delete your own skills' });
        }
        // Delete skill
        await db_config_1.default.query('DELETE FROM skills WHERE id = $1 AND user_id = $2', [id, userId]);
        res.json({ message: 'Skill deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting skill:', error);
        res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : String(error) });
    }
};
exports.deleteSkill = deleteSkill;
// Get skills for current user (job seeker only)
const getUserSkills = async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ message: 'User not authenticated or missing ID' });
    }
    try {
        const result = await db_config_1.default.query('SELECT * FROM skills WHERE user_id = $1 ORDER BY name ASC', [userId]);
        res.json(result.rows);
    }
    catch (error) {
        console.error('Error fetching user skills:', error);
        res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : String(error) });
    }
};
exports.getUserSkills = getUserSkills;
