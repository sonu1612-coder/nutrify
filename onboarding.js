// Onboarding Controller Logic

(function() {
  const form = document.getElementById('onboarding-form');
  const heightContainer = document.getElementById('height-inputs-container');
  
  // Load existing profile if it exists
  const existingProfile = JSON.parse(localStorage.getItem('nutrify_profile'));

  let activeHeightUnit = existingProfile ? existingProfile.heightUnit : 'cm';
  let activeWeightUnit = existingProfile ? existingProfile.weightUnit : 'kg';

  // Render height inputs dynamically
  function drawHeightInputs(unit) {
    activeHeightUnit = unit;
    if (unit === 'ft') {
      heightContainer.innerHTML = `
        <div class="grid grid-cols-2 gap-2">
          <input type="number" id="height_ft" value="${existingProfile && existingProfile.heightUnit === 'ft' ? (existingProfile.height1 || '') : ''}" required min="1" max="8" placeholder="Feet"
            class="w-full border border-outline-variant/30 rounded-xl px-3 py-2 bg-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-none">
          <input type="number" id="height_in" value="${existingProfile && existingProfile.heightUnit === 'ft' ? (existingProfile.height2 || '') : ''}" required min="0" max="11" placeholder="Inches"
            class="w-full border border-outline-variant/30 rounded-xl px-3 py-2 bg-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-none">
        </div>
      `;
    } else {
      heightContainer.innerHTML = `
        <input type="number" id="height_cm" value="${existingProfile && existingProfile.heightUnit === 'cm' ? (existingProfile.height1 || '') : ''}" required min="50" max="250" placeholder="Centimeters (e.g. 178)"
          class="w-full border border-outline-variant/30 rounded-xl px-3 py-2 bg-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-none">
      `;
    }
  }

  // Pre-fill general fields if profile exists
  if (existingProfile) {
    document.getElementById('gender').value = existingProfile.gender;
    document.getElementById('age').value = existingProfile.age;
    document.getElementById('weight').value = existingProfile.weight;
    document.getElementById('activity').value = existingProfile.activity;
    document.getElementById('goal').value = existingProfile.goal;

    // Set height button classes
    document.querySelectorAll('.unit-toggle-height').forEach(btn => {
      if (btn.dataset.unit === existingProfile.heightUnit) {
        btn.className = 'unit-toggle-height px-3 py-1 text-xs font-semibold rounded-lg bg-primary text-white';
      } else {
        btn.className = 'unit-toggle-height px-3 py-1 text-xs font-semibold rounded-lg bg-surface border border-outline-variant/30';
      }
    });

    // Set weight button classes
    document.querySelectorAll('.unit-toggle-weight').forEach(btn => {
      if (btn.dataset.unit === existingProfile.weightUnit) {
        btn.className = 'unit-toggle-weight px-3 py-1 text-xs font-semibold rounded-lg bg-primary text-white';
      } else {
        btn.className = 'unit-toggle-weight px-3 py-1 text-xs font-semibold rounded-lg bg-surface border border-outline-variant/30';
      }
    });
  }

  drawHeightInputs(activeHeightUnit);

  // Height unit button listeners
  document.querySelectorAll('.unit-toggle-height').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.unit-toggle-height').forEach(b => b.className = 'unit-toggle-height px-3 py-1 text-xs font-semibold rounded-lg bg-surface border border-outline-variant/30');
      e.currentTarget.className = 'unit-toggle-height px-3 py-1 text-xs font-semibold rounded-lg bg-primary text-white';
      drawHeightInputs(e.currentTarget.dataset.unit);
    });
  });

  // Weight unit button listeners
  document.querySelectorAll('.unit-toggle-weight').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.unit-toggle-weight').forEach(b => b.className = 'unit-toggle-weight px-3 py-1 text-xs font-semibold rounded-lg bg-surface border border-outline-variant/30');
      e.currentTarget.className = 'unit-toggle-weight px-3 py-1 text-xs font-semibold rounded-lg bg-primary text-white';
      activeWeightUnit = e.currentTarget.dataset.unit;
    });
  });

  // Submit form calculations
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const age = parseInt(document.getElementById('age').value);
    const gender = document.getElementById('gender').value;
    const weight = parseFloat(document.getElementById('weight').value);
    const activity = document.getElementById('activity').value;
    const goal = document.getElementById('goal').value;

    let h1 = 0, h2 = 0;
    if (activeHeightUnit === 'ft') {
      h1 = parseFloat(document.getElementById('height_ft').value);
      h2 = parseFloat(document.getElementById('height_in').value);
    } else {
      h1 = parseFloat(document.getElementById('height_cm').value);
    }

    // Perform calculations
    const weightKg = window.NutrifyCalculator.convertToKg(weight, activeWeightUnit);
    const heightCm = window.NutrifyCalculator.convertToCm(h1, h2, activeHeightUnit);
    
    const bmr = window.NutrifyCalculator.calculateBMR(weightKg, heightCm, age, gender);
    const tdee = window.NutrifyCalculator.calculateTDEE(bmr, activity);
    
    const targetCalories = window.NutrifyCalculator.calculateCaloricTarget(tdee, goal);
    const targetMacros = window.NutrifyCalculator.calculateMacros(targetCalories, goal);
    
    const bmi = window.NutrifyCalculator.calculateBMI(weightKg, heightCm);
    const bmiCategory = window.NutrifyCalculator.getBMICategory(bmi);

    // Save profile state
    const profile = {
      gender,
      age,
      heightUnit: activeHeightUnit,
      height1: h1,
      height2: h2,
      weightUnit: activeWeightUnit,
      weight,
      activity,
      goal,
      targets: {
        calories: Math.round(targetCalories),
        macros: targetMacros
      },
      bmi,
      bmiCategory
    };

    localStorage.setItem('nutrify_profile', JSON.stringify(profile));

    // Initialize clean daily logs if none exists
    const today = new Date().toISOString().split('T')[0];
    let logs = JSON.parse(localStorage.getItem('nutrify_logs'));
    if (!logs || logs.date !== today) {
      logs = {
        date: today,
        foods: [],
        waterCups: 0
      };
      localStorage.setItem('nutrify_logs', JSON.stringify(logs));
    }

    // Go to Dashboard
    window.location.replace('dashboard.html');
  });

  // Ripple effect loader on submit button
  document.addEventListener('click', (e) => {
    const target = e.target.closest('button');
    if (!target) return;

    const rect = target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;

    target.style.position = 'relative';
    target.style.overflow = 'hidden';
    target.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 400);
  });

})();
