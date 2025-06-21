const db = require('../config/db');
const bcrypt = require('bcryptjs');

class User {
  // Create a new user
  static async create(userData) {
    const { email, password, name, profile_image } = userData;
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    try {
      const result = await db.query(
        'INSERT INTO users (email, password, name, profile_image) VALUES ($1, $2, $3, $4) RETURNING id, email, name, profile_image, created_at',
        [email, hashedPassword, name, profile_image]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }
  
  // Find user by email
  static async findByEmail(email) {
    try {
      const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
      return result.rows[0];
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  }
  
  // Find user by ID
  static async findById(id) {
    try {
      const result = await db.query(
        'SELECT id, email, name, profile_image, created_at, updated_at FROM users WHERE id = $1', 
        [id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw error;
    }
  }
  
  // Update user
  static async update(id, userData) {
    const { name, profile_image } = userData;
    
    try {
      const result = await db.query(
        'UPDATE users SET name = $1, profile_image = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING id, email, name, profile_image, updated_at',
        [name, profile_image, id]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }
  
  // Update password
  static async updatePassword(id, password) {
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    try {
      await db.query(
        'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [hashedPassword, id]
      );
      
      return true;
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  }
  
  // Compare password
  static async comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }
}

module.exports = User; 