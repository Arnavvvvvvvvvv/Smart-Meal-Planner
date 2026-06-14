import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import pantryRoutes from './routes/pantry.js'
import mealPlanRoutes from './routes/mealPlans.js'
import recipeRoutes from './routes/recipes.js'
import shoppingRoutes from './routes/shoppingList.js'

dotenv.config();    
const app = express();

const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.json({message: 'Hello World!'});
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/pantry', pantryRoutes);
app.use('/api/meal-planning', mealPlanRoutes);
app.use('/api/recipe', recipeRoutes);
app.use('/api/shopping', shoppingRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});