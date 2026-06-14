// Profile Controller Logic

(function() {
  // Check profile existence
  const profile = JSON.parse(localStorage.getItem('nutrify_profile'));
  if (!profile) {
    window.location.replace('onboarding.html');
    return;
  }

  // Update avatar
  const avatarImg = document.getElementById('header-avatar');
  if (avatarImg) {
    avatarImg.src = profile.gender === 'female'
      ? "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200"
      : "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200";
  }

  const profileContent = document.getElementById('profile-content');
  profileContent.innerHTML = `
    <div class="max-w-3xl mx-auto space-y-6">
      <!-- Header -->
      <section class="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
        <div>
          <h2 class="text-headline-lg font-headline-lg font-bold text-on-surface">Hello, Nutify Member</h2>
          <p class="text-body-lg text-on-surface-variant">Manage your target calculations and units.</p>
        </div>
        <div class="flex gap-2">
          <span class="bg-secondary-container text-on-secondary-container px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-sm">
            <span class="material-symbols-outlined text-[16px]" style="font-variation-settings: 'FILL' 1;">workspace_premium</span>
            Pro Member
          </span>
        </div>
      </section>

      <!-- Grid info -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <!-- Objectives -->
        <div class="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/20 shadow-sm">
          <h3 class="text-title-lg font-bold mb-4 flex items-center gap-2 text-primary">
            <span class="material-symbols-outlined">flag</span>
            Health Objectives
          </h3>
          <div class="space-y-3">
            <div class="p-3 bg-surface rounded-lg">
              <p class="text-[10px] text-outline uppercase tracking-wider font-bold mb-0.5">Primary Objective</p>
              <p class="text-lg font-bold text-primary">${profile.goal === 'lose' ? 'Weight Loss (Deficit)' : profile.goal === 'gain' ? 'Build Muscle (Surplus)' : 'Weight Maintenance'}</p>
            </div>
            <div class="p-3 bg-surface rounded-lg flex justify-between items-center">
              <div>
                <p class="text-[10px] text-outline uppercase tracking-wider font-bold mb-0.5">BMI Index</p>
                <p class="text-lg font-bold text-on-surface">${profile.bmi} • ${profile.bmiCategory}</p>
              </div>
              <span class="material-symbols-outlined text-3xl text-primary/30">speed</span>
            </div>
          </div>
        </div>

        <!-- Target Calories -->
        <div class="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/20 shadow-sm flex flex-col justify-between">
          <div>
            <h3 class="text-title-lg font-bold mb-2 flex items-center gap-2 text-primary">
              <span class="material-symbols-outlined">restaurant</span>
              Daily Targets
            </h3>
            <div class="flex items-baseline gap-1.5 mb-4">
              <span class="text-3xl font-extrabold text-primary">${profile.targets.calories.toLocaleString()}</span>
              <span class="text-xs text-on-surface-variant font-medium">kcal/day</span>
            </div>
          </div>

          <div class="p-3 bg-surface rounded-lg space-y-2">
            <div class="flex justify-between text-xs font-bold text-on-surface-variant">
              <span>P: ${profile.targets.macros.protein}g</span>
              <span>C: ${profile.targets.macros.carbs}g</span>
              <span>F: ${profile.targets.macros.fat}g</span>
            </div>
            <div class="flex h-2 rounded-full overflow-hidden">
              <div class="bg-primary" style="width: 30%"></div>
              <div class="bg-[forestgreen]" style="width: 50%"></div>
              <div class="bg-tertiary-container" style="width: 20%"></div>
            </div>
          </div>
        </div>

      </div>

      <!-- Settings Option Lists -->
      <section class="space-y-4">
        <h3 class="text-title-lg font-bold">Settings & Configuration</h3>
        
        <div class="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/20 divide-y divide-outline-variant/10 overflow-hidden">
          <a href="onboarding.html" class="w-full flex items-center justify-between p-4 hover:bg-surface-variant/10 transition-colors group">
            <div class="flex items-center gap-4">
              <span class="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">settings_accessibility</span>
              <div class="text-left">
                <p class="text-body-md font-bold">Recalculate Goal Targets</p>
                <p class="text-xs text-on-surface-variant">Update age, weight, height, or goals</p>
              </div>
            </div>
            <span class="material-symbols-outlined text-outline">chevron_right</span>
          </a>

          <button class="w-full flex items-center justify-between p-4 hover:bg-surface-variant/10 transition-colors group">
            <div class="flex items-center gap-4">
              <span class="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">notifications_active</span>
              <div class="text-left">
                <p class="text-body-md font-bold">Notification Preferences</p>
                <p class="text-xs text-on-surface-variant">Manage reminders and alerts</p>
              </div>
            </div>
            <span class="material-symbols-outlined text-outline">chevron_right</span>
          </button>

          <button class="w-full flex items-center justify-between p-4 hover:bg-surface-variant/10 transition-colors group">
            <div class="flex items-center gap-4">
              <span class="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">verified_user</span>
              <div class="text-left">
                <p class="text-body-md font-bold">Biometric & Password lock</p>
                <p class="text-xs text-on-surface-variant">Secure your health parameters</p>
              </div>
            </div>
            <span class="material-symbols-outlined text-outline">chevron_right</span>
          </button>
        </div>

        <button id="log-out-btn" class="w-full py-4 text-error font-bold border border-error/20 rounded-xl hover:bg-error/5 transition-colors">
          Reset Profile Data
        </button>
      </section>
    </div>
  `;

  // Wire clear storage reset
  document.getElementById('log-out-btn').addEventListener('click', () => {
    if (confirm('Are you sure you want to reset all profile and local logged data? This action is permanent.')) {
      localStorage.clear();
      window.location.replace('index.html');
    }
  });

  // Notification button action
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
