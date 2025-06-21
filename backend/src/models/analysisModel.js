const db = require('../config/db');

class AnalysisResult {
  // Create new analysis result
  static async create(userId, dataId, analysisType, analysisContent, parentAnalysisId = null) {
    try {
      const result = await db.query(
        'INSERT INTO analysis_results (user_id, data_id, analysis_type, analysis_content, parent_analysis_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [userId, dataId, analysisType, analysisContent, parentAnalysisId]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error creating analysis result:', error);
      throw error;
    }
  }
  
  // Get all analysis results for a user
  static async getByUserId(userId) {
    try {
      const result = await db.query(
        'SELECT * FROM analysis_results WHERE user_id = $1 ORDER BY created_at DESC',
        [userId]
      );
      
      return result.rows;
    } catch (error) {
      console.error('Error getting analysis results:', error);
      throw error;
    }
  }
  
  // Get analysis result by ID
  static async getById(id, userId) {
    try {
      const result = await db.query(
        'SELECT * FROM analysis_results WHERE id = $1 AND user_id = $2',
        [id, userId]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error getting analysis result by ID:', error);
      throw error;
    }
  }
  
  // Get analysis results by type
  static async getByType(userId, analysisType) {
    try {
      const result = await db.query(
        'SELECT * FROM analysis_results WHERE user_id = $1 AND analysis_type = $2 ORDER BY created_at DESC',
        [userId, analysisType]
      );
      
      return result.rows;
    } catch (error) {
      console.error('Error getting analysis results by type:', error);
      throw error;
    }
  }
  
  // Get analysis results by data ID
  static async getByDataId(userId, dataId) {
    try {
      const result = await db.query(
        'SELECT * FROM analysis_results WHERE user_id = $1 AND data_id = $2 ORDER BY created_at DESC',
        [userId, dataId]
      );
      
      return result.rows;
    } catch (error) {
      console.error('Error getting analysis results by data ID:', error);
      throw error;
    }
  }
  
  // Get analysis results by type and data ID
  static async getByTypeAndDataId(userId, analysisType, dataId) {
    try {
      const result = await db.query(
        'SELECT * FROM analysis_results WHERE user_id = $1 AND analysis_type = $2 AND data_id = $3 ORDER BY created_at DESC',
        [userId, analysisType, dataId]
      );
      
      return result.rows;
    } catch (error) {
      console.error('Error getting analysis results by type and data ID:', error);
      throw error;
    }
  }
  
  // Update analysis result
  static async update(id, userId, analysisContent) {
    try {
      const result = await db.query(
        'UPDATE analysis_results SET analysis_content = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND user_id = $3 RETURNING *',
        [analysisContent, id, userId]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error updating analysis result:', error);
      throw error;
    }
  }
  
  // Delete analysis result
  static async delete(id, userId) {
    try {
      await db.query(
        'DELETE FROM analysis_results WHERE id = $1 AND user_id = $2',
        [id, userId]
      );
      
      return true;
    } catch (error) {
      console.error('Error deleting analysis result:', error);
      throw error;
    }
  }
}

module.exports = AnalysisResult; 