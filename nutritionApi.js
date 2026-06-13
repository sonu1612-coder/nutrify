// Nutrition API Client
// Integrates with Open Food Facts API with a local common food dictionary fallback.

(function() {
  // Local food fallback database (values per 100g)
  const LOCAL_FOOD_DB = {
    "banana": {
      name: "Banana",
      nutritionPer100g: { calories: 89, protein: 1.1, carbs: 22.8, fat: 0.3 }
    },
    "apple": {
      name: "Apple",
      nutritionPer100g: { calories: 52, protein: 0.3, carbs: 13.8, fat: 0.2 }
    },
    "chicken breast": {
      name: "Chicken Breast (Cooked)",
      nutritionPer100g: { calories: 165, protein: 31, carbs: 0, fat: 3.6 }
    },
    "white rice": {
      name: "White Rice (Cooked)",
      nutritionPer100g: { calories: 130, protein: 2.7, carbs: 28, fat: 0.3 }
    },
    "egg": {
      name: "Whole Egg (Boiled)",
      nutritionPer100g: { calories: 155, protein: 13, carbs: 1.1, fat: 11 }
    },
    "milk": {
      name: "Whole Milk",
      nutritionPer100g: { calories: 42, protein: 3.4, carbs: 5, fat: 1 }
    },
    "oats": {
      name: "Oatmeal / Rolled Oats",
      nutritionPer100g: { calories: 389, protein: 16.9, carbs: 66.3, fat: 6.9 }
    },
    "salmon": {
      name: "Salmon Fillet (Baked)",
      nutritionPer100g: { calories: 208, protein: 20, carbs: 0, fat: 13 }
    },
    "almond": {
      name: "Almonds",
      nutritionPer100g: { calories: 579, protein: 21, carbs: 22, fat: 49 }
    },
    "almonds": {
      name: "Almonds",
      nutritionPer100g: { calories: 579, protein: 21, carbs: 22, fat: 49 }
    },
    "broccoli": {
      name: "Broccoli (Steamed)",
      nutritionPer100g: { calories: 34, protein: 2.8, carbs: 7, fat: 0.4 }
    },
    "greek yogurt": {
      name: "Greek Yogurt (Plain, Low Fat)",
      nutritionPer100g: { calories: 59, protein: 10, carbs: 3.6, fat: 0.4 }
    },
    "avocado": {
      name: "Avocado",
      nutritionPer100g: { calories: 160, protein: 2, carbs: 9, fat: 15 }
    },
    "sweet potato": {
      name: "Sweet Potato (Baked)",
      nutritionPer100g: { calories: 86, protein: 1.6, carbs: 20, fat: 0.1 }
    },
    "peanut butter": {
      name: "Peanut Butter (Smooth)",
      nutritionPer100g: { calories: 588, protein: 25, carbs: 20, fat: 50 }
    },
    "beef": {
      name: "Lean Beef (Cooked)",
      nutritionPer100g: { calories: 250, protein: 26, carbs: 0, fat: 15 }
    },
    "tuna": {
      name: "Canned Tuna (in Water)",
      nutritionPer100g: { calories: 116, protein: 26, carbs: 0, fat: 1 }
    },
    "potato": {
      name: "Potato (Boiled)",
      nutritionPer100g: { calories: 87, protein: 1.9, carbs: 20, fat: 0.1 }
    },
    "spinach": {
      name: "Spinach (Raw)",
      nutritionPer100g: { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4 }
    },
    "olive oil": {
      name: "Olive Oil",
      nutritionPer100g: { calories: 884, protein: 0, carbs: 0, fat: 100 }
    },
    "protein powder": {
      name: "Whey Protein Powder",
      nutritionPer100g: { calories: 400, protein: 80, carbs: 6, fat: 6 }
    },
    "roti": {
      name: "Roti / Chapati (Wheat)",
      nutritionPer100g: { calories: 264, protein: 8.0, carbs: 55.0, fat: 1.5 }
    },
    "chapati": {
      name: "Roti / Chapati (Wheat)",
      nutritionPer100g: { calories: 264, protein: 8.0, carbs: 55.0, fat: 1.5 }
    },
    "paneer": {
      name: "Paneer (Cottage Cheese)",
      nutritionPer100g: { calories: 265, protein: 18.0, carbs: 1.2, fat: 20.8 }
    },
    "dal": {
      name: "Dal Tadka (Lentils)",
      nutritionPer100g: { calories: 120, protein: 6.0, carbs: 18.0, fat: 2.5 }
    },
    "chicken biryani": {
      name: "Chicken Biryani",
      nutritionPer100g: { calories: 163, protein: 9.0, carbs: 22.0, fat: 4.5 }
    },
    "veg biryani": {
      name: "Veg Biryani",
      nutritionPer100g: { calories: 140, protein: 3.0, carbs: 24.0, fat: 3.5 }
    },
    "biryani": {
      name: "Chicken Biryani",
      nutritionPer100g: { calories: 163, protein: 9.0, carbs: 22.0, fat: 4.5 }
    },
    "idli": {
      name: "Idli (Steamed Rice Cake)",
      nutritionPer100g: { calories: 112, protein: 3.2, carbs: 23.0, fat: 0.4 }
    },
    "dosa": {
      name: "Masala Dosa",
      nutritionPer100g: { calories: 168, protein: 3.9, carbs: 29.0, fat: 3.7 }
    },
    "masala dosa": {
      name: "Masala Dosa",
      nutritionPer100g: { calories: 168, protein: 3.9, carbs: 29.0, fat: 3.7 }
    },
    "samosa": {
      name: "Samosa",
      nutritionPer100g: { calories: 262, protein: 4.5, carbs: 32.0, fat: 13.0 }
    },
    "chana masala": {
      name: "Chana Masala (Chickpeas)",
      nutritionPer100g: { calories: 130, protein: 5.0, carbs: 20.0, fat: 3.0 }
    },
    "butter chicken": {
      name: "Butter Chicken",
      nutritionPer100g: { calories: 210, protein: 14.0, carbs: 4.0, fat: 15.0 }
    },
    "aloo paratha": {
      name: "Aloo Paratha (Stuffed)",
      nutritionPer100g: { calories: 210, protein: 4.0, carbs: 35.0, fat: 6.0 }
    },
    "khichdi": {
      name: "Khichdi (Rice & Lentils)",
      nutritionPer100g: { calories: 110, protein: 3.5, carbs: 20.0, fat: 1.8 }
    }
  };

  const NutritionAPI = {
    // Search OpenFoodFacts with a local fallback
    async searchProducts(query) {
      if (!query) return [];
      const queryLower = query.toLowerCase().trim();
      
      // Collect local database matches
      const localMatches = [];
      for (const key in LOCAL_FOOD_DB) {
        if (key.includes(queryLower) || queryLower.includes(key)) {
          localMatches.push({
            name: LOCAL_FOOD_DB[key].name,
            brand: "Common Food",
            nutritionPer100g: LOCAL_FOOD_DB[key].nutritionPer100g
          });
        }
      }

      let apiMatches = [];
      try {
        const response = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1`);
        if (response.ok) {
          const data = await response.json();
          if (data && data.products) {
            apiMatches = data.products
              .filter(p => p.product_name)
              .map(p => {
                const nutriments = p.nutriments || {};
                let calories = 0;
                if (nutriments['energy-kcal_100g'] !== undefined) {
                  calories = parseFloat(nutriments['energy-kcal_100g']);
                } else if (nutriments['energy_100g'] !== undefined) {
                  calories = parseFloat(nutriments['energy_100g']) / 4.184; // convert kJ to kcal
                }

                return {
                  name: p.product_name,
                  brand: p.brands || "",
                  nutritionPer100g: {
                    calories: Math.round(calories) || 0,
                    protein: parseFloat(nutriments.proteins_100g || 0),
                    carbs: parseFloat(nutriments.carbohydrates_100g || 0),
                    fat: parseFloat(nutriments.fat_100g || 0)
                  }
                };
              });
          }
        }
      } catch (err) {
        console.warn("OpenFoodFacts search offline or failed. Falling back to local data.", err);
      }

      // Combine local matches first, then api matches, max 12 items
      const combined = [...localMatches, ...apiMatches];
      
      // Deduplicate by name
      const seen = new Set();
      const unique = [];
      for (const item of combined) {
        const id = `${item.name.toLowerCase()}-${item.brand.toLowerCase()}`;
        if (!seen.has(id)) {
          seen.add(id);
          unique.push(item);
        }
      }

      return unique.slice(0, 15);
    },

    // Query a product by its barcode
    async getProductByBarcode(barcode) {
      if (!barcode) return null;
      try {
        const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${encodeURIComponent(barcode)}.json`);
        if (response.ok) {
          const data = await response.json();
          if (data && data.status === 1 && data.product) {
            const p = data.product;
            const nutriments = p.nutriments || {};
            let calories = 0;
            if (nutriments['energy-kcal_100g'] !== undefined) {
              calories = parseFloat(nutriments['energy-kcal_100g']);
            } else if (nutriments['energy_100g'] !== undefined) {
              calories = parseFloat(nutriments['energy_100g']) / 4.184;
            }

            return {
              name: p.product_name || p.product_name_en || "Unknown Product",
              brand: p.brands || "",
              nutritionPer100g: {
                calories: Math.round(calories) || 0,
                protein: parseFloat(nutriments.proteins_100g || 0),
                carbs: parseFloat(nutriments.carbohydrates_100g || 0),
                fat: parseFloat(nutriments.fat_100g || 0)
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

  window.NutritionAPI = NutritionAPI;
})();
