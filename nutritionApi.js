// Nutrition API Client - Hybrid Database Architecture
// Integrates Local Safe-Zone DB, Supabase Cloud DB, and OpenFoodFacts API.

(function() {
  // Offline Safe-Zone: Essential Indian & Generic Foods
  const LOCAL_FOOD_DB = {
    "roti": {
      name: "Roti / Chapati (Wheat)",
      brand: "Homemade",
      serving_options: [
        { serving: "1 medium (30g)", grams: 30 },
        { serving: "1 large (45g)", grams: 45 },
        { serving: "100 grams", grams: 100 }
      ],
      nutritionPer100g: { calories: 264, protein: 8.0, carbs: 55.0, fat: 1.5 }
    },
    "rice": {
      name: "White Rice (Cooked)",
      brand: "Homemade",
      serving_options: [
        { serving: "1 Katori / Bowl (150g)", grams: 150 },
        { serving: "1 Plate (300g)", grams: 300 },
        { serving: "100 grams", grams: 100 }
      ],
      nutritionPer100g: { calories: 130, protein: 2.7, carbs: 28, fat: 0.3 }
    },
    "dal": {
      name: "Dal Tadka (Lentils)",
      brand: "Homemade",
      serving_options: [
        { serving: "1 Katori / Bowl (150g)", grams: 150 },
        { serving: "100 grams", grams: 100 }
      ],
      nutritionPer100g: { calories: 120, protein: 6.0, carbs: 18.0, fat: 2.5 }
    },
    "egg": {
      name: "Whole Egg (Boiled)",
      brand: "Generic",
      serving_options: [
        { serving: "1 large egg (50g)", grams: 50 },
        { serving: "2 large eggs (100g)", grams: 100 },
        { serving: "100 grams", grams: 100 }
      ],
      nutritionPer100g: { calories: 155, protein: 13, carbs: 1.1, fat: 11 }
    },
    "milk": {
      name: "Whole Milk",
      brand: "Generic",
      serving_options: [
        { serving: "1 glass (250ml)", grams: 250 },
        { serving: "1 cup (150ml)", grams: 150 },
        { serving: "100 ml", grams: 100 }
      ],
      nutritionPer100g: { calories: 60, protein: 3.2, carbs: 4.8, fat: 3.3 }
    },
    "banana": {
      name: "Banana",
      brand: "Generic",
      serving_options: [
        { serving: "1 medium (118g)", grams: 118 },
        { serving: "1 large (136g)", grams: 136 },
        { serving: "100 grams", grams: 100 }
      ],
      nutritionPer100g: { calories: 89, protein: 1.1, carbs: 22.8, fat: 0.3 }
    },
    "chicken breast": {
      name: "Chicken Breast (Cooked)",
      brand: "Homemade",
      serving_options: [
        { serving: "1 small piece (100g)", grams: 100 },
        { serving: "100 grams", grams: 100 }
      ],
      nutritionPer100g: { calories: 165, protein: 31, carbs: 0, fat: 3.6 }
    },
    "paneer": {
      name: "Paneer (Cottage Cheese)",
      brand: "Generic",
      serving_options: [
        { serving: "1 cup cubed (150g)", grams: 150 },
        { serving: "100 grams", grams: 100 }
      ],
      nutritionPer100g: { calories: 265, protein: 18.0, carbs: 1.2, fat: 20.8 }
    },
    "apple": {
      name: "Apple",
      brand: "Generic",
      serving_options: [
        { serving: "1 medium (182g)", grams: 182 },
        { serving: "100 grams", grams: 100 }
      ],
      nutritionPer100g: { calories: 52, protein: 0.3, carbs: 13.8, fat: 0.2 }
    },
    "oats": {
      name: "Oatmeal / Rolled Oats (Dry)",
      brand: "Generic",
      serving_options: [
        { serving: "1 cup (40g)", grams: 40 },
        { serving: "100 grams", grams: 100 }
      ],
      nutritionPer100g: { calories: 389, protein: 16.9, carbs: 66.3, fat: 6.9 }
    },
    "idli": {
      name: "Idli (Steamed Rice Cake)",
      brand: "Homemade",
      serving_options: [
        { serving: "1 medium piece (50g)", grams: 50 },
        { serving: "2 pieces (100g)", grams: 100 },
        { serving: "100 grams", grams: 100 }
      ],
      nutritionPer100g: { calories: 112, protein: 3.2, carbs: 23.0, fat: 0.4 }
    },
    "samosa": {
      name: "Samosa",
      brand: "Street Food",
      serving_options: [
        { serving: "1 piece (70g)", grams: 70 },
        { serving: "100 grams", grams: 100 }
      ],
      nutritionPer100g: { calories: 262, protein: 4.5, carbs: 32.0, fat: 13.0 }
    },
    "poha": {
      name: "Poha",
      brand: "Homemade",
      serving_options: [
        { serving: "1 Katori / Bowl (150g)", grams: 150 },
        { serving: "100 grams", grams: 100 }
      ],
      nutritionPer100g: { calories: 130, protein: 2.5, carbs: 25.0, fat: 1.5 }
    },
    "upma": {
      name: "Upma",
      brand: "Homemade",
      serving_options: [
        { serving: "1 Katori / Bowl (150g)", grams: 150 },
        { serving: "100 grams", grams: 100 }
      ],
      nutritionPer100g: { calories: 140, protein: 3.5, carbs: 23.0, fat: 3.5 }
    },
    "tea": {
      name: "Masala Chai (with milk & sugar)",
      brand: "Generic",
      serving_options: [
        { serving: "1 cup (150ml)", grams: 150 },
        { serving: "1 glass (250ml)", grams: 250 },
        { serving: "100 ml", grams: 100 }
      ],
      nutritionPer100g: { calories: 60, protein: 1.5, carbs: 10.0, fat: 1.5 }
    },
    "black tea": {
      name: "Black Tea (Plain, no sugar)",
      brand: "Generic",
      serving_options: [
        { serving: "1 cup (150ml)", grams: 150 },
        { serving: "100 ml", grams: 100 }
      ],
      nutritionPer100g: { calories: 2, protein: 0, carbs: 0.5, fat: 0 }
    },
    "cold coffee": {
      name: "Cold Coffee (with milk & sugar)",
      brand: "Generic",
      serving_options: [
        { serving: "1 glass (300ml)", grams: 300 },
        { serving: "100 ml", grams: 100 }
      ],
      nutritionPer100g: { calories: 85, protein: 3.0, carbs: 12.0, fat: 2.5 }
    },
    "lassi": {
      name: "Sweet Lassi",
      brand: "Homemade",
      serving_options: [
        { serving: "1 glass (300ml)", grams: 300 },
        { serving: "100 ml", grams: 100 }
      ],
      nutritionPer100g: { calories: 75, protein: 3.5, carbs: 12.0, fat: 1.5 }
    },
    "sugar": {
      name: "White Sugar",
      brand: "Generic",
      serving_options: [
        { serving: "1 teaspoon (4g)", grams: 4 },
        { serving: "1 tablespoon (12g)", grams: 12 },
        { serving: "100 grams", grams: 100 }
      ],
      nutritionPer100g: { calories: 387, protein: 0, carbs: 100, fat: 0 }
    },
    "puri": {
      name: "Puri / Poori",
      brand: "Homemade",
      serving_options: [
        { serving: "1 medium puri (25g)", grams: 25 },
        { serving: "2 puris (50g)", grams: 50 },
        { serving: "100 grams", grams: 100 }
      ],
      nutritionPer100g: { calories: 320, protein: 6.0, carbs: 42.0, fat: 15.0 }
    },
    "sabji": {
      name: "Mixed Veg Sabji",
      brand: "Homemade",
      serving_options: [
        { serving: "1 Katori / Bowl (150g)", grams: 150 },
        { serving: "100 grams", grams: 100 }
      ],
      nutritionPer100g: { calories: 95, protein: 2.5, carbs: 12.0, fat: 4.5 }
    },
    "kaddu ki sabji": {
      name: "Kaddu Ki Sabji (Pumpkin Curry)",
      brand: "Homemade",
      serving_options: [
        { serving: "1 Katori / Bowl (150g)", grams: 150 },
        { serving: "100 grams", grams: 100 }
      ],
      nutritionPer100g: { calories: 75, protein: 1.5, carbs: 10.0, fat: 3.5 }
    },
    "bhindi ki sabji": {
      name: "Bhindi Ki Sabji (Okra/Ladyfinger)",
      brand: "Homemade",
      serving_options: [
        { serving: "1 Katori / Bowl (150g)", grams: 150 },
        { serving: "100 grams", grams: 100 }
      ],
      nutritionPer100g: { calories: 110, protein: 2.0, carbs: 10.0, fat: 7.0 }
    },
    "paratha": {
      name: "Plain Paratha",
      brand: "Homemade",
      serving_options: [
        { serving: "1 medium (50g)", grams: 50 },
        { serving: "1 large (80g)", grams: 80 },
        { serving: "100 grams", grams: 100 }
      ],
      nutritionPer100g: { calories: 330, protein: 7.5, carbs: 48.0, fat: 12.5 }
    },
    "naan": {
      name: "Butter Naan",
      brand: "Restaurant",
      serving_options: [
        { serving: "1 piece (90g)", grams: 90 },
        { serving: "100 grams", grams: 100 }
      ],
      nutritionPer100g: { calories: 310, protein: 9.0, carbs: 50.0, fat: 8.0 }
    },
    "palak paneer": {
      name: "Palak Paneer",
      brand: "Homemade",
      serving_options: [
        { serving: "1 Katori / Bowl (200g)", grams: 200 },
        { serving: "100 grams", grams: 100 }
      ],
      nutritionPer100g: { calories: 140, protein: 7.0, carbs: 5.0, fat: 10.0 }
    }
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
              brand: dbItem.brand || "Cloud DB",
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
                    brand: p.brands || "OpenFoodFacts",
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
              brand: p.brands || "",
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
