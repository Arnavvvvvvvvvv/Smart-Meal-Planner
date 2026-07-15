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
- Calendar-based meal organization

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
- Microsoft Azure Service (Backend)
- Neon PostgreSQL (Database)

---

# 🏗️ System Architecture

```text
                    User
                     |
                     |
              React Frontend (Vercel)
                     |
                     |
              REST API Requests
                     |
                     |
              Express Backend (Azure)
                     |
        ---------------------------
        |                         |
 PostgreSQL Database        Gemini AI API
     (Neon)                Recipe Generation
```

## 🤖 AI Recipe Generation Flow

```text
        User
          │
          │ Select ingredients, cuisine,
          │ dietary preferences & servings
          ▼
   React Frontend (Vercel)
          │
          │ POST /api/recipes/generate
          ▼
 Express Backend (Railway)
          │
          │ Validate request
          │ Build AI prompt
          ▼
     Google Gemini API
          │
          │ Generate recipe in JSON format
          ▼
 Express Backend
          │
          │ Parse & validate response
          │ Store recipe in PostgreSQL
          ▼
 PostgreSQL Database (Neon)
          │
          ▼
 React Frontend
          │
          ▼
 User receives the generated recipe with
 ingredients, instructions, nutrition, and
 cooking details
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

Backend API: [https://ai-meal-planner-c6bcdwdracddfkd4.centralindia-01.azurewebsites.net/](https://ai-meal-planner-c6bcdwdracddfkd4.centralindia-01.azurewebsites.net/)

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
- AI meal recommendations based on previous history
- Grocery price comparison
- Meal plan sharing and collaboration
- Mobile application using React Native

---

## 👨‍💻 Author

**Arnav Jain**

Built using **React.js, Vite, Tailwind CSS, Node.js, Express.js, PostgreSQL, Google Gemini AI, JWT Authentication, Google OAuth, Microsoft Azure App Service, Vercel, and Neon PostgreSQL.**
