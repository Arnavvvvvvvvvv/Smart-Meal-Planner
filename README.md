# 🍳 Smart Meal Planner

An AI-powered meal planning and pantry management platform that helps users generate recipes, organize ingredients, plan meals, and manage grocery shopping efficiently.

## 🚀 Features

### 🤖 AI Recipe Generation
- Generate recipes using Gemini AI
- Customize recipes based on ingredients
- Dietary restriction support
- Cuisine preference selection
- Adjustable serving sizes
- Cooking time preferences

### 🥫 Pantry Management
- Add and manage pantry items
- Track ingredient quantities
- Monitor expiring ingredients
- Pantry-based recipe suggestions

### 📅 Meal Planning
- Weekly meal planning
- Breakfast, lunch, and dinner scheduling
- Upcoming meals dashboard
- Meal calendar view

### 🛒 Smart Shopping List
- Create shopping lists 
- Categorized shopping items
- Mark items as purchased
- Move purchased items directly to pantry

### 👤 User Management
- JWT Authentication
- User Profiles
- Dietary Preferences
- Password Management

---

## 🛠️ Tech Stack

### Frontend
- React.js
- Vite
- Tailwind CSS
- Axios
- React Router
- React Hot Toast

### Backend
- Node.js
- Express.js
- PostgreSQL
- JWT + Google OAuth Authentication

### AI Integration
- Google Gemini API

### Deployment
- Vercel (Frontend)
- Railway (Backend)
- Neon PostgreSQL (Database)

---

# 🏗️ System Architecture

```text
                    User
                     |
                     |
              React Frontend
              (Vercel)
                     |
                     |
              Express Backend
              (Railway)
                     |
        ---------------------------
        |                         |
 PostgreSQL Database        Gemini AI API
     (Neon)              Recipe Generation
```

---

# 🗄️ Database Schema

```mermaid
erDiagram

    USERS {
        UUID id PK
        VARCHAR email
        VARCHAR name
        VARCHAR password_hash
        VARCHAR google_id
    }

    USER_PREFERENCES {
        UUID id PK
        UUID user_id FK
        TEXT dietary_restrictions
        TEXT allergies
        TEXT preferred_cuisines
    }

    PANTRY_ITEMS {
        UUID id PK
        UUID user_id FK
        VARCHAR name
        DECIMAL quantity
        VARCHAR category
        DATE expiry_date
    }

    RECIPES {
        UUID id PK
        UUID user_id FK
        VARCHAR name
        VARCHAR cuisine_type
        JSONB instructions
        TEXT dietary_tags
    }

    RECIPE_INGREDIENTS {
        UUID id PK
        UUID recipe_id FK
        VARCHAR ingredient_name
        DECIMAL quantity
    }

    RECIPE_NUTRITION {
        UUID id PK
        UUID recipe_id FK
        INT calories
        DECIMAL protein
        DECIMAL carbs
        DECIMAL fats
    }

    MEAL_PLANS {
        UUID id PK
        UUID user_id FK
        UUID recipe_id FK
        DATE meal_date
        VARCHAR meal_type
    }

    SHOPPING_LISTS {
        UUID id PK
        UUID user_id FK
        VARCHAR ingredient_name
        BOOLEAN is_checked
    }


    USERS ||--|| USER_PREFERENCES : has

    USERS ||--o{ PANTRY_ITEMS : owns

    USERS ||--o{ RECIPES : creates

    RECIPES ||--o{ RECIPE_INGREDIENTS : contains

    RECIPES ||--|| RECIPE_NUTRITION : has

    USERS ||--o{ MEAL_PLANS : creates

    RECIPES ||--o{ MEAL_PLANS : scheduled_in

    USERS ||--o{ SHOPPING_LISTS : manages
```
---

User
 │
 │ Select Ingredients
 ▼
React Frontend
 │
 │ POST /generate-recipe
 ▼
Express Backend
 │
 │ Prompt Engineering
 ▼
Gemini API
 │
 │ JSON Recipe
 ▼
Backend Validation
 │
 │ Save Recipe
 ▼
PostgreSQL
 │
 ▼
Frontend Displays Recipe

## 📂 Project Structure

```text
Smart-Meal-Planner
│
├── backend
│   ├── config
│   ├── controllers
│   ├── middleware
│   ├── models
│   ├── routes
│   ├── utils
│   └── server.js
│
└── frontend
    └── AIrecipe
        ├── public
        ├── src
        └── vite.config.js
```

---

## ⚙️ Environment Variables

### Backend (.env)

```env
PORT=8000
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
NODE_ENV=development
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:8000/api
```

---

## 🔧 Local Setup

### Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/Smart-Meal-Planner.git
cd Smart-Meal-Planner
```

### Backend Setup

```bash
cd backend
npm install
npm start
```

### Frontend Setup

```bash
cd frontend/AIrecipe
npm install
npm run dev
```

---

## 🌐 Live Demo

Frontend: [smart-meal-planner-two.vercel.app](https://smart-meal-planner-two.vercel.app/)

Backend API: https://smart-meal-planner-production-25be.up.railway.app/

---

## 🎯 Real-World Use Cases

- **Homemakers** – Simplifies daily meal planning, pantry management, and grocery shopping.
- **Busy Professionals** – Quickly generates recipes from available ingredients and helps plan meals for the week.
- **Students Living Away From Home** – Suggests meals using limited ingredients and reduces food expenses.
- **Fitness Enthusiasts** – Supports dietary preferences and customized meal planning.
- **Small Cafes & Tiffin Services** – Assists in meal scheduling and ingredient procurement planning.
- **Food Waste Reduction** – Prioritizes recipes using available and expiring ingredients to minimize waste.

---

## 🔮 Future Improvements

- Nutrition analytics dashboard
- Email reminders for expiring pantry items
- Grocery price comparison
- Meal plan sharing and collaboration

---

## 👨‍💻 Author

**Arnav Jain**

![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react)

![Node](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js)

![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express)

![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql)

![Gemini](https://img.shields.io/badge/Google_Gemini-AI-blue?style=for-the-badge)

![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge)

![Tailwind](https://img.shields.io/badge/Tailwind-06B6D4?style=for-the-badge&logo=tailwindcss)
