import dotenv from 'dotenv'
import {GoogleGenAI} from "@google/genai"

dotenv.config();

const ai= new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY})

export const generateRecipe= async ({ingredients,
        dietaryRestrictions = [],
        cuisineType = 'any',
        servings = 4,
        cookingTime = 'medium'})=>{
            const dietaryInfo= dietaryRestrictions.length>0 ? `Dietary restrictions: ${dietaryRestrictions.join(', ')}`:'No dietary restrictions';
            const timeguide = {
                quick: 'under 30 minutes',
                medium: '30-60 minutes',  
                long: 'over 60 minutes'
            };

            const prompt = `Generate a detailed recipe with the following requirements:

Ingredients available: ${ingredients.join(', ')}
IMPORTANT RULES:

1. Only generate recipes that make culinary sense.
2. Do NOT combine ingredients that are traditionally incompatible.
3. If the provided ingredients cannot form a realistic dish together, select only the relevant ingredients and ignore the unsuitable ones.
4. Never force every ingredient into the recipe.
5. Prioritize taste, practicality and real-world cooking standards.
6. Generate recipes that a home cook would realistically prepare.
7. The recipe name should be a known dish or a dish with a believable name.
8. Avoid bizarre, experimental, novelty or AI-invented combinations.
9. If ingredients belong to completely different categories (e.g. Sprite, Biscoff, Chicken), choose the subset that creates the most sensible recipe.
10. Return only recipes that you would expect to find in a cookbook, restaurant menu, food blog or cooking website.
  You may use common pantry staples such as: salt, pepper, oil, butter, garlic, onion, water,basic herbs and common seasonings even if they are not listed. 
${dietaryInfo}
Cuisine type: ${cuisineType}
Servings: ${servings}
Cooking time: ${timeguide[cookingTime] || 'any'}

Please provide a complete recipe in the following JSON format (return ONLY valid JSON, no markdown):
{
  "name": "Recipe name",
  "description": "Brief description of the dish",
  "cuisineType": "${cuisineType}",
  "difficulty": "easy|medium|hard",
  "prepTime": number (in minutes),
  "cookTime": number (in minutes),
  "servings": ${servings},
  "ingredients": [
    {
      "name": "ingredient name",
      "quantity": number,
      "unit": "unit of measurement"
    }
  ],
  "instructions": [
    "Step 1 description",
    "Step 2 description"
  ],
  "dietaryTags": [
    "vegetarian",
    "gluten-free"
  ],
  "nutrition": {
    "calories": number,
    "protein": number (grams),
    "carbs": number (grams),
    "fats": number (grams),
    "fiber": number (grams)
  },
  "cookingTips": ["Tip 1", "Tip 2"]
    }
  Make sure the recipe is creative, delicious, and uses the provided ingredients effectively.
  Also try to ensure that the 'Recipe name' is known to users i.e. it is common or easy to understand `;

  try{
    const response= await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt
    })

    const generatedText= response.text.trim();

    let jsonText = generatedText;

    if (jsonText.startsWith('```json')) {
        jsonText = jsonText
            .replace(/```json\n?/g, '')
            .replace(/```\n?$/g, '');
    } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```\n?/g, '');
    }

    const recipe = JSON.parse(jsonText);

    return recipe;
    } catch (error) {
        console.error('Gemini API error:', error);
        throw new Error('Failed to generate recipe. Please try again.');
    }
}

export const generatePantrySuggestions= async(pantryItems, expiringItems=[])=>{
    const ingredients = pantryItems.map(item => item.name).join(', ');

    const expiringText =expiringItems.length > 0? `\nPriority ingredients (expiring soon): ${expiringItems.join(', ')}`: '';

    const prompt = `Based on these available ingredients: ${ingredients}${expiringText}

      Suggest 3 creative recipe ideas that use these ingredients. Return ONLY a JSON array of strings (no markdown):
      ["Recipe idea 1", "Recipe idea 2", "Recipe idea 3"]

      Each suggestion should be a brief, appetizing description (1-2 sentences).`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        let generatedText = response.text.trim();

        if (generatedText.startsWith('```json')) {
            generatedText = generatedText.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
        } else if (generatedText.startsWith('```')) {
            generatedText = generatedText.replace(/```\n?/g, '');
        }

        return JSON.parse(generatedText);
    } catch (error) {
        console.error('Gemini API error:', error);
        throw new Error(
            'Failed to generate pantry suggestions. Please try again.'
        );
    }
}

export const generateCookingTips = async (recipe) => {
    const prompt = `For this recipe: "${recipe.name}" Ingredients: ${recipe.ingredients?.map(i => i.name).join(', ') || 'N/A'}
    Provide 3-5 helpful cooking tips to make this recipe better. Return ONLY a JSON array of strings (no markdown):
    ["Tip 1", "Tip 2", "Tip 3"]`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        let generatedText = response.text.trim();

        if (generatedText.startsWith('```json')) {generatedText = generatedText.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
        } else if (generatedText.startsWith('```')) {
            generatedText = generatedText.replace(/```\n?/g, '');
        }

        const tips = JSON.parse(generatedText);
        return tips;

    } catch (error) {
        console.error('Gemini API error:', error);
        return ['Cook with love and patience!'];
    }
};
        