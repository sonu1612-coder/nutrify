// Analytics Controller Logic

(function() {
  // Check profile existence
  const profile = JSON.parse(localStorage.getItem('nutrify_profile'));
  if (!profile) {
    window.location.replace('onboarding.html');
    return;
  }

  // Load state logs
  const today = new Date().toISOString().split('T')[0];
  let logs = JSON.parse(localStorage.getItem('nutrify_logs'));
  if (!logs || logs.date !== today) {
    if (logs && logs.date) {
      // Archive previous day
      let history = JSON.parse(localStorage.getItem('nutrify_history')) || {};
      const cals = Math.round(logs.foods.reduce((acc, f) => acc + f.calories, 0));
      const iron = Math.round(logs.foods.reduce((acc, f) => acc + (f.iron || 0), 0));
      const vitC = Math.round(logs.foods.reduce((acc, f) => acc + (f.vitaminC || 0), 0));
      const calcium = Math.round(logs.foods.reduce((acc, f) => acc + (f.calcium || 0), 0));
      history[logs.date] = { 
        calories: cals, 
        waterCups: logs.waterCups || 0,
        iron, vitC, calcium
      };
      localStorage.setItem('nutrify_history', JSON.stringify(history));
    }
    logs = {
      date: today,
      foods: [],
      waterCups: 0
    };
    localStorage.setItem('nutrify_logs', JSON.stringify(logs));
  }

  // Load history state
  let history = JSON.parse(localStorage.getItem('nutrify_history')) || {};

  // No mock data - only use real history

  // Update avatar
  const avatarImg = document.getElementById('header-avatar');
  if (avatarImg) {
    avatarImg.src = profile.gender === 'female'
      ? "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200"
      : "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200";
  }

  // Prepare last 7 days chart data
  const dates = Object.keys(history).sort();
  const last7Dates = dates.slice(-7);
  
  const displayData = last7Dates.map(d => {
    const split = d.split('-');
    return {
      label: `${split[1]}/${split[2]}`, // MM/DD
      val: history[d].calories,
      water: history[d].waterCups || 0
    };
  });

  // Append today's log to data
  const todayCals = Math.round(logs.foods.reduce((acc, f) => acc + f.calories, 0));
  displayData.push({
    label: 'Today',
    val: todayCals,
    water: logs.waterCups
  });

  const chartDays = displayData.slice(-7);
  const maxVal = Math.max(...chartDays.map(d => d.val), profile.targets.calories, 2000);

  // Analyze last 7 days for deficiencies
  let totalIron = 0, totalVitC = 0, totalCalcium = 0;
  let daysCount = last7Dates.length;
  if (daysCount > 0) {
    last7Dates.forEach(d => {
      totalIron += history[d].iron || 0;
      totalVitC += history[d].vitC || 0;
      totalCalcium += history[d].calcium || 0;
    });
  }
  // Add today's
  totalIron += logs.foods.reduce((a, f) => a + (f.iron || 0), 0);
  totalVitC += logs.foods.reduce((a, f) => a + (f.vitaminC || 0), 0);
  totalCalcium += logs.foods.reduce((a, f) => a + (f.calcium || 0), 0);
  daysCount += 1; // Include today
  
  const avgIron = totalIron / daysCount;
  const avgVitC = totalVitC / daysCount;
  const avgCalcium = totalCalcium / daysCount;
  
  let deficiencyHtml = '';
  const deficiencies = [];
  
  if (avgIron < 10) deficiencies.push({ icon: 'bloodtype', title: 'Iron Deficiency', desc: `Averaging ${avgIron.toFixed(1)}mg/day (Target: ~18mg). Consider adding spinach, lentils, or red meat.` });
  if (avgVitC < 50) deficiencies.push({ icon: 'nutrition', title: 'Vitamin C Deficiency', desc: `Averaging ${avgVitC.toFixed(1)}mg/day (Target: ~90mg). Eat more citrus, kiwi, or take a supplement.` });
  if (avgCalcium < 600) deficiencies.push({ icon: 'bone', title: 'Calcium Deficiency', desc: `Averaging ${avgCalcium.toFixed(1)}mg/day (Target: ~1000mg). Consider dairy, fortified milks, or a supplement.` });
  
  if (deficiencies.length > 0) {
    deficiencyHtml = `
      <section class="bg-error-container/20 rounded-xl p-6 shadow-sm border border-error/30 mt-6 custom-shadow">
        <h3 class="text-title-lg font-bold text-error mb-4 flex items-center gap-2"><span class="material-symbols-outlined">warning</span> Nutrient Deficiencies Detected</h3>
        <p class="text-xs text-on-surface-variant font-medium mb-4">Based on your past ${daysCount} days of logs, we've identified some missing micronutrients:</p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          ${deficiencies.map(d => `
            <div class="bg-surface rounded-xl p-4 border border-outline-variant/30 flex gap-3 shadow-sm">
              <div class="bg-error/10 p-2 rounded-lg text-error h-fit flex items-center justify-center"><span class="material-symbols-outlined">${d.icon}</span></div>
              <div>
                <h4 class="text-sm font-bold text-on-surface">${d.title}</h4>
                <p class="text-[10px] text-on-surface-variant mt-1 leading-relaxed">${d.desc}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </section>
    `;
  } else {
    deficiencyHtml = `
      <section class="bg-primary-container/20 rounded-xl p-6 shadow-sm border border-primary/30 mt-6 custom-shadow flex flex-col items-center justify-center text-center">
        <span class="material-symbols-outlined text-4xl text-primary mb-2">verified</span>
        <h3 class="text-title-md font-bold text-primary mb-1">Nutrition On Track</h3>
        <p class="text-xs text-on-surface-variant">Your weekly average for essential vitamins and minerals looks great!</p>
      </section>
    `;
  }

  const analyticsContent = document.getElementById('analytics-content');
  analyticsContent.innerHTML = `
    <div class="space-y-6">
      <div>
        <h2 class="text-headline-lg-mobile md:text-headline-lg font-headline-lg font-bold text-on-surface">Nutritional Analytics</h2>
        <p class="text-body-md text-on-surface-variant font-medium">Calorie & hydration consistency over the past week.</p>
      </div>

      <!-- Calorie Intake History Card -->
      <section class="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant/20 custom-shadow">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-title-lg font-bold">Daily Caloric Intake</h3>
          <span class="text-xs text-on-surface-variant font-semibold">Target: <b class="text-primary">${profile.targets.calories} kcal</b></span>
        </div>

        <div class="relative h-60 w-full flex items-end justify-between gap-3 pt-6 border-b border-outline-variant/20 px-2">
          <!-- Target goal line overlay -->
          <div class="absolute left-0 w-full border-t-2 border-dashed border-primary/40 pointer-events-none" 
            style="bottom: ${(profile.targets.calories / maxVal) * 100}%">
            <span class="absolute right-0 -mt-5 text-[10px] text-primary font-bold bg-white px-1.5 rounded-full border border-primary/20">Target Goal</span>
          </div>

          ${chartDays.map(d => {
            const heightPct = Math.min((d.val / maxVal) * 100, 100);
            const isOverTarget = d.val > profile.targets.calories;
            const barColorClass = isOverTarget ? 'bg-amber-500' : 'bg-primary';
            
            return `
              <div class="flex-grow flex flex-col items-center gap-2 h-full justify-end group relative">
                <!-- Tooltip -->
                <div class="absolute bottom-full mb-1 bg-slate-900 text-white text-xs font-semibold px-2 py-1 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  ${d.val.toLocaleString()} kcal
                </div>
                <!-- Bar representation -->
                <div class="${barColorClass} w-8 md:w-10 rounded-t-lg transition-all duration-700 ease-out" 
                  style="height: ${heightPct === 0 ? '4px' : heightPct + '%'}"></div>
                <span class="text-[10px] text-on-surface-variant font-bold">${d.label}</span>
              </div>
            `;
          }).join('')}
        </div>
      </section>

      <!-- Hydration history card -->
      <section class="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant/20 custom-shadow">
        <h3 class="text-title-lg font-bold mb-6">Water Intake History</h3>
        <div class="relative h-40 w-full flex items-end justify-between gap-3 pt-4 border-b border-outline-variant/20 px-2">
          
          <!-- Goal Line (8 cups = 2.0L) -->
          <div class="absolute left-0 w-full border-t-2 border-dashed border-blue-500/40 pointer-events-none" style="bottom: 100%">
            <span class="absolute right-0 -mt-5 text-[10px] text-blue-500 font-bold bg-white px-1.5 rounded-full border border-blue-500/20">Target 2.0L</span>
          </div>

          ${chartDays.map(d => {
            const heightPct = Math.min((d.water / 8) * 100, 100);
            
            return `
              <div class="flex-grow flex flex-col items-center gap-2 h-full justify-end group relative">
                <!-- Tooltip -->
                <div class="absolute bottom-full mb-1 bg-slate-900 text-white text-xs font-semibold px-2 py-1 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  ${(d.water * 0.25).toFixed(2)}L
                </div>
                <!-- Bar -->
                <div class="bg-blue-500 w-8 md:w-10 rounded-t-lg transition-all duration-700 ease-out" 
                  style="height: ${heightPct === 0 ? '4px' : heightPct + '%'}"></div>
                <span class="text-[10px] text-on-surface-variant font-bold">${d.label}</span>
              </div>
            `;
          }).join('')}
        </div>
      </section>

      <!-- BMI status box -->
      <section class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-surface-container-low border border-outline-variant/20 rounded-xl p-5 shadow-sm">
          <h4 class="text-label-md font-bold text-on-surface uppercase tracking-wider mb-2">BMI Indicator</h4>
          <div class="flex items-baseline gap-2">
            <span class="text-3xl font-extrabold text-primary">${profile.bmi || 'N/A'}</span>
            <span class="text-sm text-on-surface-variant font-semibold">${profile.bmiCategory || 'N/A'}</span>
          </div>
          
          <div class="h-2.5 w-full bg-slate-200 rounded-full mt-4 relative overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-r from-blue-400 via-[forestgreen] to-red-400"></div>
            ${profile.bmi ? `
              <div class="absolute top-0 w-1 h-full bg-white shadow" style="left: ${Math.min(Math.max(((profile.bmi - 15) / 20) * 100, 0), 100)}%"></div>
            ` : ''}
          </div>
          <div class="flex justify-between text-[9px] text-on-surface-variant font-bold mt-2">
            <span>Underweight</span>
            <span>Normal (18.5 - 24.9)</span>
            <span>Overweight</span>
            <span>Obese</span>
          </div>
        </div>
      </section>
      
      ${deficiencyHtml}
    </div>
  `;

  // Notification button action
  document.getElementById('noti-btn').addEventListener('click', () => {
    alert("Nutrify Guide Alert: Iron deficiency logged this week! Added spinach suggestions to your AI Guide recommendations.");
  });

  // Ripple effect
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
