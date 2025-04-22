"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeTag = exports.addTag = exports.deleteCV = exports.setPrimaryCV = exports.updateCV = exports.getCVById = exports.getUserCVs = exports.createCV = void 0;
const db_config_1 = __importDefault(require("../config/db.config"));
const createCV = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized: User not found' });
        }
        const { title, firstName, lastName, email, phone, address, city, country, postalCode, profileSummary, avatarUrl, website, linkedin, github, skills = [], education = [], experience = [], projects = [], certifications = [], languages = [], tags = [] } = req.body;
        // Validate required fields
        if (!title || !firstName || !lastName || !email) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        // Begin transaction
        const client = await db_config_1.default.connect();
        try {
            await client.query('BEGIN');
            // Check if this is the user's first CV
            const countResult = await client.query('SELECT COUNT(*) FROM cvs WHERE user_id = $1', [user.id]);
            const isFirstCV = parseInt(countResult.rows[0].count) === 0;
            // Insert new CV - using JSONB for complex arrays and properly cast array for tags
            const result = await client.query(`INSERT INTO cvs
          (user_id, title, first_name, last_name, email, phone, address, city, 
           country, postal_code, profile_summary, avatar_url, website, linkedin, 
           github, is_primary, skills, education, experience, projects, 
           certifications, languages, tags)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, 
                $17::jsonb, $18::jsonb, $19::jsonb, $20::jsonb, $21::jsonb, $22::jsonb, $23::text[])
         RETURNING *`, [
                user.id, title, firstName, lastName, email, phone, address, city,
                country, postalCode, profileSummary, avatarUrl, website, linkedin,
                github, isFirstCV,
                JSON.stringify(skills),
                JSON.stringify(education),
                JSON.stringify(experience),
                JSON.stringify(projects),
                JSON.stringify(certifications),
                JSON.stringify(languages),
                tags
            ]);
            await client.query('COMMIT');
            res.status(201).json(result.rows[0]);
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
    catch (error) {
        console.error('CV creation error:', error);
        res.status(500).json({ message: 'CV creation failed', error: error.message });
    }
};
exports.createCV = createCV;
const getUserCVs = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized: User not found' });
        }
        const result = await db_config_1.default.query('SELECT * FROM cvs WHERE user_id = $1 ORDER BY created_at DESC', [user.id]);
        res.json(result.rows);
    }
    catch (error) {
        console.error('Error fetching CVs:', error);
        res.status(500).json({ message: 'Failed to fetch CVs' });
    }
};
exports.getUserCVs = getUserCVs;
const getCVById = async (req, res) => {
    try {
        const { cvId } = req.params;
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized: User not found' });
        }
        const result = await db_config_1.default.query('SELECT * FROM cvs WHERE id = $1 AND user_id = $2', [cvId, user.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'CV not found' });
        }
        res.json(result.rows[0]);
    }
    catch (error) {
        console.error('Error fetching CV:', error);
        res.status(500).json({ message: 'Failed to fetch CV' });
    }
};
exports.getCVById = getCVById;
const updateCV = async (req, res) => {
    try {
        const { cvId } = req.params;
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized: User not found' });
        }
        const { title, firstName, lastName, email, phone, address, city, country, postalCode, profileSummary, avatarUrl, website, linkedin, github, skills = [], education = [], experience = [], projects = [], certifications = [], languages = [], tags = [] } = req.body;
        // Validate required fields
        if (!title || !firstName || !lastName || !email) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        // Check if CV exists and belongs to user
        const checkResult = await db_config_1.default.query('SELECT id FROM cvs WHERE id = $1 AND user_id = $2', [cvId, user.id]);
        if (checkResult.rows.length === 0) {
            return res.status(404).json({ message: 'CV not found' });
        }
        const result = await db_config_1.default.query(`UPDATE cvs SET
        title = $1,
        first_name = $2,
        last_name = $3,
        email = $4,
        phone = $5,
        address = $6,
        city = $7,
        country = $8,
        postal_code = $9,
        profile_summary = $10,
        avatar_url = $11,
        website = $12,
        linkedin = $13,
        github = $14,
        skills = $15::jsonb,
        education = $16::jsonb,
        experience = $17::jsonb,
        projects = $18::jsonb,
        certifications = $19::jsonb,
        languages = $20::jsonb,
        tags = $21::text[],
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $22 AND user_id = $23
      RETURNING *`, [
            title, firstName, lastName, email, phone, address, city,
            country, postalCode, profileSummary, avatarUrl, website, linkedin,
            github,
            JSON.stringify(skills),
            JSON.stringify(education),
            JSON.stringify(experience),
            JSON.stringify(projects),
            JSON.stringify(certifications),
            JSON.stringify(languages),
            tags,
            cvId, user.id
        ]);
        res.json(result.rows[0]);
    }
    catch (error) {
        console.error('Error updating CV:', error);
        res.status(500).json({ message: 'Failed to update CV' });
    }
};
exports.updateCV = updateCV;
const setPrimaryCV = async (req, res) => {
    try {
        const { cvId } = req.params;
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized: User not found' });
        }
        const client = await db_config_1.default.connect();
        try {
            await client.query('BEGIN');
            // Check if CV belongs to user
            const checkResult = await client.query('SELECT * FROM cvs WHERE id = $1 AND user_id = $2', [cvId, user.id]);
            if (checkResult.rowCount === 0) {
                return res.status(404).json({ message: 'CV not found' });
            }
            // Reset all primary CVs
            await client.query('UPDATE cvs SET is_primary = FALSE WHERE user_id = $1', [user.id]);
            // Set new primary
            const result = await client.query('UPDATE cvs SET is_primary = TRUE WHERE id = $1 AND user_id = $2 RETURNING *', [cvId, user.id]);
            await client.query('COMMIT');
            res.json(result.rows[0]);
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
    catch (error) {
        console.error('Error setting primary CV:', error);
        res.status(500).json({ message: 'Failed to set primary CV' });
    }
};
exports.setPrimaryCV = setPrimaryCV;
const deleteCV = async (req, res) => {
    try {
        const { cvId } = req.params;
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized: User not found' });
        }
        const client = await db_config_1.default.connect();
        try {
            await client.query('BEGIN');
            // Get CV details to check if it's primary
            const cvResult = await client.query('SELECT * FROM cvs WHERE id = $1 AND user_id = $2', [cvId, user.id]);
            if (cvResult.rowCount === 0) {
                return res.status(404).json({ message: 'CV not found' });
            }
            const cv = cvResult.rows[0];
            // Delete the CV
            await client.query('DELETE FROM cvs WHERE id = $1', [cvId]);
            // If the deleted CV was primary, set another CV as primary if any exist
            if (cv.is_primary) {
                const remainingCVsResult = await client.query('SELECT id FROM cvs WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1', [user.id]);
                if ((remainingCVsResult.rowCount ?? 0) > 0) {
                    await client.query('UPDATE cvs SET is_primary = TRUE WHERE id = $1', [remainingCVsResult.rows[0].id]);
                }
            }
            await client.query('COMMIT');
            res.json({ message: 'CV deleted successfully' });
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
    catch (error) {
        console.error('Error deleting CV:', error);
        res.status(500).json({ message: 'Failed to delete CV' });
    }
};
exports.deleteCV = deleteCV;
// Tag-related functions
const addTag = async (req, res) => {
    try {
        const { cvId } = req.params;
        const { tag } = req.body;
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized: User not found' });
        }
        if (!tag) {
            return res.status(400).json({ message: 'Tag is required' });
        }
        const client = await db_config_1.default.connect();
        try {
            await client.query('BEGIN');
            // Check if CV belongs to user and get current tags
            const cvResult = await client.query('SELECT * FROM cvs WHERE id = $1 AND user_id = $2', [cvId, user.id]);
            if (cvResult.rowCount === 0) {
                return res.status(404).json({ message: 'CV not found' });
            }
            const cv = cvResult.rows[0];
            const currentTags = cv.tags || [];
            // Don't add duplicate tags
            if (!currentTags.includes(tag)) {
                // Use array_append for proper PostgreSQL array handling
                const result = await client.query('UPDATE cvs SET tags = array_append(tags, $1) WHERE id = $2 RETURNING *', [tag, cvId]);
                await client.query('COMMIT');
                res.json(result.rows[0]);
            }
            else {
                // Tag already exists, just return current CV
                await client.query('COMMIT');
                res.json(cv);
            }
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
    catch (error) {
        console.error('Error adding tag:', error);
        res.status(500).json({ message: 'Failed to add tag' });
    }
};
exports.addTag = addTag;
const removeTag = async (req, res) => {
    try {
        const { cvId, tag } = req.params;
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized: User not found' });
        }
        const client = await db_config_1.default.connect();
        try {
            await client.query('BEGIN');
            // Check if CV belongs to user and get current tags
            const cvResult = await client.query('SELECT * FROM cvs WHERE id = $1 AND user_id = $2', [cvId, user.id]);
            if (cvResult.rowCount === 0) {
                return res.status(404).json({ message: 'CV not found' });
            }
            // Use array_remove for proper PostgreSQL array handling
            const result = await client.query('UPDATE cvs SET tags = array_remove(tags, $1) WHERE id = $2 RETURNING *', [tag, cvId]);
            await client.query('COMMIT');
            res.json(result.rows[0]);
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
    catch (error) {
        console.error('Error removing tag:', error);
        res.status(500).json({ message: 'Failed to remove tag' });
    }
};
exports.removeTag = removeTag;
