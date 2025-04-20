import { Request, Response } from 'express';
import { ID } from 'appwrite';
import { storage } from '../config/appwrite';
import pool from '../config/db.config';
import { Readable } from 'stream';

const CV_BUCKET_ID = process.env.APPWRITE_BUCKET_ID || '68052646000a993ccf3f';

// Helper function to convert Buffer to Stream
function bufferToStream(buffer: Buffer): Readable {
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);
  return stream;
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
    
    // Upload to Appwrite using a stream from buffer
    const fileId = ID.unique();
    const appwriteFile = await storage.createFile(
      CV_BUCKET_ID,
      fileId,
      new File([file.buffer], file.originalname, { type: file.mimetype }),
      [file.originalname]
    );
    
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
          (user_id, appwrite_file_id, file_url, file_name, is_primary, tags)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [
          user.id, 
          appwriteFile.$id, 
          `${process.env.APPWRITE_ENDPOINT}/storage/buckets/${CV_BUCKET_ID}/files/${appwriteFile.$id}/view`, 
          file.originalname,
          isFirstCV, // Set as primary if first CV
          []  // Empty tags array initially
        ]
      );
      
      await client.query('COMMIT');
      res.status(201).json(result.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('CV upload error:', error);
    res.status(500).json({ message: 'CV upload failed' });
  }
};

export const getUserCVs = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized: User not found' });
    }
    
    const result = await pool.query(
      'SELECT * FROM cvs WHERE user_id = $1 ORDER BY uploaded_at DESC',
      [user.id]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching CVs:', error);
    res.status(500).json({ message: 'Failed to fetch CVs' });
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
        'UPDATE cvs SET is_primary = TRUE WHERE id = $1 AND user_id = $2 RETURNING *',
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
      
      // Delete from Appwrite
      await storage.deleteFile(CV_BUCKET_ID, cv.appwrite_file_id);
      
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

// New tag-related functions
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
          'UPDATE cvs SET tags = $1 WHERE id = $2 RETURNING *',
          [updatedTags, cvId]
        );
        
        await client.query('COMMIT');
        res.json(result.rows[0]);
      } else {
        // Tag already exists, just return current CV
        await client.query('COMMIT');
        res.json(cv);
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
        'UPDATE cvs SET tags = $1 WHERE id = $2 RETURNING *',
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