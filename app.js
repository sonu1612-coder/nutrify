// Main Application Logic - Dark Theme

const contentEl = document.getElementById('content');
const appRoot = document.getElementById('app-root');
const obWrap = document.getElementById('ob-wrap');
const pageTitle = document.getElementById('page-title');
const pageSub = document.getElementById('page-sub');
const currentDateEl = document.getElementById('current-date');

// State
let state = {
  profile: JSON.parse(localStorage.getItem('nutrify_profile')) || null,
  logs: JSON.parse(localStorage.getItem('nutrify_logs')) || {
    date: new Date().toLocaleDateString('en-CA'),
    foods: []
  }
};

const today = new Date().toLocaleDateString('en-CA');
if (state.logs.date !== today) {
  state.logs = { date: today, foods: [] };
  saveLogs();
}

function saveProfile() {
  localStorage.setItem('nutrify_profile', JSON.stringify(state.profile));
}

function saveLogs() {
  localStorage.setItem('nutrify_logs', JSON.stringify(state.logs));
}

function navigateTo(view) {
  // Mobile sidebar close
  document.getElementById('sidebar').classList.remove('open');

  document.querySelectorAll('.nb').forEach(btn => {
    if(btn.dataset.target === view) {
      btn.classList.add('on');
    } else {
      btn.classList.remove('on');
    }
  });

  if (!state.profile) {
    appRoot.style.display = 'none';
    obWrap.style.display = 'flex';
    renderOnboardingView();
    return;
  }

  obWrap.style.display = 'none';
  appRoot.style.display = 'flex';

  if (view === 'dashboard') {
    pageTitle.textContent = "Dashboard";
    pageSub.textContent = "Your daily summary";
    document.getElementById('date-ctrl').style.display = 'flex';
    currentDateEl.textContent = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    renderDashboardView();
  } else if (view === 'food-logger') {
    pageTitle.textContent = "Search Foods";
    pageSub.textContent = "Find and log what you ate";
    document.getElementById('date-ctrl').style.display = 'none';
    renderFoodLoggerView();
  } else if (view === 'scanner') {
    pageTitle.textContent = "Barcode Scanner";
    pageSub.textContent = "Scan a package label";
    document.getElementById('date-ctrl').style.display = 'none';
    renderScannerView();
  } else if (view === 'profile') {
    pageTitle.textContent = "My Profile";
    pageSub.textContent = "Settings & Goals";
    document.getElementById('date-ctrl').style.display = 'none';
    renderProfileView();
  }
}

// ==========================================
// VIEWS
// ==========================================

function renderOnboardingView() {
  const p = state.profile || { heightUnit: 'cm', weightUnit: 'kg', goal: 'maintain', activity: 'sedentary', gender: 'male' };
  
  obWrap.innerHTML = `
    <div class="ob-card fade-in">
      <div class="ob-logo">Nutrify</div>
      <div class="ob-sub">Personalized nutrition calculator</div>
      <div class="ob-stitle">Welcome!</div>
      <div class="ob-sdesc">Let's set up your profile so we can calculate your daily calorie and macronutrient targets.</div>
      
      <form id="profile-form">
        <div class="frow fg">
          <div>
            <label class="lbl">Gender</label>
            <select id="gender">
              <option value="male" ${p.gender === 'male' ? 'selected' : ''}>Male</option>
              <option value="female" ${p.gender === 'female' ? 'selected' : ''}>Female</option>
            </select>
          </div>
          <div>
            <label class="lbl">Age</label>
            <input type="number" id="age" value="${p.age || ''}" required min="10" max="120" placeholder="Years">
          </div>
        </div>
        
        <div class="fg">
          <label class="lbl">Height</label>
          <div class="ht-toggle">
            <button type="button" class="ht-opt ${p.heightUnit === 'cm' ? 'on' : ''}" data-type="height" data-val="cm">CM</button>
            <button type="button" class="ht-opt ${p.heightUnit === 'ft' ? 'on' : ''}" data-type="height" data-val="ft">FT/IN</button>
          </div>
          <div id="height-inputs">
            ${p.heightUnit === 'ft' ? `
              <div class="frow">
                <input type="number" id="height1" placeholder="Feet" value="${p.height1 || ''}" required min="1">
                <input type="number" id="height2" placeholder="Inches" value="${p.height2 || ''}" required min="0" max="11">
              </div>
            ` : `
              <input type="number" id="height1" placeholder="Centimeters" value="${p.height1 || ''}" required min="50">
            `}
          </div>
        </div>

        <div class="fg">
          <label class="lbl">Weight</label>
          <div class="ht-toggle">
            <button type="button" class="ht-opt ${p.weightUnit === 'kg' ? 'on' : ''}" data-type="weight" data-val="kg">KG</button>
            <button type="button" class="ht-opt ${p.weightUnit === 'lbs' ? 'on' : ''}" data-type="weight" data-val="lbs">LBS</button>
          </div>
          <input type="number" id="weight" step="0.1" placeholder="Current weight" value="${p.weight || ''}" required min="20">
        </div>

        <div class="fg">
          <label class="lbl">Activity Level</label>
          <select id="activity">
            <option value="sedentary" ${p.activity === 'sedentary' ? 'selected' : ''}>Sedentary (Office Job)</option>
            <option value="light" ${p.activity === 'light' ? 'selected' : ''}>Light Exercise (1-2 days/wk)</option>
            <option value="moderate" ${p.activity === 'moderate' ? 'selected' : ''}>Moderate (3-5 days/wk)</option>
            <option value="active" ${p.activity === 'active' ? 'selected' : ''}>Active (6-7 days/wk)</option>
          </select>
        </div>

        <div class="fg">
          <label class="lbl">Goal</label>
          <select id="goal">
            <option value="lose" ${p.goal === 'lose' ? 'selected' : ''}>Lose Weight</option>
            <option value="maintain" ${p.goal === 'maintain' ? 'selected' : ''}>Maintain Weight</option>
            <option value="gain" ${p.goal === 'gain' ? 'selected' : ''}>Build Muscle</option>
          </select>
        </div>

        <div class="ob-nav">
          <div></div>
          <button type="submit" class="btn btn-p">Calculate Targets <i class="ph ph-arrow-right"></i></button>
        </div>
      </form>
    </div>
  `;
  attachProfileListeners();
}

function renderProfileView() {
  const p = state.profile;
  contentEl.innerHTML = `
    <div class="card fade-in" style="max-width: 600px; margin: 0 auto;">
      <div class="ct">Edit Profile & Goals</div>
      <form id="profile-form">
        <!-- Re-use the onboarding form fields for simplicity -->
        <div class="frow fg">
          <div>
            <label class="lbl">Gender</label>
            <select id="gender">
              <option value="male" ${p.gender === 'male' ? 'selected' : ''}>Male</option>
              <option value="female" ${p.gender === 'female' ? 'selected' : ''}>Female</option>
            </select>
          </div>
          <div>
            <label class="lbl">Age</label>
            <input type="number" id="age" value="${p.age || ''}" required min="10" max="120" placeholder="Years">
          </div>
        </div>
        
        <div class="fg">
          <label class="lbl">Height</label>
          <div class="ht-toggle">
            <button type="button" class="ht-opt ${p.heightUnit === 'cm' ? 'on' : ''}" data-type="height" data-val="cm">CM</button>
            <button type="button" class="ht-opt ${p.heightUnit === 'ft' ? 'on' : ''}" data-type="height" data-val="ft">FT/IN</button>
          </div>
          <div id="height-inputs">
            ${p.heightUnit === 'ft' ? `
              <div class="frow">
                <input type="number" id="height1" placeholder="Feet" value="${p.height1 || ''}" required min="1">
                <input type="number" id="height2" placeholder="Inches" value="${p.height2 || ''}" required min="0" max="11">
              </div>
            ` : `
              <input type="number" id="height1" placeholder="Centimeters" value="${p.height1 || ''}" required min="50">
            `}
          </div>
        </div>

        <div class="fg">
          <label class="lbl">Weight</label>
          <div class="ht-toggle">
            <button type="button" class="ht-opt ${p.weightUnit === 'kg' ? 'on' : ''}" data-type="weight" data-val="kg">KG</button>
            <button type="button" class="ht-opt ${p.weightUnit === 'lbs' ? 'on' : ''}" data-type="weight" data-val="lbs">LBS</button>
          </div>
          <input type="number" id="weight" step="0.1" placeholder="Current weight" value="${p.weight || ''}" required min="20">
        </div>

        <div class="fg">
          <label class="lbl">Activity Level</label>
          <select id="activity">
            <option value="sedentary" ${p.activity === 'sedentary' ? 'selected' : ''}>Sedentary (Office Job)</option>
            <option value="light" ${p.activity === 'light' ? 'selected' : ''}>Light Exercise (1-2 days/wk)</option>
            <option value="moderate" ${p.activity === 'moderate' ? 'selected' : ''}>Moderate (3-5 days/wk)</option>
            <option value="active" ${p.activity === 'active' ? 'selected' : ''}>Active (6-7 days/wk)</option>
          </select>
        </div>

        <div class="fg">
          <label class="lbl">Goal</label>
          <select id="goal">
            <option value="lose" ${p.goal === 'lose' ? 'selected' : ''}>Lose Weight</option>
            <option value="maintain" ${p.goal === 'maintain' ? 'selected' : ''}>Maintain Weight</option>
            <option value="gain" ${p.goal === 'gain' ? 'selected' : ''}>Build Muscle</option>
          </select>
        </div>

        <button type="submit" class="btn btn-p btn-full mt-4">Save Changes</button>
      </form>
    </div>
  `;
  attachProfileListeners();
}

function attachProfileListeners() {
  document.querySelectorAll('.ht-opt').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const type = e.target.dataset.type;
      const val = e.target.dataset.val;
      
      e.target.parentElement.querySelectorAll('.ht-opt').forEach(b => b.classList.remove('on'));
      e.target.classList.add('on');

      if (type === 'height') {
        const hContainer = document.getElementById('height-inputs');
        if (val === 'ft') {
          hContainer.innerHTML = `
            <div class="frow">
              <input type="number" id="height1" placeholder="Feet" required min="1">
              <input type="number" id="height2" placeholder="Inches" required min="0" max="11">
            </div>
          `;
        } else {
          hContainer.innerHTML = `<input type="number" id="height1" placeholder="Centimeters" required min="50">`;
        }
      }
    });
  });

  const form = document.getElementById('profile-form');
  if(form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const heightUnit = document.querySelector('.ht-opt[data-type="height"].on').dataset.val;
      const weightUnit = document.querySelector('.ht-opt[data-type="weight"].on').dataset.val;
      
      const h1 = document.getElementById('height1').value;
      const h2 = document.getElementById('height2') ? document.getElementById('height2').value : 0;
      const weight = parseFloat(document.getElementById('weight').value);
      const age = parseInt(document.getElementById('age').value);
      const gender = document.getElementById('gender').value;
      const activity = document.getElementById('activity').value;
      const goal = document.getElementById('goal').value;

      const weightKg = window.NutrifyCalculator.convertToKg(weight, weightUnit);
      const heightCm = window.NutrifyCalculator.convertToCm(h1, h2, heightUnit);
      const bmr = window.NutrifyCalculator.calculateBMR(weightKg, heightCm, age, gender);
      const tdee = window.NutrifyCalculator.calculateTDEE(bmr, activity);
      const targetCalories = window.NutrifyCalculator.calculateCaloricTarget(tdee, goal);
      const targetMacros = window.NutrifyCalculator.calculateMacros(targetCalories, goal);

      state.profile = {
        heightUnit, weightUnit, height1: h1, height2: h2, weight, age, gender, activity, goal,
        targets: {
          calories: Math.round(targetCalories),
          macros: targetMacros
        }
      };
      
      saveProfile();
      navigateTo('dashboard');
    });
  }
}

function renderDashboardView() {
  const { calories, macros } = state.profile.targets;
  
  let consumedCals = 0;
  let consumedMacros = { protein: 0, carbs: 0, fat: 0 };
  
  state.logs.foods.forEach(f => {
    consumedCals += f.calories;
    consumedMacros.protein += f.protein;
    consumedMacros.carbs += f.carbs;
    consumedMacros.fat += f.fat;
  });

  const remainingCals = calories - consumedCals;
  const progressPct = Math.min((consumedCals / calories) * 100, 100);
  const ringOffset = 283 - (283 * progressPct) / 100; // 2 * pi * r (r=45) = 283

  const protPct = Math.min((consumedMacros.protein / macros.protein) * 100, 100);
  const carbsPct = Math.min((consumedMacros.carbs / macros.carbs) * 100, 100);
  const fatPct = Math.min((consumedMacros.fat / macros.fat) * 100, 100);

  contentEl.innerHTML = `
    <div class="g2 fade-in" style="align-items:start;">
      <!-- Left Col -->
      <div class="gcol">
        <div class="card">
          <div class="ct">Calories</div>
          <div class="ring-wrap" style="margin-bottom:20px;">
            <svg viewBox="0 0 110 110" class="ring-svg">
              <circle cx="55" cy="55" r="45" class="ring-bg"></circle>
              <circle cx="55" cy="55" r="45" class="ring-fg" stroke="var(--ac)" stroke-dasharray="283" stroke-dashoffset="${ringOffset}"></circle>
            </svg>
            <div class="ring-inner">
              <div class="ring-num">${Math.round(remainingCals)}</div>
              <div class="ring-lbl">Kcal Left</div>
            </div>
          </div>
          <div class="lv-row">
            <span>Base Goal</span>
            <span>${calories}</span>
          </div>
          <div class="lv-row">
            <span>Food</span>
            <span class="lv-ok">${Math.round(consumedCals)}</span>
          </div>
        </div>

        <div class="card">
          <div class="ct">Macronutrients</div>
          
          <div class="macro-row">
            <div class="mr-dot" style="background:var(--info);"></div>
            <div class="mr-name">Protein</div>
            <div class="mr-bar">
              <div class="pb-wrap"><div class="pb" style="background:var(--info); width:${protPct}%;"></div></div>
            </div>
            <div class="mr-val">${Math.round(consumedMacros.protein)} / ${macros.protein}g</div>
          </div>
          
          <div class="macro-row">
            <div class="mr-dot" style="background:var(--warn);"></div>
            <div class="mr-name">Carbs</div>
            <div class="mr-bar">
              <div class="pb-wrap"><div class="pb" style="background:var(--warn); width:${carbsPct}%;"></div></div>
            </div>
            <div class="mr-val">${Math.round(consumedMacros.carbs)} / ${macros.carbs}g</div>
          </div>
          
          <div class="macro-row">
            <div class="mr-dot" style="background:var(--danger);"></div>
            <div class="mr-name">Fat</div>
            <div class="mr-bar">
              <div class="pb-wrap"><div class="pb" style="background:var(--danger); width:${fatPct}%;"></div></div>
            </div>
            <div class="mr-val">${Math.round(consumedMacros.fat)} / ${macros.fat}g</div>
          </div>
        </div>
      </div>

      <!-- Right Col -->
      <div class="gcol">
        <div class="card" style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <div class="ct" style="margin-bottom:4px;">Today's Foods</div>
            <div style="font-size:12px; color:var(--tx3);">${state.logs.foods.length} items logged</div>
          </div>
          <button class="btn btn-sm btn-g" onclick="navigateTo('food-logger')">+ Add</button>
        </div>
        
        <div>
          ${state.logs.foods.length === 0 ? '<div class="card"><p style="font-size:12px;color:var(--tx3);text-align:center;">No foods logged today. Start eating!</p></div>' : ''}
          ${state.logs.foods.map((f, i) => `
            <div class="meal-row">
              <div class="meal-em"><i class="ph ph-fork-knife" style="color:var(--tx3)"></i></div>
              <div class="meal-info">
                <div class="meal-name">${f.name}</div>
                <div class="meal-meta">${f.amount}g • ${Math.round(f.protein)}P ${Math.round(f.carbs)}C ${Math.round(f.fat)}F</div>
              </div>
              <div class="meal-kcal">
                <div class="meal-kv">${Math.round(f.calories)}</div>
                <div class="meal-ku">kcal</div>
              </div>
              <button class="del-btn" onclick="removeFood(${i})"><i class="ph ph-trash"></i></button>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

window.removeFood = (index) => {
  state.logs.foods.splice(index, 1);
  saveLogs();
  renderDashboardView();
};

function renderFoodLoggerView() {
  contentEl.innerHTML = `
    <div class="card fade-in">
      <div class="ct">Find Food</div>
      <div style="display:flex; gap:10px;">
        <input type="text" id="food-search-input" placeholder="Search for food (e.g., Banana, Chicken)">
        <button class="btn btn-p" id="search-btn">Search</button>
      </div>
      <div class="sg"></div>
      <div id="search-results" style="display:flex; flex-direction:column; gap:8px;"></div>
    </div>
  `;

  document.getElementById('search-btn').addEventListener('click', async () => {
    const q = document.getElementById('food-search-input').value;
    if (!q) return;
    
    const resultsContainer = document.getElementById('search-results');
    resultsContainer.innerHTML = '<p style="font-size:12px;color:var(--tx3);">Searching database...</p>';
    
    const results = await window.NutritionAPI.searchProducts(q);
    if (results.length === 0) {
      resultsContainer.innerHTML = '<p style="font-size:12px;color:var(--danger);">No results found.</p>';
      return;
    }

    resultsContainer.innerHTML = results.map((r, i) => `
      <div class="meal-row" style="background:var(--bg2);">
        <div class="meal-info">
          <div class="meal-name">${r.name} ${r.brand ? `<span style="font-size:10px; color:var(--tx3)">(${r.brand})</span>` : ''}</div>
          <div class="meal-meta">Per 100g</div>
        </div>
        <div class="meal-kcal" style="margin-right:12px;">
          <div class="meal-kv" style="font-size:12px; color:var(--tx);">${r.nutritionPer100g.calories}</div>
          <div class="meal-ku">kcal</div>
        </div>
        <button class="btn btn-sm btn-g" onclick='openAddDialog(${JSON.stringify(r).replace(/'/g, "&#39;")})'>Add</button>
      </div>
    `).join('');
  });
}

window.openAddDialog = (foodObj) => {
  const amount = prompt(`How many grams of ${foodObj.name} did you eat?`, "100");
  if (amount && !isNaN(amount)) {
    const multiplier = parseFloat(amount) / 100;
    const logEntry = {
      name: foodObj.name,
      amount: parseFloat(amount),
      calories: foodObj.nutritionPer100g.calories * multiplier,
      protein: foodObj.nutritionPer100g.protein * multiplier,
      carbs: foodObj.nutritionPer100g.carbs * multiplier,
      fat: foodObj.nutritionPer100g.fat * multiplier
    };
    state.logs.foods.push(logEntry);
    saveLogs();
    navigateTo('dashboard');
  }
};

function renderScannerView() {
  contentEl.innerHTML = `
    <div class="card fade-in">
      <div class="ct">Scan Barcode</div>
      <p style="font-size:12px; color:var(--tx3); margin-bottom:16px;">Scan a food package barcode to instantly get its nutrition data.</p>
      
      <div class="scan-zone" id="reader" style="padding:0; overflow:hidden; border: 2px dashed var(--bd2); border-radius: var(--r);"></div>
      <div id="scanner-result" class="mt-4"></div>
    </div>
  `;

  setTimeout(() => {
    const html5QrcodeScanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: {width: 250, height: 150} }, false);
    
    html5QrcodeScanner.render(async (decodedText, decodedResult) => {
      html5QrcodeScanner.pause();
      
      const resContainer = document.getElementById('scanner-result');
      resContainer.innerHTML = '<p style="font-size:12px;color:var(--tx3);margin-top:16px;">Fetching data from OpenFoodFacts...</p>';
      
      const product = await window.NutritionAPI.getProductByBarcode(decodedText);
      if (product) {
        html5QrcodeScanner.clear();
        resContainer.innerHTML = `
          <div class="meal-row mt-4" style="background:var(--bg2);">
            <div class="meal-info">
              <div class="meal-name">${product.name}</div>
              <div class="meal-meta">Per 100g: ${product.nutritionPer100g.calories} kcal</div>
            </div>
            <button class="btn btn-sm btn-p" onclick='openAddDialog(${JSON.stringify(product).replace(/'/g, "&#39;")})'>Log This</button>
            <button class="btn btn-sm btn-g" onclick="navigateTo('scanner')" style="margin-left:8px;">Scan Another</button>
          </div>
        `;
      } else {
        resContainer.innerHTML = `
          <div class="alert al-d mt-4">Product not found in database.</div>
          <button class="btn btn-sm btn-g mt-4" onclick="navigateTo('scanner')">Try Again</button>
        `;
      }
    }, (error) => {});
  }, 100);
}

// Navigation Listeners
document.querySelectorAll('.nav-item').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const target = e.currentTarget.dataset.target;
    navigateTo(target);
  });
});

// Init
navigateTo(state.profile ? 'dashboard' : 'profile');
