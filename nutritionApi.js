// Nutrition API Client - Hybrid Database Architecture
// Integrates Local Safe-Zone DB, Supabase Cloud DB, and OpenFoodFacts API.

(function() {
  // Offline Safe-Zone: Essential Indian & Generic Foods
  const LOCAL_FOOD_DB = {
    "roti": { name: "Roti / Chapati / Phulka", brand: "Homemade", serving_options: [{ serving: "1 medium (30g)", grams: 30 }, { serving: "100 grams", grams: 100 }], nutritionPer100g: { calories: 264, protein: 8.0, carbs: 55.0, fat: 1.5 } },
    "rice": { name: "White Rice (Cooked)", brand: "Homemade", serving_options: [{ serving: "1 Katori / Bowl (150g)", grams: 150 }, { serving: "100 grams", grams: 100 }], nutritionPer100g: { calories: 130, protein: 2.7, carbs: 28, fat: 0.3 } },
    "brown rice": { name: "Brown Rice (Cooked)", brand: "Homemade", serving_options: [{ serving: "1 Katori (150g)", grams: 150 }, { serving: "100 grams", grams: 100 }], nutritionPer100g: { calories: 112, protein: 2.6, carbs: 24, fat: 0.9 } },
    "dal": { name: "Dal Tadka (Lentils)", brand: "Homemade", serving_options: [{ serving: "1 Katori / Bowl (150g)", grams: 150 }, { serving: "100 grams", grams: 100 }], nutritionPer100g: { calories: 120, protein: 6.0, carbs: 18.0, fat: 2.5 } },
    "curd": { name: "Curd / Dahi", brand: "Homemade", serving_options: [{ serving: "1 Katori (150g)", grams: 150 }, { serving: "100 grams", grams: 100 }], nutritionPer100g: { calories: 98, protein: 3.5, carbs: 3.4, fat: 4.3 } },
    "salad": { name: "Green Salad (Cucumber, Tomato, Onion)", brand: "Homemade", serving_options: [{ serving: "1 Plate (150g)", grams: 150 }, { serving: "100 grams", grams: 100 }], nutritionPer100g: { calories: 20, protein: 1.0, carbs: 4.0, fat: 0.2 } },
    "rajma": { name: "Rajma Masala", brand: "Homemade", serving_options: [{ serving: "1 Katori (150g)", grams: 150 }, { serving: "100 grams", grams: 100 }], nutritionPer100g: { calories: 140, protein: 5.5, carbs: 20.0, fat: 4.0 } },
    "chole": { name: "Chole Masala (Chickpea Curry)", brand: "Homemade", serving_options: [{ serving: "1 Katori (150g)", grams: 150 }, { serving: "100 grams", grams: 100 }], nutritionPer100g: { calories: 160, protein: 6.5, carbs: 22.0, fat: 5.0 } },
    "poha": { name: "Poha", brand: "Homemade", serving_options: [{ serving: "1 Katori (150g)", grams: 150 }, { serving: "100 grams", grams: 100 }], nutritionPer100g: { calories: 130, protein: 2.5, carbs: 25.0, fat: 1.5 } },
    "aloo poha": { name: "Aloo Poha", brand: "Homemade", serving_options: [{ serving: "1 Katori (150g)", grams: 150 }, { serving: "100 grams", grams: 100 }], nutritionPer100g: { calories: 145, protein: 2.6, carbs: 28.0, fat: 2.5 } },
    "peanuts": { name: "Roasted Peanuts", brand: "Homemade", serving_options: [{ serving: "1 handful (30g)", grams: 30 }, { serving: "100 grams", grams: 100 }], nutritionPer100g: { calories: 567, protein: 25.8, carbs: 16.1, fat: 49.2 } },
    "oats upma": { name: "Oats Upma", brand: "Homemade", serving_options: [{ serving: "1 Katori (150g)", grams: 150 }, { serving: "100 grams", grams: 100 }], nutritionPer100g: { calories: 110, protein: 3.5, carbs: 18.0, fat: 2.5 } },
    "upma": { name: "Rava Upma", brand: "Homemade", serving_options: [{ serving: "1 Katori (150g)", grams: 150 }, { serving: "100 grams", grams: 100 }], nutritionPer100g: { calories: 140, protein: 3.5, carbs: 23.0, fat: 3.5 } },
    "idli": { name: "Idli", brand: "Homemade", serving_options: [{ serving: "2 pieces (100g)", grams: 100 }, { serving: "100 grams", grams: 100 }], nutritionPer100g: { calories: 112, protein: 3.2, carbs: 23.0, fat: 0.4 } },
    "sambar": { name: "Sambar", brand: "Homemade", serving_options: [{ serving: "1 Katori (150g)", grams: 150 }, { serving: "100 grams", grams: 100 }], nutritionPer100g: { calories: 75, protein: 3.0, carbs: 11.0, fat: 1.5 } },
    "coconut chutney": { name: "Coconut Chutney", brand: "Homemade", serving_options: [{ serving: "2 tablespoons (30g)", grams: 30 }, { serving: "100 grams", grams: 100 }], nutritionPer100g: { calories: 250, protein: 3.0, carbs: 10.0, fat: 23.0 } },
    "moong dal chilla": { name: "Moong Dal Chilla", brand: "Homemade", serving_options: [{ serving: "1 Chilla (60g)", grams: 60 }, { serving: "100 grams", grams: 100 }], nutritionPer100g: { calories: 135, protein: 7.0, carbs: 18.0, fat: 3.5 } },
    "mint chutney": { name: "Mint / Pudina Chutney", brand: "Homemade", serving_options: [{ serving: "2 tablespoons (30g)", grams: 30 }, { serving: "100 grams", grams: 100 }], nutritionPer100g: { calories: 45, protein: 1.5, carbs: 8.0, fat: 0.5 } },
    "sprouts": { name: "Mixed Sprouts Salad", brand: "Homemade", serving_options: [{ serving: "1 Katori (150g)", grams: 150 }, { serving: "100 grams", grams: 100 }], nutritionPer100g: { calories: 105, protein: 8.0, carbs: 18.0, fat: 0.5 } },
    "veg paratha": { name: "Mix Veg Paratha", brand: "Homemade", serving_options: [{ serving: "1 medium (80g)", grams: 80 }, { serving: "100 grams", grams: 100 }], nutritionPer100g: { calories: 220, protein: 6.0, carbs: 32.0, fat: 8.0 } },
    "stuffed paratha": { name: "Aloo / Stuffed Paratha", brand: "Homemade", serving_options: [{ serving: "1 medium (100g)", grams: 100 }, { serving: "100 grams", grams: 100 }], nutritionPer100g: { calories: 260, protein: 6.5, carbs: 38.0, fat: 9.0 } },
    "fruit yogurt bowl": { name: "Fruit & Yogurt Bowl", brand: "Homemade", serving_options: [{ serving: "1 Bowl (200g)", grams: 200 }, { serving: "100 grams", grams: 100 }], nutritionPer100g: { calories: 85, protein: 3.5, carbs: 14.0, fat: 1.5 } },
    "nuts": { name: "Mixed Nuts (Almonds, Walnuts)", brand: "Homemade", serving_options: [{ serving: "1 handful (30g)", grams: 30 }, { serving: "100 grams", grams: 100 }], nutritionPer100g: { calories: 600, protein: 20.0, carbs: 21.0, fat: 54.0 } },
    "pulao": { name: "Veg Pulao / Quinoa", brand: "Homemade", serving_options: [{ serving: "1 Bowl (200g)", grams: 200 }, { serving: "100 grams", grams: 100 }], nutritionPer100g: { calories: 150, protein: 3.5, carbs: 28.0, fat: 2.5 } },
    "mix veg": { name: "Mix Veg Sabji", brand: "Homemade", serving_options: [{ serving: "1 Katori (150g)", grams: 150 }, { serving: "100 grams", grams: 100 }], nutritionPer100g: { calories: 95, protein: 2.5, carbs: 12.0, fat: 4.5 } },
    "baingan bharta": { name: "Baingan Bharta", brand: "Homemade", serving_options: [{ serving: "1 Katori (150g)", grams: 150 }, { serving: "100 grams", grams: 100 }], nutritionPer100g: { calories: 90, protein: 2.0, carbs: 10.0, fat: 5.0 } },
    "lemon rice": { name: "Lemon Rice", brand: "Homemade", serving_options: [{ serving: "1 Bowl (200g)", grams: 200 }, { serving: "100 grams", grams: 100 }], nutritionPer100g: { calories: 160, protein: 3.0, carbs: 30.0, fat: 3.0 } },
    "veg biryani": { name: "Veg Biryani", brand: "Homemade", serving_options: [{ serving: "1 Bowl (200g)", grams: 200 }, { serving: "100 grams", grams: 100 }], nutritionPer100g: { calories: 165, protein: 3.5, carbs: 28.0, fat: 4.0 } },
    "khichdi": { name: "Vegetable Khichdi", brand: "Homemade", serving_options: [{ serving: "1 Bowl (200g)", grams: 200 }, { serving: "100 grams", grams: 100 }], nutritionPer100g: { calories: 110, protein: 3.5, carbs: 19.0, fat: 2.0 } },
    "raita": { name: "Cucumber / Boondi Raita", brand: "Homemade", serving_options: [{ serving: "1 Katori (150g)", grams: 150 }, { serving: "100 grams", grams: 100 }], nutritionPer100g: { calories: 70, protein: 3.0, carbs: 5.0, fat: 4.0 } },
    "veg sandwich": { name: "Veg Sandwich", brand: "Homemade", serving_options: [{ serving: "1 Sandwich (150g)", grams: 150 }, { serving: "100 grams", grams: 100 }], nutritionPer100g: { calories: 220, protein: 6.0, carbs: 35.0, fat: 6.0 } },
    "soup": { name: "Vegetable Soup", brand: "Homemade", serving_options: [{ serving: "1 Bowl (200g)", grams: 200 }, { serving: "100 ml", grams: 100 }], nutritionPer100g: { calories: 35, protein: 1.0, carbs: 6.0, fat: 0.5 } },
    "palak paneer": { name: "Palak Paneer", brand: "Homemade", serving_options: [{ serving: "1 Katori (150g)", grams: 150 }, { serving: "100 grams", grams: 100 }], nutritionPer100g: { calories: 140, protein: 7.0, carbs: 5.0, fat: 10.0 } },
    "daliya": { name: "Vegetable Daliya", brand: "Homemade", serving_options: [{ serving: "1 Bowl (200g)", grams: 200 }, { serving: "100 grams", grams: 100 }], nutritionPer100g: { calories: 105, protein: 3.5, carbs: 20.0, fat: 1.5 } },
    "paneer tikka": { name: "Paneer Tikka", brand: "Homemade", serving_options: [{ serving: "4 pieces (120g)", grams: 120 }, { serving: "100 grams", grams: 100 }], nutritionPer100g: { calories: 220, protein: 14.0, carbs: 4.0, fat: 16.0 } },
    "poori": { name: "Puri / Poori", brand: "Homemade", serving_options: [{ serving: "2 puris (50g)", grams: 50 }, { serving: "100 grams", grams: 100 }], nutritionPer100g: { calories: 320, protein: 6.0, carbs: 42.0, fat: 15.0 } },
    "puri": { name: "Puri / Poori", brand: "Homemade", serving_options: [{ serving: "2 puris (50g)", grams: 50 }, { serving: "100 grams", grams: 100 }], nutritionPer100g: { calories: 320, protein: 6.0, carbs: 42.0, fat: 15.0 } },
    "kaddu": { name: "Kaddu Ki Sabji (Pumpkin Curry)", brand: "Homemade", serving_options: [{ serving: "1 Katori (150g)", grams: 150 }, { serving: "100 grams", grams: 100 }], nutritionPer100g: { calories: 75, protein: 1.5, carbs: 10.0, fat: 3.5 } },
    "millet roti": { name: "Millet / Bajra / Jowar Roti", brand: "Homemade", serving_options: [{ serving: "1 medium (40g)", grams: 40 }, { serving: "100 grams", grams: 100 }], nutritionPer100g: { calories: 280, protein: 8.5, carbs: 55.0, fat: 3.0 } }
  };

  const NutritionAPI = {
    // Advanced Hybrid Search Engine
    async searchProducts(query) {
      if (!query) return [];
      const queryLower = query.toLowerCase().trim();
      
      let results = [];

      // 1. Fetch from Recent Foods Cache (if any)
      const recentFoods = JSON.parse(localStorage.getItem('nutrify_recent_foods')) || [];
      recentFoods.forEach(item => {
        if (item.name.toLowerCase().includes(queryLower)) {
          results.push(item);
        }
      });

      // 2. Fetch from Local Safe-Zone DB
      for (const key in LOCAL_FOOD_DB) {
        if (key.includes(queryLower) || LOCAL_FOOD_DB[key].name.toLowerCase().includes(queryLower)) {
          results.push({
            name: LOCAL_FOOD_DB[key].name,
            brand: LOCAL_FOOD_DB[key].brand,
            serving_options: LOCAL_FOOD_DB[key].serving_options,
            nutritionPer100g: LOCAL_FOOD_DB[key].nutritionPer100g
          });
        }
      }

      // Deduplicate local + recent
      results = deduplicateResults(results);

      // If we have less than 5 results, query the Supabase Cloud DB
      if (results.length < 5 && window.supabaseClient) {
        try {
          // Use Supabase textSearch for fuzzy searching
          const { data, error } = await window.supabaseClient
            .from('indian_foods')
            .select('*')
            .textSearch('name', queryLower, { type: 'websearch' })
            .limit(10);
            
          if (!error && data && data.length > 0) {
            const cloudMatches = data.map(dbItem => ({
              name: dbItem.name,
              brand: "Generic",
              serving_options: dbItem.serving_options || [{ serving: "100 grams", grams: 100 }],
              nutritionPer100g: dbItem.nutrition_per_100g
            }));
            results = [...results, ...cloudMatches];
          }
        } catch (err) {
          console.warn("Supabase search failed. Offline mode active?", err);
        }
      }

      // Deduplicate after Cloud
      results = deduplicateResults(results);

      // 3. Fallback to OpenFoodFacts if still not enough results
      if (results.length < 5 && navigator.onLine) {
        try {
          const response = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1`);
          if (response.ok) {
            const data = await response.json();
            if (data && data.products) {
              const apiMatches = data.products
                .filter(p => p.product_name)
                .map(p => {
                  const nutriments = p.nutriments || {};
                  let calories = parseFloat(nutriments['energy-kcal_100g']);
                  if (isNaN(calories) && nutriments['energy_100g'] !== undefined) {
                    calories = parseFloat(nutriments['energy_100g']) / 4.184;
                  }

                  return {
                    name: p.product_name,
                    brand: "Generic",
                    serving_options: [
                      { serving: "100 grams", grams: 100 }
                    ],
                    nutritionPer100g: {
                      calories: Math.round(calories) || 0,
                      protein: parseFloat(nutriments.proteins_100g || 0),
                      carbs: parseFloat(nutriments.carbohydrates_100g || 0),
                      fat: parseFloat(nutriments.fat_100g || 0),
                      fiber: parseFloat(nutriments.fiber_100g || 0),
                      sugar: parseFloat(nutriments.sugars_100g || 0),
                      sodium: parseFloat(nutriments.sodium_100g || 0) * 1000, // Convert to mg
                      potassium: parseFloat(nutriments.potassium_100g || 0) * 1000,
                      calcium: parseFloat(nutriments.calcium_100g || 0) * 1000,
                      iron: parseFloat(nutriments.iron_100g || 0) * 1000,
                      vitaminA: parseFloat(nutriments.vitamin_a_100g || 0) * 1000000, // Convert to mcg
                      vitaminC: parseFloat(nutriments.vitamin_c_100g || 0) * 1000,
                      vitaminD: parseFloat(nutriments.vitamin_d_100g || 0) * 1000000,
                      aminoAcids: {
                        leucine: 0,
                        isoleucine: 0,
                        valine: 0
                      }
                    }
                  };
                });
              results = [...results, ...apiMatches];
            }
          }
        } catch (err) {
          console.warn("OpenFoodFacts offline.");
        }
      }

      return deduplicateResults(results).slice(0, 15);
    },

    // Save item to recent foods cache
    cacheRecentFood(product) {
      let recent = JSON.parse(localStorage.getItem('nutrify_recent_foods')) || [];
      // Remove if exists
      recent = recent.filter(r => r.name !== product.name);
      // Add to top
      recent.unshift(product);
      // Keep only last 50
      if (recent.length > 50) recent.pop();
      localStorage.setItem('nutrify_recent_foods', JSON.stringify(recent));
    },

    // Barcode querying stays similar but maps to serving options format
    async getProductByBarcode(barcode) {
      if (!barcode) return null;
      try {
        const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${encodeURIComponent(barcode)}.json`);
        if (response.ok) {
          const data = await response.json();
          if (data && data.status === 1 && data.product) {
            const p = data.product;
            const nutriments = p.nutriments || {};
            let calories = parseFloat(nutriments['energy-kcal_100g']);
            if (isNaN(calories) && nutriments['energy_100g'] !== undefined) {
              calories = parseFloat(nutriments['energy_100g']) / 4.184;
            }

            return {
              name: p.product_name || p.product_name_en || "Unknown Product",
              brand: "Generic",
              serving_options: [{ serving: "100 grams", grams: 100 }],
              nutritionPer100g: {
                calories: Math.round(calories) || 0,
                protein: parseFloat(nutriments.proteins_100g || 0),
                carbs: parseFloat(nutriments.carbohydrates_100g || 0),
                fat: parseFloat(nutriments.fat_100g || 0),
                fiber: parseFloat(nutriments.fiber_100g || 0),
                sugar: parseFloat(nutriments.sugars_100g || 0),
                sodium: parseFloat(nutriments.sodium_100g || 0) * 1000,
                potassium: parseFloat(nutriments.potassium_100g || 0) * 1000,
                calcium: parseFloat(nutriments.calcium_100g || 0) * 1000,
                iron: parseFloat(nutriments.iron_100g || 0) * 1000,
                vitaminA: parseFloat(nutriments.vitamin_a_100g || 0) * 1000000,
                vitaminC: parseFloat(nutriments.vitamin_c_100g || 0) * 1000,
                vitaminD: parseFloat(nutriments.vitamin_d_100g || 0) * 1000000,
                aminoAcids: {
                  leucine: 0,
                  isoleucine: 0,
                  valine: 0
                }
              }
            };
          }
        }
      } catch (err) {
        console.error("OpenFoodFacts barcode retrieval error:", err);
      }
      return null;
    }
  };

  function deduplicateResults(results) {
    const seen = new Set();
    const unique = [];
    for (const item of results) {
      const id = `${item.name.toLowerCase()}-${item.brand.toLowerCase()}`;
      if (!seen.has(id)) {
        seen.add(id);
        unique.push(item);
      }
    }
    return unique;
  }

  window.NutritionAPI = NutritionAPI;
})();
