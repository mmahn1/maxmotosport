const crypto = require('crypto');
const db = require('../database/db');

class Subscriber {
  /**
   * Find a subscriber by email
   * @param {string} email - The email to search for
   * @returns {Promise<Object|null>} - The subscriber object or null if not found
   */
  static async findByEmail(email) {
    const results = await db.query('SELECT * FROM subscribers WHERE email = ?', [email]);
    return results.length > 0 ? results[0] : null;
  }
  
  /**
   * Find a subscriber by verification token
   * @param {string} token - The verification token
   * @returns {Promise<Object|null>} - The subscriber object or null if not found
   */
  static async findByToken(token) {
    const results = await db.query('SELECT * FROM subscribers WHERE verification_token = ?', [token]);
    return results.length > 0 ? results[0] : null;
  }
  
  /**
   * Create a new subscriber
   * @param {Object} data - The subscriber data {name, email, verification_token}
   * @returns {Promise<Object>} - The created subscriber object
   */
  static async create(data) {
    const result = await db.query(
      'INSERT INTO subscribers (name, email, verification_token) VALUES (?, ?, ?)', 
      [data.name, data.email, data.verification_token]
    );
    
    return { id: result.insertId, ...data };
  }
  
  /**
   * Update a subscriber
   * @param {number} id - The subscriber ID
   * @param {Object} data - The data to update
   * @returns {Promise<Object>} - The updated subscriber object
   */
  static async update(id, data) {
    
    const fields = Object.keys(data);
    const values = Object.values(data);
    
    if (fields.length === 0) {
      return { id };
    }
    
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const sql = `UPDATE subscribers SET ${setClause} WHERE id = ?`;
    
    await db.query(sql, [...values, id]);
    return { id, ...data };
  }
  
  /**
   * Verify a subscriber's email
   * @param {number} id - The subscriber ID
   * @returns {Promise<void>}
   */
  static async verify(id) {
    const now = new Date();
    await db.query(
      'UPDATE subscribers SET is_verified = TRUE, verified_at = ? WHERE id = ?',
      [now, id]
    );
  }
  
  /**
   * Generate a verification token
   * @returns {string} - A random verification token
   */
  static generateVerificationToken() {
    return crypto.randomBytes(32).toString('hex');
  }
}

module.exports = Subscriber;
