import db from '../config/db.js';

class PantryItem {
    static async create(userId, itemData) {
        const {name,quantity, unit, category, expiry_date, is_running_low} = itemData;

        const res = await db.query(
            'INSERT INTO pantry_items (user_id, name, quantity, unit, category, expiry_date, is_running_low) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [userId, name, quantity, unit, category, expiry_date, is_running_low]
        );
        return res.rows[0];
    }

    static async findByUserId(userId, filters = {}) {
        let query = 'SELECT * FROM pantry_items WHERE user_id = $1';
        const params = [userId];
        let paramcnt=1;

        if (filters.category) {
            paramcnt++;
            query += ` AND category = $${paramcnt}`;
            params.push(filters.category);
        }

        if(filters.is_running_low !== undefined) {
            paramcnt++;
            query += ` AND is_running_low = $${paramcnt}`;
            params.push(filters.is_running_low);
        }

        if(filters.search) {
            paramcnt++;
            query += ` AND name ILIKE $${paramcnt}`;
            params.push(`%${filters.search}%`);
        }

        query += ' ORDER BY created_at DESC';

        const res = await db.query(query, params);
        return res.rows;
    }

    static async getExpiringSoon(userId, days=7) {
        const res = await db.query(
            `SELECT * FROM pantry_items WHERE user_id = $1 AND expiry_date IS NOT NULL AND expiry_date <= CURRENT_DATE + INTERVAL '${days} days' AND expiry_date >= CURRENT_DATE ORDER BY expiry_date ASC`,
            [userId]
        );
        return res.rows;
    }

    static async findById(id, userId) {
        const res = await db.query(
            'SELECT * FROM pantry_items WHERE id = $1 AND user_id = $2',
            [id, userId]
        );
        return res.rows[0];
    }

    static async update(id, userId, updates){
        const {name,quantity, unit, category, expiry_date, is_running_low} = updates;

        const res = await db.query(
            `UPDATE pantry_items SET name = COALESCE($1, name), quantity = COALESCE($2, quantity), unit = COALESCE($3, unit), category = COALESCE($4, category), expiry_date = COALESCE($5, expiry_date), is_running_low = COALESCE($6, is_running_low) WHERE id = $7 AND user_id = $8 RETURNING *`,
            [name, quantity, unit, category, expiry_date, is_running_low, id, userId]
        );
        return res.rows[0];
    }

    static async delete(id, userId) {
        const res = await db.query(
            'DELETE FROM pantry_items WHERE id = $1 AND user_id = $2 RETURNING *',
            [id, userId]
        );
        return res.rows[0];
    }

    static async getStats(userId) {
        const res = await db.query(
            `SELECT COUNT(*) as total_items,
            Count(distinct category) as total_categories,
            count(*) filter (WHERE is_running_low) as running_low_count,
            count(*) filter (WHERE expiry_date IS NOT NULL AND expiry_date <= CURRENT_DATE + INTERVAL '7 days' AND expiry_date >= CURRENT_DATE) as expiring_soon_count
            FROM pantry_items WHERE user_id = $1`,
            [userId]
        );
        return res.rows[0];
    }
}

export default PantryItem;