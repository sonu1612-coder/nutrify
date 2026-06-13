// Nutrify Calculator Logic
// Exposes window.NutrifyCalculator with formulas for BMR, TDEE, and macros.

(function() {
  const NutrifyCalculator = {
    // Convert lbs to kg
    convertToKg(weight, weightUnit) {
      const val = parseFloat(weight) || 0;
      if (weightUnit === 'lbs') {
        return val * 0.45359237;
      }
      return val;
    },

    // Convert feet/inches or cm to cm
    convertToCm(h1, h2, heightUnit) {
      if (heightUnit === 'ft') {
        const feet = parseFloat(h1) || 0;
        const inches = parseFloat(h2) || 0;
        return (feet * 12 + inches) * 2.54;
      }
      return parseFloat(h1) || 0;
    },

    // Calculate BMR using Mifflin-St Jeor Equation
    calculateBMR(weightKg, heightCm, age, gender) {
      const w = parseFloat(weightKg) || 0;
      const h = parseFloat(heightCm) || 0;
      const a = parseInt(age) || 0;

      if (gender === 'female') {
        return 10 * w + 6.25 * h - 5 * a - 161;
      }
      // Default to male
      return 10 * w + 6.25 * h - 5 * a + 5;
    },

    // Calculate TDEE using activity levels
    calculateTDEE(bmr, activity) {
      const multipliers = {
        'sedentary': 1.2,
        'light': 1.375,
        'moderate': 1.55,
        'active': 1.725
      };
      return bmr * (multipliers[activity] || 1.2);
    },

    // Calculate daily calorie target
    calculateCaloricTarget(tdee, goal) {
      if (goal === 'lose') {
        // Safe limit of 1200 calories minimum
        return Math.max(tdee - 500, 1200);
      } else if (goal === 'gain') {
        return tdee + 300;
      }
      // maintain
      return tdee;
    },

    // Calculate macronutrient distribution in grams
    calculateMacros(targetCalories, goal) {
      let pRatio, cRatio, fRatio;

      if (goal === 'lose') {
        // High protein, moderate fat/carb
        pRatio = 0.30;
        cRatio = 0.35;
        fRatio = 0.35;
      } else if (goal === 'gain') {
        // High carb, moderate protein, lower fat
        pRatio = 0.25;
        cRatio = 0.50;
        fRatio = 0.25;
      } else {
        // Balanced
        pRatio = 0.25;
        cRatio = 0.45;
        fRatio = 0.30;
      }

      return {
        protein: Math.round((targetCalories * pRatio) / 4),
        carbs: Math.round((targetCalories * cRatio) / 4),
        fat: Math.round((targetCalories * fRatio) / 9)
      };
    },

    // Calculate BMI
    calculateBMI(weightKg, heightCm) {
      const w = parseFloat(weightKg) || 0;
      const h = (parseFloat(heightCm) || 0) / 100; // convert cm to meters
      if (h === 0) return 0;
      return parseFloat((w / (h * h)).toFixed(1));
    },

    // Get BMI Category text
    getBMICategory(bmi) {
      if (bmi < 18.5) return 'Underweight';
      if (bmi < 25) return 'Normal';
      if (bmi < 30) return 'Overweight';
      return 'Obese';
    }
  };

  window.NutrifyCalculator = NutrifyCalculator;
})();

