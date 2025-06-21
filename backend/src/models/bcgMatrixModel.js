const db = require('../config/db');

class BCGMatrix {
  // Create new BCG matrix item
  static async create(analysisId, itemName, category, marketGrowth, marketShare, explanation) {
    try {
      const result = await db.query(
        'INSERT INTO boston_matrix_items (analysis_id, item_name, category, market_growth, market_share, explanation) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [analysisId, itemName, category, marketGrowth, marketShare, explanation]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error creating BCG matrix item:', error);
      throw error;
    }
  }
  
  // Get all BCG matrix items for an analysis
  static async getByAnalysisId(analysisId) {
    try {
      const result = await db.query(
        'SELECT * FROM boston_matrix_items WHERE analysis_id = $1 ORDER BY created_at DESC',
        [analysisId]
      );
      
      return result.rows;
    } catch (error) {
      console.error('Error getting BCG matrix items:', error);
      throw error;
    }
  }
  
  // Get BCG matrix item by ID
  static async getById(id) {
    try {
      const result = await db.query(
        'SELECT * FROM boston_matrix_items WHERE id = $1',
        [id]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error getting BCG matrix item by ID:', error);
      throw error;
    }
  }
  
  // Get BCG matrix items by category
  static async getByCategory(analysisId, category) {
    try {
      const result = await db.query(
        'SELECT * FROM boston_matrix_items WHERE analysis_id = $1 AND category = $2 ORDER BY created_at DESC',
        [analysisId, category]
      );
      
      return result.rows;
    } catch (error) {
      console.error('Error getting BCG matrix items by category:', error);
      throw error;
    }
  }
  
  // Update BCG matrix item
  static async update(id, itemName, category, marketGrowth, marketShare, explanation) {
    try {
      const result = await db.query(
        'UPDATE boston_matrix_items SET item_name = $1, category = $2, market_growth = $3, market_share = $4, explanation = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING *',
        [itemName, category, marketGrowth, marketShare, explanation, id]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error updating BCG matrix item:', error);
      throw error;
    }
  }
  
  // Delete BCG matrix item
  static async delete(id) {
    try {
      await db.query(
        'DELETE FROM boston_matrix_items WHERE id = $1',
        [id]
      );
      
      return true;
    } catch (error) {
      console.error('Error deleting BCG matrix item:', error);
      throw error;
    }
  }
  
  // Get BCG matrix summary for a user
  static async getSummaryByUserId(userId) {
    try {
      const result = await db.query(`
        SELECT 
          bmi.category, 
          COUNT(*) as count,
          SUM(CASE WHEN ar.analysis_content->>'revenue' IS NOT NULL 
              THEN (ar.analysis_content->>'revenue')::numeric 
              ELSE 0 
              END) as total_revenue
        FROM boston_matrix_items bmi
        JOIN analysis_results ar ON bmi.analysis_id = ar.id
        WHERE ar.user_id = $1
        GROUP BY bmi.category
      `, [userId]);
      
      return result.rows;
    } catch (error) {
      console.error('Error getting BCG matrix summary:', error);
      throw error;
    }
  }
}

module.exports = BCGMatrix; 