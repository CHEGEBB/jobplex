"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCertificate = exports.updateCertificate = exports.createCertificate = exports.getMyCertificates = exports.deleteProject = exports.updateProject = exports.createProject = exports.getMyProjects = exports.deleteSkill = exports.updateSkill = exports.createSkill = exports.getMySkills = void 0;
const db_config_1 = __importDefault(require("../config/db.config"));
// SKILLS CONTROLLERS
const getMySkills = async (req, res) => {
    try {
        // Ensure user object is attached from auth middleware
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        const userId = req.user.id;
        console.log(`Fetching skills for user ID: ${userId}`);
        const result = await db_config_1.default.query('SELECT * FROM skills WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
        return res.status(200).json(result.rows);
    }
    catch (error) {
        console.error('Error fetching skills:', error);
        return res.status(500).json({ message: 'Failed to fetch skills' });
    }
};
exports.getMySkills = getMySkills;
const createSkill = async (req, res) => {
    try {
        // Ensure user object is attached from auth middleware
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        const userId = req.user.id;
        const { name, proficiency, years_experience } = req.body;
        // Validate input
        if (!name || !proficiency) {
            return res.status(400).json({ message: 'Name and proficiency are required' });
        }
        // Validate proficiency
        const validProficiencies = ['beginner', 'intermediate', 'advanced', 'expert'];
        if (!validProficiencies.includes(proficiency)) {
            return res.status(400).json({
                message: `Proficiency must be one of: ${validProficiencies.join(', ')}`
            });
        }
        // Insert skill
        const result = await db_config_1.default.query(`INSERT INTO skills (user_id, name, proficiency, years_experience) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`, [userId, name, proficiency, years_experience || 0]);
        return res.status(201).json(result.rows[0]);
    }
    catch (error) {
        console.error('Error creating skill:', error);
        return res.status(500).json({ message: 'Failed to create skill' });
    }
};
exports.createSkill = createSkill;
const updateSkill = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        const userId = req.user.id;
        const skillId = parseInt(req.params.id);
        const { name, proficiency, years_experience } = req.body;
        // Validate input
        if (!name || !proficiency) {
            return res.status(400).json({ message: 'Name and proficiency are required' });
        }
        // Validate proficiency
        const validProficiencies = ['beginner', 'intermediate', 'advanced', 'expert'];
        if (!validProficiencies.includes(proficiency)) {
            return res.status(400).json({
                message: `Proficiency must be one of: ${validProficiencies.join(', ')}`
            });
        }
        // Check if skill exists and belongs to user
        const checkResult = await db_config_1.default.query('SELECT * FROM skills WHERE id = $1', [skillId]);
        if (checkResult.rows.length === 0) {
            return res.status(404).json({ message: 'Skill not found' });
        }
        if (checkResult.rows[0].user_id !== userId) {
            return res.status(403).json({ message: 'You can only update your own skills' });
        }
        // Update skill
        const result = await db_config_1.default.query(`UPDATE skills 
       SET name = $1, proficiency = $2, years_experience = $3, updated_at = CURRENT_TIMESTAMP
       WHERE id = $4 AND user_id = $5
       RETURNING *`, [name, proficiency, years_experience || 0, skillId, userId]);
        return res.status(200).json(result.rows[0]);
    }
    catch (error) {
        console.error('Error updating skill:', error);
        return res.status(500).json({ message: 'Failed to update skill' });
    }
};
exports.updateSkill = updateSkill;
const deleteSkill = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        const userId = req.user.id;
        const skillId = parseInt(req.params.id);
        // Check if skill exists and belongs to user
        const checkResult = await db_config_1.default.query('SELECT * FROM skills WHERE id = $1', [skillId]);
        if (checkResult.rows.length === 0) {
            return res.status(404).json({ message: 'Skill not found' });
        }
        if (checkResult.rows[0].user_id !== userId) {
            return res.status(403).json({ message: 'You can only delete your own skills' });
        }
        // Delete skill
        await db_config_1.default.query('DELETE FROM skills WHERE id = $1 AND user_id = $2', [skillId, userId]);
        return res.status(200).json({ message: 'Skill deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting skill:', error);
        return res.status(500).json({ message: 'Failed to delete skill' });
    }
};
exports.deleteSkill = deleteSkill;
// PROJECTS CONTROLLERS
const getMyProjects = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        const userId = req.user.id;
        const result = await db_config_1.default.query('SELECT * FROM projects WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
        return res.status(200).json(result.rows);
    }
    catch (error) {
        console.error('Error fetching projects:', error);
        return res.status(500).json({ message: 'Failed to fetch projects' });
    }
};
exports.getMyProjects = getMyProjects;
const createProject = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        const userId = req.user.id;
        const { title, description, skills, github, link, image, featured } = req.body;
        // Validate input
        if (!title || !description || !skills || !Array.isArray(skills)) {
            return res.status(400).json({ message: 'Title, description, and skills array are required' });
        }
        // Insert project
        const result = await db_config_1.default.query(`INSERT INTO projects (user_id, title, description, skills, github, link, image, featured) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`, [userId, title, description, skills, github, link,
            image || 'https://via.placeholder.com/600x400', featured || false]);
        return res.status(201).json(result.rows[0]);
    }
    catch (error) {
        console.error('Error creating project:', error);
        return res.status(500).json({ message: 'Failed to create project' });
    }
};
exports.createProject = createProject;
const updateProject = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        const userId = req.user.id;
        const projectId = parseInt(req.params.id);
        const { title, description, skills, github, link, image, featured } = req.body;
        // Validate input
        if (!title || !description || !skills || !Array.isArray(skills)) {
            return res.status(400).json({ message: 'Title, description, and skills array are required' });
        }
        // Check if project exists and belongs to user
        const checkResult = await db_config_1.default.query('SELECT * FROM projects WHERE id = $1', [projectId]);
        if (checkResult.rows.length === 0) {
            return res.status(404).json({ message: 'Project not found' });
        }
        if (checkResult.rows[0].user_id !== userId) {
            return res.status(403).json({ message: 'You can only update your own projects' });
        }
        // Update project
        const result = await db_config_1.default.query(`UPDATE projects 
       SET title = $1, description = $2, skills = $3, github = $4, link = $5, 
           image = $6, featured = $7, updated_at = CURRENT_TIMESTAMP
       WHERE id = $8 AND user_id = $9
       RETURNING *`, [title, description, skills, github, link,
            image || checkResult.rows[0].image, featured, projectId, userId]);
        return res.status(200).json(result.rows[0]);
    }
    catch (error) {
        console.error('Error updating project:', error);
        return res.status(500).json({ message: 'Failed to update project' });
    }
};
exports.updateProject = updateProject;
const deleteProject = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        const userId = req.user.id;
        const projectId = parseInt(req.params.id);
        // Check if project exists and belongs to user
        const checkResult = await db_config_1.default.query('SELECT * FROM projects WHERE id = $1', [projectId]);
        if (checkResult.rows.length === 0) {
            return res.status(404).json({ message: 'Project not found' });
        }
        if (checkResult.rows[0].user_id !== userId) {
            return res.status(403).json({ message: 'You can only delete your own projects' });
        }
        // Delete project
        await db_config_1.default.query('DELETE FROM projects WHERE id = $1 AND user_id = $2', [projectId, userId]);
        return res.status(200).json({ message: 'Project deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting project:', error);
        return res.status(500).json({ message: 'Failed to delete project' });
    }
};
exports.deleteProject = deleteProject;
// CERTIFICATES CONTROLLERS
const getMyCertificates = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        const userId = req.user.id;
        const result = await db_config_1.default.query('SELECT * FROM certificates WHERE user_id = $1 ORDER BY date DESC', [userId]);
        return res.status(200).json(result.rows);
    }
    catch (error) {
        console.error('Error fetching certificates:', error);
        return res.status(500).json({ message: 'Failed to fetch certificates' });
    }
};
exports.getMyCertificates = getMyCertificates;
const createCertificate = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        const userId = req.user.id;
        const { name, issuer, date, expiry, credential_id, link } = req.body;
        // Validate input
        if (!name || !issuer || !date) {
            return res.status(400).json({ message: 'Name, issuer, and date are required' });
        }
        // Insert certificate
        const result = await db_config_1.default.query(`INSERT INTO certificates (user_id, name, issuer, date, expiry, credential_id, link) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`, [userId, name, issuer, date, expiry, credential_id, link]);
        return res.status(201).json(result.rows[0]);
    }
    catch (error) {
        console.error('Error creating certificate:', error);
        return res.status(500).json({ message: 'Failed to create certificate' });
    }
};
exports.createCertificate = createCertificate;
const updateCertificate = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        const userId = req.user.id;
        const certificateId = parseInt(req.params.id);
        const { name, issuer, date, expiry, credential_id, link } = req.body;
        // Validate input
        if (!name || !issuer || !date) {
            return res.status(400).json({ message: 'Name, issuer, and date are required' });
        }
        // Check if certificate exists and belongs to user
        const checkResult = await db_config_1.default.query('SELECT * FROM certificates WHERE id = $1', [certificateId]);
        if (checkResult.rows.length === 0) {
            return res.status(404).json({ message: 'Certificate not found' });
        }
        if (checkResult.rows[0].user_id !== userId) {
            return res.status(403).json({ message: 'You can only update your own certificates' });
        }
        // Update certificate
        const result = await db_config_1.default.query(`UPDATE certificates 
       SET name = $1, issuer = $2, date = $3, expiry = $4, credential_id = $5, link = $6, updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 AND user_id = $8
       RETURNING *`, [name, issuer, date, expiry, credential_id, link, certificateId, userId]);
        return res.status(200).json(result.rows[0]);
    }
    catch (error) {
        console.error('Error updating certificate:', error);
        return res.status(500).json({ message: 'Failed to update certificate' });
    }
};
exports.updateCertificate = updateCertificate;
const deleteCertificate = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        const userId = req.user.id;
        const certificateId = parseInt(req.params.id);
        // Check if certificate exists and belongs to user
        const checkResult = await db_config_1.default.query('SELECT * FROM certificates WHERE id = $1', [certificateId]);
        if (checkResult.rows.length === 0) {
            return res.status(404).json({ message: 'Certificate not found' });
        }
        if (checkResult.rows[0].user_id !== userId) {
            return res.status(403).json({ message: 'You can only delete your own certificates' });
        }
        // Delete certificate
        await db_config_1.default.query('DELETE FROM certificates WHERE id = $1 AND user_id = $2', [certificateId, userId]);
        return res.status(200).json({ message: 'Certificate deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting certificate:', error);
        return res.status(500).json({ message: 'Failed to delete certificate' });
    }
};
exports.deleteCertificate = deleteCertificate;
