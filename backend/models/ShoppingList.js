import db from '../config/db.js';

export default class ShoppingList {
    static async generateFromMealPlan(userId, startDate, endDate) {
        const client = await db.connect();

        try {
            await client.query('BEGIN');

            await client.query(
                'DELETE FROM shopping_lists WHERE user_id = $1 AND from_meal_plan = true',
                [userId]
            );

            const result = await client.query(
                `SELECT ri.ingredient_name, ri.unit, SUM(ri.quantity) AS total_quantity
                 FROM meal_plans mp
                 JOIN recipe_ingredients ri ON mp.recipe_id = ri.recipe_id
                 WHERE mp.user_id = $1
                   AND mp.meal_date >= $2
                   AND mp.meal_date <= $3
                 GROUP BY ri.ingredient_name, ri.unit`,
                [userId, startDate, endDate]
            );

            const ingredients = result.rows;

            const pantryRes = await client.query(
                'SELECT name, quantity, unit FROM pantry_items WHERE user_id = $1', [userId]
            );

            const pantrymap= new Map();
            pantryRes.rows.forEach(item => {
                const key= `${item.name.toLowerCase()}_${item.unit.toLowerCase()}`;
                pantrymap.set(key, item.quantity);
            });

            for(const ingredient of ingredients) {
                const key= `${ingredient.ingredient_name.toLowerCase()}_${ingredient.unit.toLowerCase()}`;
                const pantryQuantity = pantrymap.get(key) || 0;
                const neededQuantity = Math.max(0, parseFloat(ingredient.total_quantity) - parseFloat(pantryQuantity));

                if(neededQuantity > 0) {
                    await client.query(
                        `INSERT INTO shopping_lists (user_id, ingredient_name, quantity, unit, from_meal_plan, category)
                         VALUES ($1, $2, $3, $4, $5, $6)`,
                        [userId, ingredient.ingredient_name, neededQuantity, ingredient.unit, true, 'Uncategorized']
                    );
                }
            }

            await client.query('COMMIT'); 
            return await this.findByUserId(userId);
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    static async create(userId, itemData) {
        const { ingredient_name, quantity, unit, category='Uncategorized'} = itemData;
        const result = await db.query(
            `INSERT INTO shopping_lists (user_id, ingredient_name, quantity, unit, from_meal_plan, category)
             VALUES ($1, $2, $3, $4, false, $5) RETURNING *`,
            [userId, ingredient_name, quantity, unit, category]
        );
        return result.rows[0];
    }

    static async findByUserId(userId) {
        const result = await db.query(
            'SELECT * FROM shopping_lists WHERE user_id = $1 ORDER BY category, ingredient_name',
            [userId]
        );
        return result.rows;
    }

    static async groupByCategory(userId) {
        const result = await db.query(
            'SELECT category, json_agg(json_build_object(\'id\', id, \'ingredient_name\', ingredient_name, \'quantity\', quantity, \'unit\', unit, \'is_checked\', is_checked, \'from_meal_plan\', from_meal_plan)) AS items FROM shopping_lists WHERE user_id = $1 GROUP BY category order by category',
            [userId]
        );
        return result.rows;
    }

    static async update(id, userId, updateData) {
        const { ingredient_name, quantity, unit, is_checked, category } = updateData;
        const result = await db.query(
            `UPDATE shopping_lists SET ingredient_name = COALESCE($1, ingredient_name), quantity = COALESCE($2, quantity), unit = COALESCE($3, unit), is_checked = COALESCE($4, is_checked), category = COALESCE($5, category)
             WHERE id = $6 AND user_id = $7 RETURNING *`,
            [ingredient_name, quantity, unit, is_checked, category, id, userId]
        );
        return result.rows[0];
    }

    static async toggleChecked(id, userId) {
        const result = await db.query(
            `UPDATE shopping_lists SET is_checked = NOT is_checked WHERE id = $1 AND user_id = $2 RETURNING *`,
            [id, userId]
        );
        return result.rows[0];
    }

    static async delete(id, userId) {
        const result = await db.query(
            'DELETE FROM shopping_lists WHERE id = $1 AND user_id = $2 RETURNING *',
            [id, userId]
        );
        return result.rows[0];
    }

    static async clearChecked(userId) {
        const result= await db.query('DELETE FROM shopping_lists WHERE user_id = $1 AND is_checked = true returning *', [userId]);
        return result.rows;
    }

    static async clearAll(userId) {
        const result=await db.query('DELETE FROM shopping_lists WHERE user_id = $1 returning *', [userId]);
        return result.rows;
    }

    static async addCheckedToPantry(userId) {
    const client = await db.connect();

    try {
        await client.query('BEGIN');

        const checkedItems = await client.query(
            'SELECT * FROM shopping_lists WHERE user_id = $1 AND is_checked = true',
            [userId]
        );

        for (const item of checkedItems.rows) {
            await client.query(
                `INSERT INTO pantry_items 
                (user_id, name, quantity, unit, category)
                VALUES ($1, $2, $3, $4, $5)`,
                [userId,item.ingredient_name,item.quantity,item.unit,item.category]
            );
        }

        await client.query(
            'DELETE FROM shopping_lists WHERE user_id = $1 AND is_checked = true',
            [userId]
        );

        await client.query('COMMIT');

        return checkedItems.rows;
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
    }
}
