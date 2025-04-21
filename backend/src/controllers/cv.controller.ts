import { Request, Response } from 'express';
import { ID } from 'appwrite';
import pool from '../config/db.config';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { promisify } from 'util';

// Convert callbacks to promises
const writeFileAsync = promisify(fs.writeFile);
const mkdirAsync = promisify(fs.mkdir);
const existsAsync = promisify(fs.exists);

// File storage configuration
const STORAGE_DIR = process.env.CV_STORAGE_DIR || path.join(__dirname, '../../uploads/cvs');

// Ensure storage directory exists
async function ensureStorageDir() {
  if (!(await existsAsync(STORAGE_DIR))) {
    await mkdirAsync(STORAGE_DIR, { recursive: true });
  }
}

// Generate safe filename
function generateSafeFilename(originalName: string): string {
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(8).toString('hex');
  const extension = path.extname(originalName);
  const safeName = `${timestamp}-${randomString}${extension}`;
  return safeName;
}

export const uploadCV = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const file = req.file;
    
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized: User not found' });
    }
    
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    try {
      // Ensure storage directory exists
      await ensureStorageDir();
      
      // Generate safe filename
      const safeFilename = generateSafeFilename(file.originalname);
      const filePath = path.join(STORAGE_DIR, safeFilename);
      
      // Save file to disk
      await writeFileAsync(filePath, file.buffer);
      
      // Begin transaction
      const client = await pool.connect();
      
      try {
        await client.query('BEGIN');
        
        // Check if this is the user's first CV
        const countResult = await client.query(
          'SELECT COUNT(*) FROM cvs WHERE user_id = $1',
          [user.id]
        );
        
        const isFirstCV = parseInt(countResult.rows[0].count) === 0;
        
        // Store metadata in PostgreSQL
        const result = await client.query(
          `INSERT INTO cvs
            (user_id, file_path, file_name, file_size, is_primary, tags)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING id, user_id, file_name, file_size, is_primary, tags, uploaded_at, updated_at`,
          [
            user.id,
            filePath,
            file.originalname,
            file.size,
            isFirstCV,
            []
          ]
        );
       
        
        await client.query('COMMIT');
        res.status(201).json(result.rows[0]);
        const uploadedCV = result.rows[0]; 
        res.status(201).json({
          ...uploadedCV,
          file_url: `/api/cvs/${uploadedCV.id}/view`
        });
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      throw error;
    }
  } catch (error) {
    console.error('CV upload error:', error);
    res.status(500).json({ message: 'CV upload failed', error: (error as Error).message });
  }
};

export const getUserCVs = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized: User not found' });
    }
    
    const result = await pool.query(
      'SELECT id, user_id, file_name, file_size, is_primary, tags, uploaded_at, updated_at FROM cvs WHERE user_id = $1 ORDER BY uploaded_at DESC',
      [user.id]
    );

    // Transform the results to include file URLs
    const cvs = result.rows.map(cv => ({
      ...cv,
      // Add direct file URLs for frontend use
      file_url: `/api/cvs/${cv.id}/view`
    }));
    
    res.json(cvs);
  } catch (error) {
    console.error('Error fetching CVs:', error);
    res.status(500).json({ message: 'Failed to fetch CVs' });
  }
};
export const downloadCV = async (req: Request, res: Response) => {
  try {
    const { cvId } = req.params;
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized: User not found' });
    }
    
    // Get CV details
    const cvResult = await pool.query(
      'SELECT * FROM cvs WHERE id = $1 AND user_id = $2',
      [cvId, user.id]
    );
    
    if (cvResult.rowCount === 0) {
      return res.status(404).json({ message: 'CV not found' });
    }
    
    const cv = cvResult.rows[0];
    
    // Check if file exists
    if (!(await existsAsync(cv.file_path))) {
      return res.status(404).json({ message: 'CV file not found' });
    }
    
    // Set appropriate headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${cv.file_name}"`);
    
    // Stream the file to response
    const fileStream = fs.createReadStream(cv.file_path);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Error downloading CV:', error);
    res.status(500).json({ message: 'Failed to download CV' });
  }
};

export const viewCV = async (req: Request, res: Response) => {
  try {
    const { cvId } = req.params;
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized: User not found' });
    }
    
    // Get CV details
    const cvResult = await pool.query(
      'SELECT * FROM cvs WHERE id = $1 AND user_id = $2',
      [cvId, user.id]
    );
    
    if (cvResult.rowCount === 0) {
      return res.status(404).json({ message: 'CV not found' });
    }
    
    const cv = cvResult.rows[0];
    
    // Check if file exists
    if (!(await existsAsync(cv.file_path))) {
      return res.status(404).json({ message: 'CV file not found' });
    }
    
    // Set appropriate headers for inline viewing
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${cv.file_name}"`);
    
    // Stream the file to response
    const fileStream = fs.createReadStream(cv.file_path);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Error viewing CV:', error);
    res.status(500).json({ message: 'Failed to view CV' });
  }
};

export const setPrimaryCV = async (req: Request, res: Response) => {
  try {
    const { cvId } = req.params;
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized: User not found' });
    }
    
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Check if CV belongs to user
      const checkResult = await client.query(
        'SELECT * FROM cvs WHERE id = $1 AND user_id = $2',
        [cvId, user.id]
      );
      
      if (checkResult.rowCount === 0) {
        return res.status(404).json({ message: 'CV not found' });
      }
      
      // Reset all primary CVs
      await client.query(
        'UPDATE cvs SET is_primary = FALSE WHERE user_id = $1',
        [user.id]
      );
      
      // Set new primary
      const result = await client.query(
        'UPDATE cvs SET is_primary = TRUE WHERE id = $1 AND user_id = $2 RETURNING id, user_id, file_name, is_primary, tags, uploaded_at, updated_at',
        [cvId, user.id]
      );
      
      await client.query('COMMIT');
      res.json(result.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error setting primary CV:', error);
    res.status(500).json({ message: 'Failed to set primary CV' });
  }
};

export const deleteCV = async (req: Request, res: Response) => {
  try {
    const { cvId } = req.params;
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized: User not found' });
    }
    
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Get CV details
      const cvResult = await client.query(
        'SELECT * FROM cvs WHERE id = $1 AND user_id = $2',
        [cvId, user.id]
      );
      
      if (cvResult.rowCount === 0) {
        return res.status(404).json({ message: 'CV not found' });
      }
      
      const cv = cvResult.rows[0];
      
      // Delete file from filesystem if it exists
      if (cv.file_path && (await existsAsync(cv.file_path))) {
        fs.unlink(cv.file_path, (err) => {
          if (err) console.error('Error deleting file:', err);
        });
      }
      
      // Delete from database
      await client.query('DELETE FROM cvs WHERE id = $1', [cvId]);
      
      // If the deleted CV was primary, set another CV as primary if any exist
      if (cv.is_primary) {
        const remainingCVsResult = await client.query(
          'SELECT id FROM cvs WHERE user_id = $1 ORDER BY uploaded_at DESC LIMIT 1',
          [user.id]
        );
        
        if ((remainingCVsResult.rowCount ?? 0) > 0) {
          await client.query(
            'UPDATE cvs SET is_primary = TRUE WHERE id = $1',
            [remainingCVsResult.rows[0].id]
          );
        }
      }
      
      await client.query('COMMIT');
      res.json({ message: 'CV deleted successfully' });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error deleting CV:', error);
    res.status(500).json({ message: 'Failed to delete CV' });
  }
};

// Tag-related functions
export const addTag = async (req: Request, res: Response) => {
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
    
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Check if CV belongs to user and get current tags
      const cvResult = await client.query(
        'SELECT * FROM cvs WHERE id = $1 AND user_id = $2',
        [cvId, user.id]
      );
      
      if (cvResult.rowCount === 0) {
        return res.status(404).json({ message: 'CV not found' });
      }
      
      const cv = cvResult.rows[0];
      const currentTags = cv.tags || [];
      
      // Don't add duplicate tags
      if (!currentTags.includes(tag)) {
        const updatedTags = [...currentTags, tag];
        
        // Update CV with new tag
        const result = await client.query(
          'UPDATE cvs SET tags = $1 WHERE id = $2 RETURNING id, user_id, file_name, is_primary, tags, uploaded_at, updated_at',
          [updatedTags, cvId]
        );
        
        await client.query('COMMIT');
        res.json(result.rows[0]);
      } else {
        // Tag already exists, just return current CV
        await client.query('COMMIT');
        res.json({
          id: cv.id,
          user_id: cv.user_id,
          file_name: cv.file_name,
          is_primary: cv.is_primary,
          tags: cv.tags,
          uploaded_at: cv.uploaded_at,
          updated_at: cv.updated_at
        });
      }
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error adding tag:', error);
    res.status(500).json({ message: 'Failed to add tag' });
  }
};

export const removeTag = async (req: Request, res: Response) => {
  try {
    const { cvId, tag } = req.params;
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized: User not found' });
    }
    
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Check if CV belongs to user and get current tags
      const cvResult = await client.query(
        'SELECT * FROM cvs WHERE id = $1 AND user_id = $2',
        [cvId, user.id]
      );
      
      if (cvResult.rowCount === 0) {
        return res.status(404).json({ message: 'CV not found' });
      }
      
      const cv = cvResult.rows[0];
      const currentTags = cv.tags || [];
      
      // Remove the tag if it exists
      const updatedTags: string[] = currentTags.filter((t: string) => t !== tag);
      
      // Update CV with new tags array
      const result = await client.query(
        'UPDATE cvs SET tags = $1 WHERE id = $2 RETURNING id, user_id, file_name, is_primary, tags, uploaded_at, updated_at',
        [updatedTags, cvId]
      );
      
      await client.query('COMMIT');
      res.json(result.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error removing tag:', error);
    res.status(500).json({ message: 'Failed to remove tag' });
  }
};