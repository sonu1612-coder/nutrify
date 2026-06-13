// AI Assistant Controller Logic

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
  }

  // Update avatar
  const avatarImg = document.getElementById('header-avatar');
  if (avatarImg) {
    avatarImg.src = profile.gender === 'female'
      ? "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200"
      : "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200";
  }

  // Load chat logs from storage
  let chatHistory = JSON.parse(localStorage.getItem('nutrify_chat')) || [
    { text: "Hi! I'm your Nutify Guide. I have reviewed your target parameters. How can I help you reach your goals today?", isUser: false }
  ];

  const chatWindow = document.getElementById('chat-window');
  const chatInput = document.getElementById('chat-input');
  const chatSendBtn = document.getElementById('chat-send-btn');
  const clearChatBtn = document.getElementById('clear-chat-btn');

  // Draw chat bubbles
  function renderChatBubble(text, isUser = false) {
    const wrapper = document.createElement('div');
    wrapper.className = `flex flex-col ${isUser ? 'items-end ml-auto' : 'items-start'} max-w-[85%] fade-in`;

    const container = document.createElement('div');
    container.className = `p-4 rounded-2xl ${
      isUser 
        ? 'bg-primary text-white rounded-tr-none shadow-sm' 
        : 'bg-white text-on-background border border-outline-variant/20 rounded-tl-none shadow-sm border-l-4 border-l-primary'
    }`;

    const p = document.createElement('p');
    p.className = 'text-body-md leading-relaxed';
    p.innerText = text;

    container.appendChild(p);

    const timestamp = document.createElement('span');
    timestamp.className = 'text-[10px] text-outline mt-1 px-1';
    timestamp.innerText = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    wrapper.appendChild(container);
    wrapper.appendChild(timestamp);

    chatWindow.appendChild(wrapper);
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }

  // Load full history
  function renderChatHistory() {
    chatWindow.innerHTML = '';
    chatHistory.forEach(msg => {
      renderChatBubble(msg.text, msg.isUser);
    });
  }

  // Send message action
  function sendMessage(text) {
    const msg = text || chatInput.value;
    if (!msg.trim()) return;

    renderChatBubble(msg, true);
    chatHistory.push({ text: msg, isUser: true });
    localStorage.setItem('nutrify_chat', JSON.stringify(chatHistory));
    chatInput.value = '';

    // Simulate AI response
    setTimeout(() => {
      const response = getSmartGuideReply(msg);
      renderChatBubble(response, false);
      chatHistory.push({ text: response, isUser: false });
      localStorage.setItem('nutrify_chat', JSON.stringify(chatHistory));
    }, 1000);
  }

  // Smart reply generator
  function getSmartGuideReply(query) {
    const q = query.toLowerCase();
    const consumedCals = Math.round(logs.foods.reduce((acc, f) => acc + f.calories, 0));
    const targetCals = profile.targets.calories;
    const consumedMacros = logs.foods.reduce((acc, f) => {
      acc.protein += f.protein;
      acc.carbs += f.carbs;
      acc.fat += f.fat;
      return acc;
    }, { protein: 0, carbs: 0, fat: 0 });

    if (q.includes('balance') || q.includes('today') || q.includes('log')) {
      if (logs.foods.length === 0) {
        return "You haven't logged any food yet today! Log your breakfast or lunch so I can evaluate your macronutrient proportions.";
      }
      return `Today you have logged ${logs.foods.length} items, totaling ${consumedCals} kcal (${Math.round((consumedCals/targetCals)*100)}% of your daily ${targetCals} kcal target). 
Your macronutrients logged so far are:
- Protein: ${Math.round(consumedMacros.protein)}g (Target: ${profile.targets.macros.protein}g)
- Carbohydrates: ${Math.round(consumedMacros.carbs)}g (Target: ${profile.targets.macros.carbs}g)
- Fats: ${Math.round(consumedMacros.fat)}g (Target: ${profile.targets.macros.fat}g)

${consumedMacros.protein < 40 ? "Tip: You are currently low on protein today. Try adding eggs, Greek yogurt, or lean chicken breast." : "Great job keeping up with your nutrient balance!"}`;
    }

    if (q.includes('snack') || q.includes('recipe') || q.includes('eat')) {
      return "Here are a few high-protein, calorie-friendly options based on your goals:\n1. Greek Yogurt (150g) with 50g blueberries (approx. 180 kcal, 15g Protein).\n2. Rice cake with 1 tbsp smooth peanut butter and sliced banana (approx. 200 kcal).\n3. Handful of almonds (20g) and one hard-boiled egg (approx. 200 kcal).";
    }

    if (q.includes('hydration') || q.includes('water')) {
      return `You have logged ${logs.waterCups} cups of water today (${(logs.waterCups * 0.25).toFixed(2)}L). Staying hydrated is crucial for maintaining metabolic efficiency and muscle function. Aim for at least 8 cups (2.0L) daily!`;
    }

    if (q.includes('trend') || q.includes('vitamin') || q.includes('history')) {
      return "Looking at your last 7 days of historical logs, your daily calorie consistency is at 85%. You're doing excellent! However, fiber and iron levels tend to dip slightly on weekends. I recommend adding a cup of spinach or kale to Saturday's meals.";
    }

    return "I can help you audit your calorie targets, recommend high-protein foods, or check your hydration status. Let me know what you need!";
  }

  // Clear chat
  clearChatBtn.addEventListener('click', () => {
    if (confirm('Clear chat history?')) {
      chatHistory = [{ text: "Hi! Guide is online. Ask me anything about your nutrition goals.", isUser: false }];
      localStorage.setItem('nutrify_chat', JSON.stringify(chatHistory));
      renderChatHistory();
    }
  });

  // Bind input handlers
  chatSendBtn.addEventListener('click', () => sendMessage());
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
  });

  // Wire suggestion chips
  document.querySelectorAll('.suggest-chip').forEach(chip => {
    chip.addEventListener('click', (e) => {
      sendMessage(e.target.innerText.trim());
    });
  });

  renderChatHistory();

  // Notification button action
  document.getElementById('noti-btn').addEventListener('click', () => {
    alert("Nutify Guide Alert: Iron deficiency logged this week! Added spinach suggestions to your AI Guide recommendations.");
  });

  // Ripple click effect
  document.addEventListener('click', (e) => {
    const target = e.target.closest('button, a, .suggest-chip');
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
