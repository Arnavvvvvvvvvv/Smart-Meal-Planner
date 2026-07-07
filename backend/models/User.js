import db from '../config/db.js';
import bcrypt from 'bcryptjs';

class User {
    static async create({ email, password = null, name, googleId = null, profilePicture = null }) {
        const normalizedEmail = email.toLowerCase().trim();
        const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

        const res = await db.query(
            `INSERT INTO users (email, password_hash, name, google_id, profile_picture)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, email, name, google_id, profile_picture, created_at`,
            [normalizedEmail, hashedPassword, name, googleId, profilePicture]
        );
        return res.rows[0];
    }

    static async findByEmail(email) {
        const normalizedEmail = email.toLowerCase().trim();
        const res = await db.query('SELECT * FROM users WHERE email = $1', [normalizedEmail]);
        return res.rows[0];
    }

    static async findById(id) {
        const res = await db.query('SELECT id, email, name, google_id, profile_picture, created_at, updated_at FROM users WHERE id = $1', [id]);
        return res.rows[0];
    }

    static async update(id, updates) {
        const { name, email, googleId, profilePicture } = updates;
        const normalizedEmail = email ? email.toLowerCase().trim() : undefined;
        const res = await db.query(
            `UPDATE users
             SET name = COALESCE($1, name),
                 email = COALESCE($2, email),
                 google_id = COALESCE($3, google_id),
                 profile_picture = COALESCE($4, profile_picture),
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $5
             RETURNING id, email, name, google_id, profile_picture, created_at, updated_at`,
            [name, normalizedEmail, googleId, profilePicture, id]
        );
        return res.rows[0];
    }

    static async linkGoogleAccount(id, { googleId, profilePicture }) {
        const res = await db.query(
            `UPDATE users
             SET google_id = COALESCE($1, google_id),
                 profile_picture = COALESCE($2, profile_picture),
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $3
             RETURNING id, email, name, google_id, profile_picture, created_at, updated_at`,
            [googleId, profilePicture, id]
        );
        return res.rows[0];
    }

    static async updatePassword(id, newPassword) {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await db.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hashedPassword, id]);
    }

    static async verifyPassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }

    static async delete(id) {
        await db.query('DELETE FROM users WHERE id = $1', [id]);
    }
}

export default User;