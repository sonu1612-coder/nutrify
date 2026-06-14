// Dashboard Controller Logic

(function() {
  // Check profile existence
  const profile = JSON.parse(localStorage.getItem('nutrify_profile'));
  if (!profile) {
    window.location.replace('onboarding.html');
    return;
  }

  // Load today's log
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

  // Update avatar
  const avatarImg = document.getElementById('header-avatar');
  if (avatarImg) {
    avatarImg.src = profile.gender === 'female'
      ? "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200"
      : "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200";
  }

  // Caloric values
  const targetCals = profile.targets.calories;
  const consumedCals = Math.round(logs.foods.reduce((acc, f) => acc + f.calories, 0));
  const remainingCals = Math.max(targetCals - consumedCals, 0);
  const progressPct = Math.min((consumedCals / targetCals) * 100, 100);
  const dashoffset = 283 - (283 * progressPct) / 100;

  // Macros values
  const consumedMacros = logs.foods.reduce((acc, f) => {
    acc.protein += f.protein;
    acc.carbs += f.carbs;
    acc.fat += f.fat;
    return acc;
  }, { protein: 0, carbs: 0, fat: 0 });

  const pPct = Math.min((consumedMacros.protein / profile.targets.macros.protein) * 100, 100);
  const cPct = Math.min((consumedMacros.carbs / profile.targets.macros.carbs) * 100, 100);
  const fPct = Math.min((consumedMacros.fat / profile.targets.macros.fat) * 100, 100);

  // Last food logged today
  const lastFood = logs.foods[logs.foods.length - 1];

  const dashboardContent = document.getElementById('dashboard-content');
  dashboardContent.innerHTML = `
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
      <!-- Dashboard Left Column -->
      <div class="lg:col-span-8 space-y-gutter">
        
        <!-- Main Circular Progress Card -->
        <section class="glass-card hover:glow-emerald transition-all rounded-xl p-6 shadow-sm border border-outline-variant/20 relative overflow-hidden custom-shadow">
          <div class="flex flex-col md:flex-row items-center gap-8">
            <!-- Progress Circle -->
            <div class="relative w-44 h-44 md:w-52 md:h-52 flex-shrink-0">
              <svg class="w-full h-full transform -rotate-90">
                <circle class="text-surface-container" cx="50%" cy="50%" fill="transparent" r="41%" stroke="currentColor" stroke-width="12"></circle>
                <circle class="text-primary transition-all duration-1000 ease-out" cx="50%" cy="50%" fill="transparent" r="41%" stroke="currentColor" stroke-dasharray="283" stroke-dashoffset="${dashoffset}" stroke-linecap="round" stroke-width="12"></circle>
              </svg>
              <div class="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span class="text-4xl font-extrabold tracking-tight">${remainingCals.toLocaleString()}</span>
                <span class="text-label-sm text-on-surface-variant uppercase tracking-wider">kcal left</span>
              </div>
            </div>

            <!-- Macro Details -->
            <div class="flex-1 w-full space-y-4">
              <div>
                <h3 class="text-headline-md font-display font-bold text-on-surface">Daily Overview</h3>
                <p class="text-body-md text-on-surface-variant">You have consumed ${Math.round(progressPct)}% of your target daily caloric intake.</p>
              </div>
              
              <div class="grid grid-cols-1 gap-3 pt-2">
                <!-- Protein -->
                <div class="space-y-1">
                  <div class="flex justify-between items-end text-xs">
                    <span class="font-bold text-on-surface">Protein</span>
                    <span class="text-on-surface-variant font-medium">${Math.round(consumedMacros.protein)}g / ${profile.targets.macros.protein}g</span>
                  </div>
                  <div class="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                    <div class="h-full bg-primary macro-progress" style="width: ${pPct}%"></div>
                  </div>
                </div>
                <!-- Carbs -->
                <div class="space-y-1">
                  <div class="flex justify-between items-end text-xs">
                    <span class="font-bold text-on-surface">Carbohydrates</span>
                    <span class="text-on-surface-variant font-medium">${Math.round(consumedMacros.carbs)}g / ${profile.targets.macros.carbs}g</span>
                  </div>
                  <div class="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                    <div class="h-full bg-[forestgreen] macro-progress" style="width: ${cPct}%"></div>
                  </div>
                </div>
                <!-- Fats -->
                <div class="space-y-1">
                  <div class="flex justify-between items-end text-xs">
                    <span class="font-bold text-on-surface">Fats</span>
                    <span class="text-on-surface-variant font-medium">${Math.round(consumedMacros.fat)}g / ${profile.targets.macros.fat}g</span>
                  </div>
                  <div class="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                    <div class="h-full bg-tertiary-container macro-progress" style="width: ${fPct}%"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Recent Log -->
        <section class="glass-card hover:glow-emerald transition-all rounded-xl p-6 shadow-sm border border-outline-variant/20 custom-shadow">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-title-lg font-display font-semibold">Recent Entry</h3>
            <a href="meal-log.html" class="text-primary text-label-md font-bold hover:underline transition-all">Meal Logs</a>
          </div>
          
          ${lastFood ? `
            <div class="flex items-center gap-4 p-4 bg-surface rounded-xl border border-outline-variant/15">
              <div class="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                <span class="material-symbols-outlined text-2xl">restaurant</span>
              </div>
              <div class="flex-grow min-w-0">
                <p class="text-body-md font-bold text-on-surface truncate">${lastFood.name}</p>
                <p class="text-label-sm text-on-surface-variant">${lastFood.amount}g • ${lastFood.mealType.charAt(0).toUpperCase() + lastFood.mealType.slice(1)}</p>
              </div>
              <div class="text-right flex-shrink-0">
                <p class="text-xl font-bold text-primary">${Math.round(lastFood.calories)}</p>
                <p class="text-[10px] text-on-surface-variant uppercase font-semibold">kcal</p>
              </div>
            </div>
          ` : `
            <div class="py-8 text-center bg-surface border border-dashed border-outline-variant/30 rounded-xl">
              <p class="text-body-md text-on-surface-variant">No foods logged today. Start logging!</p>
            </div>
          `}
        </section>
      </div>

      <!-- Dashboard Right Column -->
      <div class="lg:col-span-4 space-y-gutter">
        
        <!-- Quick Add Button -->
        <a href="meal-log.html?action=search" class="w-full py-5 px-6 bg-primary text-on-primary rounded-xl flex items-center justify-center gap-3 shadow-md hover:bg-on-primary-container active:scale-95 transition-all duration-150">
          <span class="material-symbols-outlined text-2xl">add_circle</span>
          <span class="text-title-lg font-display font-semibold">Quick Add Meal</span>
        </a>

        <!-- Hydration Tracker -->
        <div class="bg-surface-container-low rounded-xl p-5 border border-outline-variant/30 shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-blue-500">water_drop</span>
              <span class="text-label-md font-bold text-on-surface">Hydration</span>
            </div>
            <span class="text-label-sm font-bold text-blue-600" id="water-fraction">${logs.waterCups * 0.25}L / 2.0L</span>
          </div>
          
          <div class="flex justify-between gap-1.5" id="water-cups-row">
            <!-- cups dynamic -->
          </div>
          <p class="text-[10px] text-on-surface-variant italic mt-3 text-center">Tap a drop to record water intake</p>
        </div>

        <!-- Daily Tip -->
        <div class="bg-tertiary-fixed rounded-xl p-5 border border-tertiary-fixed-dim/50 relative overflow-hidden shadow-sm">
          <div class="relative z-10 space-y-2">
            <h4 class="text-label-md font-bold text-on-tertiary-fixed flex items-center gap-2">
              <span class="material-symbols-outlined text-[18px]">lightbulb</span>
              Daily Nutify Tip
            </h4>
            <p class="text-body-md text-on-tertiary-fixed-variant leading-snug">
              Pairing complex carbs (like oats or brown rice) with fiber-rich greens stabilizes insulin and sustains energy levels throughout the afternoon.
            </p>
          </div>
          <div class="absolute -right-4 -bottom-4 w-20 h-20 bg-tertiary-container opacity-20 rounded-full blur-2xl"></div>
        </div>
      </div>
    </div>
  `;

  // Draw water cups
  const cupsRow = document.getElementById('water-cups-row');
  const fractionEl = document.getElementById('water-fraction');

  function renderWaterCups() {
    cupsRow.innerHTML = '';
    for (let i = 1; i <= 8; i++) {
      const active = i <= logs.waterCups;
      const btn = document.createElement('button');
      btn.className = `flex-grow h-10 rounded-lg flex items-center justify-center transition-all ${
        active 
          ? 'bg-blue-500 text-white shadow-sm active:scale-90' 
          : 'bg-white border border-outline-variant/30 text-blue-300 hover:bg-blue-50 active:scale-90'
      }`;
      btn.innerHTML = `<span class="material-symbols-outlined text-[20px]" style="font-variation-settings: 'FILL' ${active ? '1' : '0'}">water_drop</span>`;
      
      btn.addEventListener('click', () => {
        logs.waterCups = i === logs.waterCups ? i - 1 : i;
        localStorage.setItem('nutrify_logs', JSON.stringify(logs));
        fractionEl.textContent = `${(logs.waterCups * 0.25).toFixed(2)}L / 2.0L`;
        renderWaterCups();
      });
      cupsRow.appendChild(btn);
    }
  }

  renderWaterCups();

  // Notification click listener
  document.getElementById('noti-btn').addEventListener('click', () => {
    alert("Nutify Guide Alert: Iron deficiency logged this week! Added spinach suggestions to your AI Guide recommendations.");
  });

  // Ripple effect binding
  document.addEventListener('click', (e) => {
    const target = e.target.closest('button, a');
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
