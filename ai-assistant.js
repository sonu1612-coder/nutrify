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
    if (logs && logs.date) {
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

  // Update avatar
  const avatarImg = document.getElementById('header-avatar');
  if (avatarImg) {
    avatarImg.src = profile.gender === 'female'
      ? "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200"
      : "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200";
  }

  // Load chat logs from storage
  let chatHistory = JSON.parse(localStorage.getItem('nutrify_chat')) || [
    { text: "Hi! I'm your Nutrify Guide. I have reviewed your target parameters. How can I help you reach your goals today?", isUser: false }
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

  // Add a temporary loading bubble
  function renderLoadingBubble() {
    const wrapper = document.createElement('div');
    wrapper.id = 'loading-bubble';
    wrapper.className = `flex flex-col items-start max-w-[85%] fade-in`;
    const container = document.createElement('div');
    container.className = `p-4 rounded-2xl bg-white text-on-background border border-outline-variant/20 rounded-tl-none shadow-sm border-l-4 border-l-primary flex items-center gap-1`;
    container.innerHTML = `<div class="w-2 h-2 rounded-full bg-primary animate-bounce"></div><div class="w-2 h-2 rounded-full bg-primary animate-bounce" style="animation-delay: 0.1s"></div><div class="w-2 h-2 rounded-full bg-primary animate-bounce" style="animation-delay: 0.2s"></div>`;
    wrapper.appendChild(container);
    chatWindow.appendChild(wrapper);
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }

  function removeLoadingBubble() {
    const loader = document.getElementById('loading-bubble');
    if (loader) loader.remove();
  }

  async function callNvidiaAssistant(userMessage) {
    // Fetch History Data for Trends
    const historyData = JSON.parse(localStorage.getItem('nutrify_history')) || {};
    
    // Calculate today's consumed macros
    const foodsArray = logs.foods || [];
    const consumedCals = Math.round(foodsArray.reduce((acc, f) => acc + (f.calories || 0), 0));
    const consumedMacros = foodsArray.reduce((acc, f) => {
      acc.protein += f.protein || 0;
      acc.carbs += f.carbs || 0;
      acc.fat += f.fat || 0;
      return acc;
    }, { protein: 0, carbs: 0, fat: 0 });

    // Build System Prompt
    const systemPrompt = `You are Nutrify Guide, an AI friend and professional doctor for the user. 
Customize your guidance based on their profile, goals, and logged data. Analyze their daily, weekly, and monthly data when asked or when relevant. Give specific, practical, and empathetic advice. Keep responses relatively concise but thorough.

User Profile:
- Name: ${profile.name || 'User'}
- Gender: ${profile.gender || 'Not specified'}
- Age: ${profile.age || 'Not specified'}
- Weight: ${profile.weight || 'Not specified'} kg
- Target Calories: ${profile.targets?.calories || 2000} kcal
- Target Macros: Protein ${profile.targets?.macros?.protein || 0}g, Carbs ${profile.targets?.macros?.carbs || 0}g, Fat ${profile.targets?.macros?.fat || 0}g

Today's Data:
- Logged Foods: ${foodsArray.length} items
- Water: ${logs.waterCups || 0} cups
- Calories Consumed Today: ${consumedCals} kcal
- Macros Consumed Today: Protein ${Math.round(consumedMacros.protein)}g, Carbs ${Math.round(consumedMacros.carbs)}g, Fat ${Math.round(consumedMacros.fat)}g

Historical Data Summary (last few days):
${JSON.stringify(historyData).substring(0, 500)} // Providing a summarized view of recent history
`;

    // Map existing chat history to OpenAI format (limit to last 10 messages)
    const messages = [
      { role: "system", content: systemPrompt }
    ];
    
    const recentHistory = chatHistory.slice(-10);
    recentHistory.forEach(msg => {
      // Don't send initial welcome message if it's the only one
      if (recentHistory.length === 1 && !msg.isUser) return;
      messages.push({
        role: msg.isUser ? "user" : "assistant",
        content: msg.text
      });
    });

    try {
      const response = await fetch('/api/chat', {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ messages })
      });

      if (!response.ok) {
        if (response.status === 429) {
          const errorData = await response.json();
          return errorData.error || "You have reached your daily limit of 100 messages. Please try again tomorrow!";
        }
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error("Error calling backend API:", error);
      return "I'm sorry, I'm having trouble connecting to the medical server right now. Please check your internet connection and try again.";
    }
  }

  // Send message action
  async function sendMessage(text) {
    const msg = text || chatInput.value;
    if (!msg.trim()) return;

    renderChatBubble(msg, true);
    chatHistory.push({ text: msg, isUser: true });
    localStorage.setItem('nutrify_chat', JSON.stringify(chatHistory));
    chatInput.value = '';

    renderLoadingBubble();

    const responseText = await callNvidiaAssistant(msg);
    
    removeLoadingBubble();
    
    // Format response (replace markdown newlines with HTML breaks for simple rendering if needed)
    renderChatBubble(responseText, false);
    chatHistory.push({ text: responseText, isUser: false });
    localStorage.setItem('nutrify_chat', JSON.stringify(chatHistory));
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
    alert("Nutrify Guide Alert: Iron deficiency logged this week! Added spinach suggestions to your AI Guide recommendations.");
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
