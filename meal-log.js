// Meal Log Controller Logic

(function() {
  // Check profile existence
  const profile = JSON.parse(localStorage.getItem('nutrify_profile'));
  if (!profile) {
    window.location.replace('onboarding.html');
    return;
  }

  // Load logs
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

  const mealLogContent = document.getElementById('meal-log-content');
  const modalContainer = document.getElementById('modal-container');

  // Redraw the main Meal Log HTML
  function renderLogsView() {
    const targetCals = profile.targets.calories;
    const consumedCals = Math.round(logs.foods.reduce((acc, f) => acc + f.calories, 0));
    const remainingCals = Math.max(targetCals - consumedCals, 0);

    const meals = {
      breakfast: logs.foods.filter(f => f.mealType === 'breakfast'),
      lunch: logs.foods.filter(f => f.mealType === 'lunch'),
      dinner: logs.foods.filter(f => f.mealType === 'dinner'),
      snacks: logs.foods.filter(f => f.mealType === 'snacks')
    };

    const mealCals = {
      breakfast: Math.round(meals.breakfast.reduce((acc, f) => acc + f.calories, 0)),
      lunch: Math.round(meals.lunch.reduce((acc, f) => acc + f.calories, 0)),
      dinner: Math.round(meals.dinner.reduce((acc, f) => acc + f.calories, 0)),
      snacks: Math.round(meals.snacks.reduce((acc, f) => acc + f.calories, 0))
    };

    mealLogContent.innerHTML = `
      <div class="space-y-6">
        <!-- Daily Header -->
        <section class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 class="text-headline-lg-mobile md:text-headline-lg font-headline-lg font-bold text-on-surface">Daily Log</h2>
            <p class="text-body-md text-on-surface-variant font-medium">${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          </div>
          <button id="scan-barcode-btn" class="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-label-md font-bold shadow-md hover:bg-on-primary-container active:scale-95 transition-all">
            <span class="material-symbols-outlined text-[20px]">barcode_scanner</span>
            Barcode Scan
          </button>
        </section>

        <!-- Dynamic Summary Widget -->
        <section class="p-6 rounded-2xl bg-primary text-on-primary shadow-md relative overflow-hidden">
          <div class="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p class="text-label-sm font-label-sm opacity-80">Remaining</p>
              <p class="text-2xl font-bold font-display">${remainingCals.toLocaleString()} <span class="text-xs font-normal">kcal</span></p>
            </div>
            <div>
              <p class="text-label-sm font-label-sm opacity-80">Consumed</p>
              <p class="text-2xl font-bold font-display">${consumedCals.toLocaleString()} <span class="text-xs font-normal">kcal</span></p>
            </div>
            <div>
              <p class="text-label-sm font-label-sm opacity-80">Protein Goal</p>
              <p class="text-2xl font-bold font-display">${profile.targets.macros.protein}g</p>
            </div>
            <div>
              <p class="text-label-sm font-label-sm opacity-80">Hydration</p>
              <p class="text-2xl font-bold font-display">${(logs.waterCups * 0.25).toFixed(2)}L</p>
            </div>
          </div>
          <div class="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        </section>

        <!-- Meal Categories Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Breakfast -->
          <article class="glass-card hover:glow-emerald transition-all rounded-xl p-5 border border-outline-variant/20 shadow-sm flex flex-col justify-between">
            <div>
              <div class="flex justify-between items-center mb-4">
                <div class="flex items-center gap-2.5">
                  <span class="material-symbols-outlined text-amber-500">wb_sunny</span>
                  <h3 class="text-title-lg font-bold">Breakfast</h3>
                  <span class="text-label-sm text-on-surface-variant bg-surface-variant/30 px-2 py-0.5 rounded">${mealCals.breakfast} kcal</span>
                </div>
                <button class="add-meal-item-btn w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center hover:bg-on-primary-container active:scale-90 transition-all" data-meal="breakfast">
                  <span class="material-symbols-outlined text-[20px]">add</span>
                </button>
              </div>
              <div class="divide-y divide-outline-variant/10">
                ${meals.breakfast.length > 0 ? meals.breakfast.map((f, i) => renderFoodItemHTML(f, 'breakfast', i)).join('') : `
                  <p class="text-center py-6 text-xs text-on-surface-variant">No items logged for breakfast</p>
                `}
              </div>
            </div>
          </article>

          <!-- Lunch -->
          <article class="glass-card hover:glow-emerald transition-all rounded-xl p-5 border border-outline-variant/20 shadow-sm flex flex-col justify-between">
            <div>
              <div class="flex justify-between items-center mb-4">
                <div class="flex items-center gap-2.5">
                  <span class="material-symbols-outlined text-primary">lunch_dining</span>
                  <h3 class="text-title-lg font-bold">Lunch</h3>
                  <span class="text-label-sm text-on-surface-variant bg-surface-variant/30 px-2 py-0.5 rounded">${mealCals.lunch} kcal</span>
                </div>
                <button class="add-meal-item-btn w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center hover:bg-on-primary-container active:scale-90 transition-all" data-meal="lunch">
                  <span class="material-symbols-outlined text-[20px]">add</span>
                </button>
              </div>
              <div class="divide-y divide-outline-variant/10">
                ${meals.lunch.length > 0 ? meals.lunch.map((f, i) => renderFoodItemHTML(f, 'lunch', i)).join('') : `
                  <p class="text-center py-6 text-xs text-on-surface-variant">No items logged for lunch</p>
                `}
              </div>
            </div>
          </article>

          <!-- Dinner -->
          <article class="glass-card hover:glow-emerald transition-all rounded-xl p-5 border border-outline-variant/20 shadow-sm flex flex-col justify-between">
            <div>
              <div class="flex justify-between items-center mb-4">
                <div class="flex items-center gap-2.5">
                  <span class="material-symbols-outlined text-on-surface">dark_mode</span>
                  <h3 class="text-title-lg font-bold">Dinner</h3>
                  <span class="text-label-sm text-on-surface-variant bg-surface-variant/30 px-2 py-0.5 rounded">${mealCals.dinner} kcal</span>
                </div>
                <button class="add-meal-item-btn w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center hover:bg-on-primary-container active:scale-90 transition-all" data-meal="dinner">
                  <span class="material-symbols-outlined text-[20px]">add</span>
                </button>
              </div>
              <div class="divide-y divide-outline-variant/10">
                ${meals.dinner.length > 0 ? meals.dinner.map((f, i) => renderFoodItemHTML(f, 'dinner', i)).join('') : `
                  <p class="text-center py-6 text-xs text-on-surface-variant">No items logged for dinner</p>
                `}
              </div>
            </div>
          </article>

          <!-- Snacks -->
          <article class="glass-card hover:glow-emerald transition-all rounded-xl p-5 border border-outline-variant/20 shadow-sm flex flex-col justify-between">
            <div>
              <div class="flex justify-between items-center mb-4">
                <div class="flex items-center gap-2.5">
                  <span class="material-symbols-outlined text-amber-700">cookie</span>
                  <h3 class="text-title-lg font-bold">Snacks</h3>
                  <span class="text-label-sm text-on-surface-variant bg-surface-variant/30 px-2 py-0.5 rounded">${mealCals.snacks} kcal</span>
                </div>
                <button class="add-meal-item-btn w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center hover:bg-on-primary-container active:scale-90 transition-all" data-meal="snacks">
                  <span class="material-symbols-outlined text-[20px]">add</span>
                </button>
              </div>
              <div class="divide-y divide-outline-variant/10">
                ${meals.snacks.length > 0 ? meals.snacks.map((f, i) => renderFoodItemHTML(f, 'snacks', i)).join('') : `
                  <p class="text-center py-6 text-xs text-on-surface-variant">No items logged for snacks</p>
                `}
              </div>
            </div>
          </article>
        </div>
      </div>
    `;

    // Wire add item buttons
    document.querySelectorAll('.add-meal-item-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        showSearchFoodModal(e.currentTarget.dataset.meal);
      });
    });

    // Wire delete item buttons
    document.querySelectorAll('.delete-food-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.currentTarget.dataset.index);
        logs.foods.splice(index, 1);
        localStorage.setItem('nutrify_logs', JSON.stringify(logs));
        renderLogsView();
      });
    });

    // Wire scan barcode button
    document.getElementById('scan-barcode-btn').addEventListener('click', showBarcodeScannerModal);
  }

  // Row list html builder
  function renderFoodItemHTML(food, mealType, index) {
    const globalIndex = logs.foods.findIndex(f => f.name === food.name && f.mealType === mealType && f.calories === food.calories);
    return `
      <div class="flex justify-between items-center py-3">
        <div class="min-w-0 pr-2">
          <p class="text-body-md font-semibold text-on-surface truncate">${food.name}</p>
          <p class="text-xs text-on-surface-variant font-medium">${food.amount}g • P:${Math.round(food.protein)}g C:${Math.round(food.carbs)}g F:${Math.round(food.fat)}g</p>
        </div>
        <div class="flex items-center gap-3 flex-shrink-0">
          <p class="text-label-md font-bold text-on-surface">${Math.round(food.calories)} kcal</p>
          <button class="delete-food-btn text-outline hover:text-error transition-colors p-1" data-index="${globalIndex}">
            <span class="material-symbols-outlined text-lg">delete</span>
          </button>
        </div>
      </div>
    `;
  }

  // ==========================================
  // MODALS SYSTEM
  // ==========================================

  // Open Search Food Modal
  function showSearchFoodModal(mealType) {
    modalContainer.innerHTML = `
      <div class="bg-white border border-outline-variant/30 rounded-2xl w-full max-w-lg shadow-2xl p-6 relative flex flex-col gap-4 fade-in">
        <button id="close-modal-btn" class="absolute top-4 right-4 text-outline hover:text-on-surface p-1">
          <span class="material-symbols-outlined text-2xl">close</span>
        </button>
        
        <div>
          <h3 class="text-title-lg font-bold text-on-surface mb-1">Add Food to ${mealType.charAt(0).toUpperCase() + mealType.slice(1)}</h3>
          <p class="text-xs text-on-surface-variant font-medium">Search the food database or enter custom calories.</p>
        </div>

        <div class="relative">
          <div class="flex gap-2">
            <input id="food-search-box" class="flex-grow border border-outline-variant/30 rounded-xl px-4 py-2.5 bg-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-none" placeholder="Search product (e.g. Oats, Egg)...">
            <button id="modal-barcode-btn" class="bg-primary text-white p-2.5 rounded-xl hover:bg-on-primary-container active:scale-95 transition-all flex items-center justify-center">
              <span class="material-symbols-outlined text-lg">barcode_scanner</span>
            </button>
          </div>
          <div id="autocomplete-dropdown" class="absolute left-0 w-full bg-white border border-outline-variant/20 rounded-xl shadow-xl mt-1 max-h-60 overflow-y-auto z-50 hidden divide-y divide-outline-variant/10">
            <!-- Autocomplete list elements -->
          </div>
        </div>

        <div class="border-t border-outline-variant/10 pt-4">
          <h4 class="text-xs font-bold text-outline uppercase tracking-wider mb-2">Or add custom entry</h4>
          <form id="custom-entry-form" class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-[10px] font-bold text-outline mb-0.5">Food Name</label>
              <input id="custom-name" required placeholder="e.g. Protein shake" class="w-full border border-outline-variant/30 rounded-lg px-2.5 py-1.5 bg-surface outline-none text-xs">
            </div>
            <div>
              <label class="block text-[10px] font-bold text-outline mb-0.5">Calories (kcal)</label>
              <input id="custom-kcal" type="number" required placeholder="e.g. 250" class="w-full border border-outline-variant/30 rounded-lg px-2.5 py-1.5 bg-surface outline-none text-xs">
            </div>
            <div>
              <label class="block text-[10px] font-bold text-outline mb-0.5">Protein (g)</label>
              <input id="custom-p" type="number" step="0.1" value="0" class="w-full border border-outline-variant/30 rounded-lg px-2.5 py-1.5 bg-surface outline-none text-xs">
            </div>
            <div>
              <label class="block text-[10px] font-bold text-outline mb-0.5">Carbs (g)</label>
              <input id="custom-c" type="number" step="0.1" value="0" class="w-full border border-outline-variant/30 rounded-lg px-2.5 py-1.5 bg-surface outline-none text-xs">
            </div>
            <button type="submit" class="col-span-2 w-full bg-primary text-white py-2 rounded-xl text-xs font-bold hover:bg-on-primary-container active:scale-95 transition-all">
              Save Custom Food
            </button>
          </form>
        </div>
      </div>
    `;

    modalContainer.classList.remove('hidden');

    const searchBox = document.getElementById('food-search-box');
    const dropdown = document.getElementById('autocomplete-dropdown');

    searchBox.focus();

    document.getElementById('close-modal-btn').addEventListener('click', () => {
      modalContainer.classList.add('hidden');
    });

    document.getElementById('modal-barcode-btn').addEventListener('click', showBarcodeScannerModal);

    // Custom submit form
    document.getElementById('custom-entry-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('custom-name').value;
      const calories = parseFloat(document.getElementById('custom-kcal').value);
      const protein = parseFloat(document.getElementById('custom-p').value) || 0;
      const carbs = parseFloat(document.getElementById('custom-c').value) || 0;
      const fat = parseFloat(Math.max((calories - (protein*4 + carbs*4)) / 9, 0).toFixed(1));

      logs.foods.push({
        name,
        amount: 100,
        calories,
        protein,
        carbs,
        fat,
        mealType
      });
      localStorage.setItem('nutrify_logs', JSON.stringify(logs));
      modalContainer.classList.add('hidden');
      renderLogsView();
    });

    // Handle search input typing
    let searchDebounce = null;
    searchBox.addEventListener('input', () => {
      clearTimeout(searchDebounce);
      const q = searchBox.value.trim();
      
      if (!q) {
        dropdown.innerHTML = '';
        dropdown.classList.add('hidden');
        return;
      }

      searchDebounce = setTimeout(async () => {
        dropdown.innerHTML = `<div class="p-4 text-center text-xs text-on-surface-variant font-medium">Searching database...</div>`;
        dropdown.classList.remove('hidden');

        const products = await window.NutritionAPI.searchProducts(q);
        if (products.length === 0) {
          dropdown.innerHTML = `<div class="p-4 text-center text-xs text-error font-bold">No products found</div>`;
          return;
        }

        dropdown.innerHTML = products.map(p => `
          <button class="w-full flex items-center justify-between p-3 text-left hover:bg-surface transition-colors select-item-btn" 
            data-product='${JSON.stringify(p).replace(/'/g, "&#39;")}'>
            <div class="min-w-0 pr-2">
              <p class="text-xs font-bold text-on-surface truncate">${p.name}</p>
              <p class="text-[10px] text-on-surface-variant font-semibold truncate">${p.brand ? p.brand : 'Generic brand'}</p>
            </div>
            <div class="text-right flex-shrink-0">
              <span class="text-xs font-bold text-primary">${p.nutritionPer100g.calories} kcal</span>
              <p class="text-[8px] text-on-surface-variant font-bold">per 100g</p>
            </div>
          </button>
        `).join('');

        // Wire selection click
        dropdown.querySelectorAll('.select-item-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
            const product = JSON.parse(e.currentTarget.dataset.product);
            showServingModal(product, mealType);
          });
        });
      }, 300);
    });
  }

  // Open Serving Modal
  function showServingModal(product, mealType) {
    const optionsHtml = (product.serving_options || [{ serving: "100 grams", grams: 100 }]).map((opt, i) => 
      `<option value="${opt.grams}" ${i===0?'selected':''}>${opt.serving}</option>`
    ).join('');

    modalContainer.innerHTML = `
      <div class="bg-white border border-outline-variant/30 rounded-2xl w-full max-w-sm shadow-2xl p-6 relative flex flex-col gap-4 fade-in">
        <button id="close-serving-btn" class="absolute top-4 right-4 text-outline hover:text-on-surface p-1">
          <span class="material-symbols-outlined text-2xl">close</span>
        </button>

        <div>
          <h3 class="text-title-lg font-bold text-on-surface mb-1">Add Food</h3>
          <p class="text-xs font-semibold text-primary">${product.name}</p>
        </div>

        <div>
          <label class="block text-xs font-bold text-outline uppercase tracking-wider mb-2">Serving Size</label>
          <select id="serving-select" class="w-full border border-outline-variant/30 rounded-xl px-4 py-2.5 bg-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-none mb-3">
            ${optionsHtml}
            <option value="custom">Custom Grams...</option>
          </select>
          
          <div id="custom-grams-container" class="hidden flex items-center gap-2">
            <input id="grams-input" type="number" value="100" min="1" max="2000" class="w-full border border-outline-variant/30 rounded-xl px-4 py-2.5 bg-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-none">
            <span class="font-bold text-on-surface text-lg pr-2">grams</span>
          </div>
          
          <div class="mt-4 p-3 bg-surface-variant/20 rounded-xl border border-outline-variant/10 text-center">
             <p class="text-[10px] text-outline font-bold uppercase tracking-wider mb-1">Estimated Macros</p>
             <div class="flex justify-between items-center px-2">
                <span id="est-cals" class="text-lg font-bold text-primary">0 kcal</span>
                <span id="est-p" class="text-xs font-medium text-on-surface">P: 0g</span>
                <span id="est-c" class="text-xs font-medium text-on-surface">C: 0g</span>
                <span id="est-f" class="text-xs font-medium text-on-surface">F: 0g</span>
             </div>
          </div>
        </div>

        <button id="save-serving-btn" class="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-on-primary-container active:scale-95 transition-all">
          Log Meal
        </button>
      </div>
    `;

    const select = document.getElementById('serving-select');
    const customContainer = document.getElementById('custom-grams-container');
    const gramsInput = document.getElementById('grams-input');

    function updateMacros() {
      let grams = 0;
      if (select.value === 'custom') {
        customContainer.classList.remove('hidden');
        grams = parseFloat(gramsInput.value) || 0;
        // Make typing easier
        gramsInput.focus();
      } else {
        customContainer.classList.add('hidden');
        grams = parseFloat(select.value) || 0;
      }
      
      const ratio = grams / 100;
      document.getElementById('est-cals').innerText = Math.round(product.nutritionPer100g.calories * ratio) + ' kcal';
      document.getElementById('est-p').innerText = 'P: ' + (product.nutritionPer100g.protein * ratio).toFixed(1) + 'g';
      document.getElementById('est-c').innerText = 'C: ' + (product.nutritionPer100g.carbs * ratio).toFixed(1) + 'g';
      document.getElementById('est-f').innerText = 'F: ' + (product.nutritionPer100g.fat * ratio).toFixed(1) + 'g';
    }

    select.addEventListener('change', updateMacros);
    gramsInput.addEventListener('input', updateMacros);
    updateMacros(); // initial render

    document.getElementById('close-serving-btn').addEventListener('click', () => {
      showSearchFoodModal(mealType); // Back to search
    });

    document.getElementById('save-serving-btn').addEventListener('click', () => {
      let grams = select.value === 'custom' ? parseFloat(gramsInput.value) : parseFloat(select.value);
      if (grams > 0) {
        const ratio = grams / 100;
        let finalServingName = select.value === 'custom' ? \`\${grams} grams\` : select.options[select.selectedIndex].text;
        
        logs.foods.push({
          name: product.name + \` (\${finalServingName})\`,
          amount: grams,
          calories: Math.round(product.nutritionPer100g.calories * ratio),
          protein: parseFloat((product.nutritionPer100g.protein * ratio).toFixed(1)),
          carbs: parseFloat((product.nutritionPer100g.carbs * ratio).toFixed(1)),
          fat: parseFloat((product.nutritionPer100g.fat * ratio).toFixed(1)),
          mealType
        });
        localStorage.setItem('nutrify_logs', JSON.stringify(logs));
        
        // Cache this item to Recent Foods offline DB!
        if (window.NutritionAPI && window.NutritionAPI.cacheRecentFood) {
          window.NutritionAPI.cacheRecentFood(product);
        }

        modalContainer.classList.add('hidden');
        renderLogsView();
      }
    });
  }

  // Open Barcode Scanner modal
  function showBarcodeScannerModal() {
    modalContainer.innerHTML = `
      <div class="bg-white border border-outline-variant/30 rounded-2xl w-full max-w-md shadow-2xl p-6 relative flex flex-col gap-4 fade-in">
        <button id="close-scanner-btn" class="absolute top-4 right-4 text-outline hover:text-on-surface p-1 z-10">
          <span class="material-symbols-outlined text-2xl">close</span>
        </button>

        <div>
          <h3 class="text-title-lg font-bold text-on-surface mb-1">Barcode Scanner</h3>
          <p class="text-xs text-on-surface-variant font-medium">Scan product package label barcode to instantly fetch details.</p>
        </div>

        <div id="qr-reader-target" class="w-full bg-slate-100 rounded-xl overflow-hidden min-h-[200px] border border-outline-variant/20 relative flex items-center justify-center">
          <div class="absolute inset-0 flex flex-col items-center justify-center text-center p-6" id="scanner-idle-placeholder">
            <span class="material-symbols-outlined text-4xl text-outline mb-2 animate-bounce">photo_camera</span>
            <p class="text-xs font-bold text-on-surface">Camera Starting...</p>
            <p class="text-[10px] text-outline mt-1 leading-tight">Allow camera access prompt if prompted.</p>
          </div>
        </div>

        <div id="scanner-result" class="hidden p-4 bg-surface rounded-xl border border-outline-variant/20 flex flex-col gap-3">
          <!-- Found product details printed here -->
        </div>
      </div>
    `;

    modalContainer.classList.remove('hidden');

    let html5QrcodeScanner = null;

    setTimeout(() => {
      html5QrcodeScanner = new Html5QrcodeScanner(
        "qr-reader-target", 
        { 
          fps: 10, 
          qrbox: { width: 250, height: 140 },
          aspectRatio: 1.33
        },
        false
      );

      html5QrcodeScanner.render(async (decodedText) => {
        html5QrcodeScanner.pause();
        
        const readerDiv = document.getElementById('qr-reader-target');
        readerDiv.innerHTML = `<div class="p-6 text-center text-xs text-on-surface-variant font-bold">Querying Open Food Facts API...</div>`;

        const product = await window.NutritionAPI.getProductByBarcode(decodedText);
        
        if (product) {
          readerDiv.classList.add('hidden');
          const resultBox = document.getElementById('scanner-result');
          resultBox.innerHTML = `
            <div class="flex items-center gap-3">
              <span class="material-symbols-outlined text-3xl text-primary">check_circle</span>
              <div class="min-w-0 flex-grow">
                <p class="text-sm font-bold text-on-surface truncate">${product.name}</p>
                <p class="text-xs text-on-surface-variant font-medium">${product.brand ? product.brand : 'Generic'} • ${product.nutritionPer100g.calories} kcal/100g</p>
              </div>
            </div>
            
            <div class="flex gap-2 mt-2">
              <button id="confirm-scan-btn" class="flex-grow bg-primary text-white py-2 rounded-xl text-xs font-bold hover:bg-on-primary-container active:scale-95 transition-all">
                Add to Meal Log
              </button>
              <button id="retry-scan-btn" class="bg-surface border border-outline-variant/30 text-on-surface px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all">
                Scan Again
              </button>
            </div>
          `;
          resultBox.classList.remove('hidden');

          document.getElementById('confirm-scan-btn').addEventListener('click', () => {
            html5QrcodeScanner.clear();
            showServingModal(product, 'breakfast'); // Default to breakfast
          });

          document.getElementById('retry-scan-btn').addEventListener('click', () => {
            html5QrcodeScanner.clear();
            showBarcodeScannerModal();
          });

        } else {
          readerDiv.innerHTML = `
            <div class="p-6 text-center text-xs text-error font-bold flex flex-col items-center gap-2">
              <span class="material-symbols-outlined text-3xl">error</span>
              Product not found in OpenFoodFacts
              <button id="close-failed-scan-btn" class="mt-4 bg-primary text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-on-primary-container transition-all">
                Close Scanner
              </button>
            </div>
          `;
          document.getElementById('close-failed-scan-btn').addEventListener('click', cleanUpScanner);
        }
      }, (error) => {});
    }, 150);

    function cleanUpScanner() {
      if (html5QrcodeScanner) {
        try {
          html5QrcodeScanner.clear();
        } catch (e) {}
      }
      modalContainer.classList.add('hidden');
    }

    document.getElementById('close-scanner-btn').addEventListener('click', cleanUpScanner);
  }

  // ==========================================
  // INITIALIZATION
  // ==========================================

  renderLogsView();

  // Handle auto-launch search if URL has ?action=search
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('action') === 'search') {
    showSearchFoodModal('breakfast');
  }

  // Notification button action
  document.getElementById('noti-btn').addEventListener('click', () => {
    alert("Nutrify Guide Alert: Iron deficiency logged this week! Added spinach suggestions to your AI Guide recommendations.");
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
