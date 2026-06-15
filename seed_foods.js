// seed_foods.js
// Node.js script to seed massive amounts of food into your Supabase database
// Run: npm install @supabase/supabase-js
// Then: node seed_foods.js

const { createClient } = require('@supabase/supabase-js');

// REPLACE THESE WITH YOUR ACTUAL SUPABASE URL AND SERVICE ROLE KEY
// IMPORTANT: Use the SERVICE_ROLE key here, NOT the publishable key, so you can bypass RLS for inserts.
const SUPABASE_URL = 'https://biwgybdoahycmdsskted.supabase.co';
const SUPABASE_SERVICE_KEY = 'YOUR_SUPABASE_SERVICE_ROLE_KEY';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const bulkFoods = [
  {
    name: "Chole Bhature",
    brand: "Indian Restaurant",
    category: "North Indian",
    serving_options: [
      { serving: "1 plate (2 bhature + chole)", grams: 350 },
      { serving: "100 grams", grams: 100 }
    ],
    nutrition_per_100g: { calories: 250, protein: 6, carbs: 28, fat: 12, fiber: 4 }
  },
  {
    name: "Masala Dosa",
    brand: "Generic",
    category: "South Indian",
    serving_options: [
      { serving: "1 medium dosa", grams: 120 },
      { serving: "1 large dosa", grams: 180 },
      { serving: "100 grams", grams: 100 }
    ],
    nutrition_per_100g: { calories: 168, protein: 3.9, carbs: 29.0, fat: 3.7, fiber: 2.1 }
  },
  {
    name: "Pani Puri",
    brand: "Street Food",
    category: "Snacks",
    serving_options: [
      { serving: "1 plate (6 puris)", grams: 150 },
      { serving: "1 puri", grams: 25 },
      { serving: "100 grams", grams: 100 }
    ],
    nutrition_per_100g: { calories: 150, protein: 3, carbs: 20, fat: 6, fiber: 2 }
  },
  {
    name: "Gulab Jamun",
    brand: "Sweet",
    category: "Desserts",
    serving_options: [
      { serving: "1 piece", grams: 40 },
      { serving: "2 pieces", grams: 80 },
      { serving: "100 grams", grams: 100 }
    ],
    nutrition_per_100g: { calories: 300, protein: 5, carbs: 50, fat: 10, fiber: 0 }
  }
  // Add thousands more here...
];

async function seedDatabase() {
  console.log(`Starting to seed ${bulkFoods.length} foods...`);
  
  // Supabase bulk insert
  const { data, error } = await supabase
    .from('indian_foods')
    .insert(bulkFoods);

  if (error) {
    console.error("Error inserting data:", error);
  } else {
    console.log("Successfully seeded foods into Supabase!");
  }
}

seedDatabase();
