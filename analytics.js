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
    logs = {
      date: today,
      foods: [],
      waterCups: 0
    };
  }

  // Load history state
  let history = JSON.parse(localStorage.getItem('nutrify_history')) || {};

  // Populate mock data if history is empty
  if (Object.keys(history).length === 0) {
    const todayObj = new Date();
    const baseCal = profile.targets.calories;
    for (let i = 7; i > 0; i--) {
      const d = new Date(todayObj);
      d.setDate(todayObj.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      const randCal = Math.round(baseCal - 400 + Math.random() * 600);
      const randWater = Math.round(2 + Math.random() * 6);
      
      history[dateStr] = {
        calories: randCal,
        waterCups: randWater
      };
    }
    localStorage.setItem('nutrify_history', JSON.stringify(history));
  }

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
    </div>
  `;

  // Notification button action
  document.getElementById('noti-btn').addEventListener('click', () => {
    alert("Nutify Guide Alert: Iron deficiency logged this week! Added spinach suggestions to your AI Guide recommendations.");
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
