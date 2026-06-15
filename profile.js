// Advanced Profile Controller Logic with AI Avatars & Supabase Sync

(async function() {
  const profileContent = document.getElementById('profile-content');
  if (!profileContent) return;

  // 1. Local State Management
  let localProfile = JSON.parse(localStorage.getItem('nutrify_profile'));
  if (!localProfile) {
    window.location.replace('onboarding.html');
    return;
  }

  let dbProfile = JSON.parse(localStorage.getItem('nutrify_db_profile') || '{}');
  let currentTab = 'health'; // health, personal, avatar, settings
  let userAuth = null;

  // Supabase Auth Check
  if (window.supabaseClient) {
    const { data: { session } } = await window.supabaseClient.auth.getSession();
    if (session) {
      userAuth = session.user;
      await fetchDbProfile();
    }
  }

  async function fetchDbProfile() {
    if (!userAuth) return;
    try {
      const { data, error } = await window.supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', userAuth.id)
        .single();
      
      if (data && !error) {
        dbProfile = data;
        localStorage.setItem('nutrify_db_profile', JSON.stringify(dbProfile));
        updateHeaderAvatar();
      }
    } catch(e) {
      console.warn("DB Profile not found or table not created yet.");
    }
  }

  function updateHeaderAvatar() {
    const avatarImg = document.getElementById('header-avatar');
    if (avatarImg) {
      if (dbProfile.avatar_url) {
        avatarImg.src = dbProfile.avatar_url;
      } else {
        avatarImg.src = localProfile.gender === 'female'
          ? "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200"
          : "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200";
      }
    }
  }
  updateHeaderAvatar();

  // 2. Main Render Function
  function render() {
    // Calculate Profile Completion %
    const fields = ['full_name', 'username', 'bio', 'phone', 'country', 'city', 'profession', 'avatar_url'];
    let filled = fields.filter(f => dbProfile[f]).length;
    let completionPct = Math.round((filled / fields.length) * 100) || 0;

    profileContent.innerHTML = `
      <div class="max-w-4xl mx-auto space-y-6 pb-20">
        
        <!-- Profile Header Core -->
        <div class="bg-surface-container-lowest rounded-3xl p-6 border border-outline-variant/20 shadow-sm relative overflow-hidden">
          <div class="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-primary/20 to-secondary/20"></div>
          
          <div class="relative z-10 flex flex-col md:flex-row items-center md:items-end gap-6 pt-16">
            <div class="relative group cursor-pointer" onclick="window.switchTab('avatar')">
              <img src="${dbProfile.avatar_url || (localProfile.gender === 'female' ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200' : 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200')}" 
                   class="w-32 h-32 rounded-full object-cover border-4 border-surface shadow-xl bg-surface-variant">
              <div class="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span class="material-symbols-outlined text-white text-3xl">photo_camera</span>
              </div>
            </div>
            
            <div class="flex-grow text-center md:text-left">
              <h2 class="text-headline-md font-bold text-on-surface">${dbProfile.full_name || 'Nutrify Member'}</h2>
              <p class="text-primary font-medium">@${dbProfile.username || 'user_' + Math.floor(Math.random()*1000)}</p>
              <p class="text-body-md text-on-surface-variant mt-2 max-w-lg line-clamp-2">${dbProfile.bio || 'Add a bio to tell the community about your health journey!'}</p>
            </div>
            
            <div class="flex flex-col items-center gap-2">
              <div class="w-24 h-24 relative flex items-center justify-center">
                <svg class="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path class="text-surface-variant" stroke-width="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path class="text-primary transition-all duration-1000" stroke-dasharray="${completionPct}, 100" stroke-width="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <div class="absolute text-center">
                  <span class="text-lg font-bold text-on-surface">${completionPct}%</span>
                </div>
              </div>
              <span class="text-xs text-outline font-bold uppercase tracking-wider">Profile</span>
            </div>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <div class="flex overflow-x-auto gap-2 border-b border-outline-variant/20 pb-2 scroll-hide">
          <button onclick="window.switchTab('health')" class="px-5 py-2.5 rounded-full font-bold whitespace-nowrap transition-all ${currentTab === 'health' ? 'bg-primary text-black' : 'bg-surface-container text-on-surface-variant hover:bg-surface-variant'}">Health Objectives</button>
          <button onclick="window.switchTab('personal')" class="px-5 py-2.5 rounded-full font-bold whitespace-nowrap transition-all ${currentTab === 'personal' ? 'bg-primary text-black' : 'bg-surface-container text-on-surface-variant hover:bg-surface-variant'}">Personal Info</button>
          <button onclick="window.switchTab('avatar')" class="px-5 py-2.5 rounded-full font-bold whitespace-nowrap transition-all ${currentTab === 'avatar' ? 'bg-primary text-black' : 'bg-surface-container text-on-surface-variant hover:bg-surface-variant'}">AI Avatars & Photo</button>
          <button onclick="window.switchTab('settings')" class="px-5 py-2.5 rounded-full font-bold whitespace-nowrap transition-all ${currentTab === 'settings' ? 'bg-primary text-black' : 'bg-surface-container text-on-surface-variant hover:bg-surface-variant'}">Settings & Privacy</button>
        </div>

        <!-- Tab Content -->
        <div id="tab-content" class="fade-in">
          ${getTabContent(currentTab)}
        </div>
        
      </div>
    `;

    bindTabEvents(currentTab);
  }

  // Expose switchTab to window
  window.switchTab = function(tab) {
    currentTab = tab;
    render();
  };

  function getTabContent(tab) {
    if (tab === 'health') {
      return `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/20 shadow-sm">
            <h3 class="text-title-lg font-bold mb-4 flex items-center gap-2 text-primary">
              <span class="material-symbols-outlined">flag</span> Primary Goal
            </h3>
            <div class="p-4 bg-surface rounded-xl">
              <p class="text-xl font-bold text-primary">${localProfile.goal === 'lose' ? 'Weight Loss (Deficit)' : localProfile.goal === 'gain' ? 'Build Muscle (Surplus)' : 'Weight Maintenance'}</p>
              <p class="text-sm text-outline mt-1">BMI Index: <span class="font-bold text-on-surface">${localProfile.bmi}</span> • ${localProfile.bmiCategory}</p>
            </div>
          </div>
          <div class="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/20 shadow-sm">
            <h3 class="text-title-lg font-bold mb-4 flex items-center gap-2 text-primary">
              <span class="material-symbols-outlined">restaurant</span> Daily Targets
            </h3>
            <div class="flex items-baseline gap-1.5 mb-4">
              <span class="text-4xl font-extrabold text-primary">${localProfile.targets.calories.toLocaleString()}</span>
              <span class="text-sm text-on-surface-variant font-medium">kcal/day</span>
            </div>
            <div class="p-3 bg-surface rounded-lg space-y-2">
              <div class="flex justify-between text-xs font-bold text-on-surface-variant">
                <span>Protein: ${localProfile.targets.macros.protein}g</span>
                <span>Carbs: ${localProfile.targets.macros.carbs}g</span>
                <span>Fat: ${localProfile.targets.macros.fat}g</span>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    if (tab === 'personal') {
      const interestsArr = dbProfile.interests || [];
      const allInterests = ['AI', 'Technology', 'Business', 'Finance', 'Gaming', 'Fitness', 'Education', 'Sports', 'Travel', 'Photography'];
      
      return `
        <div class="bg-surface-container-lowest rounded-3xl p-6 md:p-8 border border-outline-variant/20 shadow-sm">
          <h3 class="text-title-lg font-bold mb-6 flex items-center gap-2 text-on-surface">
            <span class="material-symbols-outlined text-primary">badge</span> Edit Personal Information
          </h3>
          <form id="personal-form" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-xs font-bold text-outline uppercase tracking-wider mb-2">Full Name</label>
                <input type="text" id="p_fullname" value="${dbProfile.full_name || ''}" class="w-full bg-surface border border-outline-variant/30 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary text-on-surface outline-none" placeholder="John Doe">
              </div>
              <div>
                <label class="block text-xs font-bold text-outline uppercase tracking-wider mb-2">Username</label>
                <input type="text" id="p_username" value="${dbProfile.username || ''}" class="w-full bg-surface border border-outline-variant/30 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary text-on-surface outline-none" placeholder="johndoe123">
              </div>
              <div>
                <label class="block text-xs font-bold text-outline uppercase tracking-wider mb-2">Email Address</label>
                <input type="email" id="p_email" value="${userAuth ? userAuth.email : ''}" disabled class="w-full bg-surface-variant/50 border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface-variant outline-none cursor-not-allowed">
              </div>
              <div>
                <label class="block text-xs font-bold text-outline uppercase tracking-wider mb-2">Phone Number</label>
                <input type="tel" id="p_phone" value="${dbProfile.phone || ''}" class="w-full bg-surface border border-outline-variant/30 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary text-on-surface outline-none" placeholder="+1 234 567 8900">
              </div>
              <div>
                <label class="block text-xs font-bold text-outline uppercase tracking-wider mb-2">Date of Birth</label>
                <input type="date" id="p_dob" value="${dbProfile.date_of_birth || ''}" class="w-full bg-surface border border-outline-variant/30 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary text-on-surface outline-none">
              </div>
              <div>
                <label class="block text-xs font-bold text-outline uppercase tracking-wider mb-2">Profession</label>
                <input type="text" id="p_profession" value="${dbProfile.profession || ''}" class="w-full bg-surface border border-outline-variant/30 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary text-on-surface outline-none" placeholder="Software Engineer">
              </div>
              <div>
                <label class="block text-xs font-bold text-outline uppercase tracking-wider mb-2">Country</label>
                <input type="text" id="p_country" value="${dbProfile.country || ''}" class="w-full bg-surface border border-outline-variant/30 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary text-on-surface outline-none" placeholder="United States">
              </div>
              <div>
                <label class="block text-xs font-bold text-outline uppercase tracking-wider mb-2">City</label>
                <input type="text" id="p_city" value="${dbProfile.city || ''}" class="w-full bg-surface border border-outline-variant/30 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary text-on-surface outline-none" placeholder="New York">
              </div>
              <div class="md:col-span-2">
                <label class="block text-xs font-bold text-outline uppercase tracking-wider mb-2">Website</label>
                <input type="url" id="p_website" value="${dbProfile.website || ''}" class="w-full bg-surface border border-outline-variant/30 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary text-on-surface outline-none" placeholder="https://yourwebsite.com">
              </div>
              <div class="md:col-span-2">
                <label class="block text-xs font-bold text-outline uppercase tracking-wider mb-2">About Me (Bio)</label>
                <textarea id="p_bio" rows="4" class="w-full bg-surface border border-outline-variant/30 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary text-on-surface outline-none resize-none" placeholder="Tell us about your fitness journey...">${dbProfile.bio || ''}</textarea>
              </div>
            </div>

            <!-- Interests -->
            <div class="mt-8 border-t border-outline-variant/20 pt-6">
              <label class="block text-xs font-bold text-outline uppercase tracking-wider mb-4">Select Your Interests</label>
              <div class="flex flex-wrap gap-3">
                ${allInterests.map(i => `
                  <label class="cursor-pointer">
                    <input type="checkbox" class="peer hidden" value="${i}" ${interestsArr.includes(i) ? 'checked' : ''}>
                    <div class="px-4 py-2 rounded-full border border-outline-variant/30 text-sm font-semibold peer-checked:bg-primary peer-checked:text-black peer-checked:border-primary transition-all">
                      ${i}
                    </div>
                  </label>
                `).join('')}
              </div>
            </div>

            <div class="flex justify-end pt-6 border-t border-outline-variant/20 mt-6">
              <button type="submit" id="save-personal-btn" class="bg-primary text-black px-8 py-3 rounded-xl font-bold hover:scale-105 transition-transform flex items-center gap-2">
                <span class="material-symbols-outlined">save</span> Save Profile
              </button>
            </div>
          </form>
        </div>
      `;
    }

    if (tab === 'avatar') {
      const aiStyles = ['bottts', 'avataaars', 'micah', 'lorelei', 'adventurer', 'fun-emoji'];
      const currentSeed = dbProfile.username || 'nutrify';
      
      return `
        <div class="space-y-6">
          
          <!-- Manual Upload Section -->
          <div class="bg-surface-container-lowest rounded-3xl p-6 md:p-8 border border-outline-variant/20 shadow-sm flex flex-col md:flex-row items-center gap-6">
            <div class="flex-grow text-center md:text-left">
              <h3 class="text-title-lg font-bold flex items-center justify-center md:justify-start gap-2 text-on-surface mb-2">
                <span class="material-symbols-outlined text-primary">cloud_upload</span> Upload Custom Photo
              </h3>
              <p class="text-body-md text-on-surface-variant">Upload an image directly from your device gallery or camera. Max size 2MB.</p>
            </div>
            <div class="flex-shrink-0 relative">
              <input type="file" id="photo-upload-input" accept="image/*" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10">
              <button class="bg-surface-variant border border-outline-variant/30 text-on-surface px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-surface-container transition-colors">
                <span class="material-symbols-outlined">photo_library</span> Select Image
              </button>
            </div>
          </div>

          <div class="flex items-center gap-4 my-4">
            <div class="flex-grow h-px bg-outline-variant/20"></div>
            <span class="text-xs text-outline font-bold uppercase tracking-wider">OR USE AI GENERATION</span>
            <div class="flex-grow h-px bg-outline-variant/20"></div>
          </div>

          <!-- AI Avatar Generator Section -->
          <div class="bg-surface-container-lowest rounded-3xl p-6 md:p-8 border border-outline-variant/20 shadow-sm">
            <h3 class="text-title-lg font-bold flex items-center gap-2 text-on-surface mb-6">
              <span class="material-symbols-outlined text-primary">smart_toy</span> Generate AI Avatar
            </h3>
            
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              ${aiStyles.map(style => `
                <div class="ai-style-card cursor-pointer group flex flex-col items-center gap-2" data-style="${style}">
                  <div class="w-full aspect-square rounded-2xl bg-surface-variant border-2 border-transparent group-hover:border-primary transition-all overflow-hidden p-2 flex items-center justify-center">
                    <img src="https://api.dicebear.com/7.x/${style}/svg?seed=${currentSeed}" class="w-full h-full object-contain drop-shadow-md">
                  </div>
                  <span class="text-xs font-bold uppercase tracking-wider text-outline group-hover:text-primary transition-colors">${style}</span>
                </div>
              `).join('')}
            </div>

            <div class="bg-surface rounded-2xl p-6 border border-outline-variant/10 text-center">
              <h4 class="font-bold text-lg mb-2">Avatar Customizer</h4>
              <p class="text-sm text-on-surface-variant mb-4">Enter a prompt seed to generate a unique variation of the selected style.</p>
              <div class="flex max-w-md mx-auto gap-2">
                <input type="text" id="avatar-seed" value="${currentSeed}" class="flex-grow bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-2 outline-none focus:border-primary" placeholder="Type anything...">
                <button id="generate-avatar-btn" class="bg-primary text-black px-6 py-2 rounded-xl font-bold hover:bg-emerald-400 transition-colors">Generate</button>
              </div>
            </div>
            
            <!-- Selected AI Preview -->
            <div id="ai-preview-container" class="hidden mt-8 flex flex-col items-center">
              <div class="w-40 h-40 rounded-full bg-surface-variant border-4 border-primary overflow-hidden shadow-xl mb-4">
                <img id="ai-preview-img" src="" class="w-full h-full object-cover">
              </div>
              <button id="save-ai-avatar-btn" class="bg-black border border-primary text-primary px-8 py-3 rounded-full font-bold hover:bg-primary hover:text-black transition-all shadow-[0_0_15px_rgba(0,168,107,0.3)]">
                Set as Profile Picture
              </button>
            </div>
          </div>
        </div>
      `;
    }

    if (tab === 'settings') {
      return `
        <div class="space-y-6">
          <div class="bg-surface-container-lowest rounded-3xl p-6 border border-outline-variant/20 shadow-sm">
            <h3 class="text-title-lg font-bold mb-6 flex items-center gap-2 text-on-surface">
              <span class="material-symbols-outlined text-primary">security</span> Privacy & Security
            </h3>
            
            <div class="space-y-4 divide-y divide-outline-variant/10">
              <div class="flex items-center justify-between py-4">
                <div>
                  <p class="font-bold text-body-lg">Public Profile</p>
                  <p class="text-sm text-on-surface-variant">Allow others to view your profile and achievements.</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" id="toggle-public" class="sr-only peer" ${dbProfile.is_public !== false ? 'checked' : ''}>
                  <div class="w-11 h-6 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
              
              <div class="flex items-center justify-between py-4">
                <div>
                  <p class="font-bold text-body-lg">Show Location</p>
                  <p class="text-sm text-on-surface-variant">Display your country and city on your profile.</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" id="toggle-location" class="sr-only peer" checked>
                  <div class="w-11 h-6 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              <div class="py-4">
                <button class="text-primary font-bold text-sm hover:underline">Change Password</button>
              </div>
            </div>
          </div>

          <div class="bg-error/10 border border-error/20 rounded-3xl p-6">
            <h3 class="text-title-lg font-bold mb-2 text-error">Danger Zone</h3>
            <p class="text-sm text-on-surface-variant mb-6">These actions are permanent and cannot be undone.</p>
            <div class="flex flex-col sm:flex-row gap-4">
              <button id="log-out-btn" class="bg-surface-container border border-outline-variant/30 text-on-surface px-6 py-3 rounded-xl font-bold hover:bg-surface-variant transition-colors flex-1">
                Log Out
              </button>
              <button id="delete-account-btn" class="bg-error text-white px-6 py-3 rounded-xl font-bold hover:bg-red-600 transition-colors flex-1">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      `;
    }
  }

  // 3. Event Binding
  function bindTabEvents(tab) {
    if (tab === 'personal') {
      const form = document.getElementById('personal-form');
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('save-personal-btn');
        btn.innerHTML = `<span class="material-symbols-outlined animate-spin">refresh</span> Saving...`;
        btn.disabled = true;

        // Get checked interests
        const checkboxes = form.querySelectorAll('input[type="checkbox"]:checked');
        const interests = Array.from(checkboxes).map(cb => cb.value);

        const updates = {
          full_name: document.getElementById('p_fullname').value,
          username: document.getElementById('p_username').value,
          phone: document.getElementById('p_phone').value,
          date_of_birth: document.getElementById('p_dob').value || null,
          profession: document.getElementById('p_profession').value,
          country: document.getElementById('p_country').value,
          city: document.getElementById('p_city').value,
          website: document.getElementById('p_website').value,
          bio: document.getElementById('p_bio').value,
          interests: interests,
          updated_at: new Date().toISOString()
        };

        if (userAuth) {
          const { error } = await window.supabaseClient
            .from('profiles')
            .upsert({ id: userAuth.id, ...updates });
          
          if (!error) {
            dbProfile = { ...dbProfile, ...updates };
            localStorage.setItem('nutrify_db_profile', JSON.stringify(dbProfile));
            btn.innerHTML = `<span class="material-symbols-outlined">check</span> Saved!`;
            setTimeout(() => { render(); }, 1500);
          } else {
            alert("Error saving profile: " + error.message);
            btn.innerHTML = `Try Again`;
            btn.disabled = false;
          }
        } else {
          // Local fallback
          dbProfile = { ...dbProfile, ...updates };
          localStorage.setItem('nutrify_db_profile', JSON.stringify(dbProfile));
          btn.innerHTML = `<span class="material-symbols-outlined">check</span> Saved Locally`;
          setTimeout(() => { render(); }, 1500);
        }
      });
    }

    if (tab === 'avatar') {
      let selectedStyle = 'bottts';
      const cards = document.querySelectorAll('.ai-style-card');
      const seedInput = document.getElementById('avatar-seed');
      const genBtn = document.getElementById('generate-avatar-btn');
      const previewContainer = document.getElementById('ai-preview-container');
      const previewImg = document.getElementById('ai-preview-img');
      const saveBtn = document.getElementById('save-ai-avatar-btn');
      const uploadInput = document.getElementById('photo-upload-input');

      // AI Selection
      cards.forEach(card => {
        card.addEventListener('click', () => {
          cards.forEach(c => c.firstElementChild.classList.remove('border-primary'));
          card.firstElementChild.classList.add('border-primary');
          selectedStyle = card.dataset.style;
          generateAvatar();
        });
      });

      genBtn.addEventListener('click', generateAvatar);

      function generateAvatar() {
        const seed = seedInput.value || 'nutrify';
        const url = `https://api.dicebear.com/7.x/${selectedStyle}/svg?seed=${seed}`;
        previewImg.src = url;
        previewContainer.classList.remove('hidden');
      }

      saveBtn.addEventListener('click', async () => {
        const url = previewImg.src;
        await updateAvatarUrl(url);
      });

      // Manual Upload via Supabase Storage
      if (uploadInput) {
        uploadInput.addEventListener('change', async (e) => {
          const file = e.target.files[0];
          if (!file) return;
          if (!userAuth) { alert("Must be logged in to upload photos."); return; }
          if (!window.supabaseClient) return;

          // Simple UI feedback
          uploadInput.parentElement.querySelector('button').innerHTML = `<span class="material-symbols-outlined animate-spin">refresh</span> Uploading...`;
          
          try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${userAuth.id}-${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await window.supabaseClient.storage
              .from('avatars')
              .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = window.supabaseClient.storage.from('avatars').getPublicUrl(filePath);
            await updateAvatarUrl(data.publicUrl);

          } catch (err) {
            alert("Error uploading: " + err.message);
            render(); // reset UI
          }
        });
      }
    }

    if (tab === 'settings') {
      const pubToggle = document.getElementById('toggle-public');
      pubToggle?.addEventListener('change', async (e) => {
        const isPub = e.target.checked;
        dbProfile.is_public = isPub;
        if (userAuth) {
          await window.supabaseClient.from('profiles').update({ is_public: isPub }).eq('id', userAuth.id);
        }
      });

      document.getElementById('log-out-btn')?.addEventListener('click', async () => {
        if (confirm('Are you sure you want to log out?')) {
          if (window.supabaseClient) await window.supabaseClient.auth.signOut();
          localStorage.clear();
          window.location.replace('index.html');
        }
      });
      
      document.getElementById('delete-account-btn')?.addEventListener('click', () => {
        alert("Account deletion requires email confirmation. Please contact support.");
      });
    }
  }

  async function updateAvatarUrl(url) {
    if (userAuth) {
      await window.supabaseClient.from('profiles').upsert({ id: userAuth.id, avatar_url: url });
    }
    dbProfile.avatar_url = url;
    localStorage.setItem('nutrify_db_profile', JSON.stringify(dbProfile));
    render();
    updateHeaderAvatar();
  }

  // Initial Render
  render();

})();
