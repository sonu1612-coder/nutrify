document.addEventListener('DOMContentLoaded', () => {
  const userListEl = document.getElementById('user-list');
  const chatMessagesEl = document.getElementById('chat-messages');
  const chatForm = document.getElementById('admin-chat-form');
  const chatInput = document.getElementById('admin-chat-input');
  const sendBtn = document.getElementById('admin-send-btn');
  const broadcastBtn = document.getElementById('broadcast-btn');
  const chatHeaderInfo = document.getElementById('chat-header-info');

  let allMessages = [];
  let usersMap = {};
  let selectedUserId = null; // UUID or 'broadcast'

  if (!window.supabaseClient) {
    alert("Supabase client not loaded.");
    return;
  }

  // 1. Initial Fetch
  async function fetchAllMessages() {
    try {
      const { data, error } = await window.supabaseClient
        .from('support_messages')
        .select('*')
        .order('created_at', { ascending: true });
        
      if (error) {
        console.error("Fetch error:", error);
        userListEl.innerHTML = `<div class="p-4 text-error text-sm text-center">Failed to load messages.<br>Did you create the table?</div>`;
        return;
      }
      
      allMessages = data || [];
      processMessagesToUsersMap();
      renderUserList();
      
      // Auto-select broadcast on load
      selectUser('broadcast');
      
      // Setup Realtime Subscription
      window.supabaseClient
        .channel('public:support_messages')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'support_messages' }, payload => {
          allMessages.push(payload.new);
          processSingleMessage(payload.new);
          renderUserList();
          if (selectedUserId === payload.new.user_id || selectedUserId === 'broadcast') {
            renderMessages();
          }
        })
        .subscribe();
        
    } catch (err) {
      console.error(err);
    }
  }

  function processSingleMessage(msg) {
    if (!msg.user_id) return;
    if (!usersMap[msg.user_id]) {
      usersMap[msg.user_id] = {
        id: msg.user_id,
        name: msg.user_name || 'Anonymous User',
        email: msg.user_email || 'No email provided',
        photo: msg.user_photo || 'https://via.placeholder.com/150',
        lastMessage: msg.message,
        time: new Date(msg.created_at)
      };
    } else {
      usersMap[msg.user_id].lastMessage = msg.message;
      usersMap[msg.user_id].time = new Date(msg.created_at);
      // Update info if it was missing
      if (msg.user_name) usersMap[msg.user_id].name = msg.user_name;
      if (msg.user_email) usersMap[msg.user_id].email = msg.user_email;
      if (msg.user_photo) usersMap[msg.user_id].photo = msg.user_photo;
    }
  }

  function processMessagesToUsersMap() {
    usersMap = {};
    allMessages.forEach(processSingleMessage);
  }

  // 2. Render User List
  function renderUserList() {
    const users = Object.values(usersMap).sort((a, b) => b.time - a.time);
    
    if (users.length === 0) {
      userListEl.innerHTML = `<div class="p-4 text-gray-500 text-sm text-center">No users found.</div>`;
      return;
    }

    userListEl.innerHTML = users.map(u => `
      <div onclick="window.selectUser('${u.id}')" class="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${selectedUserId === u.id ? 'bg-[#222] border-l-2 border-primary' : 'hover:bg-[#111] border-l-2 border-transparent'}">
        <img src="${u.photo}" onerror="this.src='https://via.placeholder.com/150'" class="w-10 h-10 rounded-full object-cover bg-black flex-shrink-0">
        <div class="overflow-hidden">
          <div class="flex justify-between items-baseline mb-0.5">
            <h4 class="text-sm font-bold text-white truncate">${u.name}</h4>
            <span class="text-[10px] text-gray-500 flex-shrink-0 ml-2">${formatTime(u.time)}</span>
          </div>
          <p class="text-xs text-gray-400 truncate">${u.lastMessage}</p>
        </div>
      </div>
    `).join('');
  }

  // 3. Selection Logic
  window.selectUser = function(id) {
    selectedUserId = id;
    
    // Update Header
    if (id === 'broadcast') {
      chatHeaderInfo.innerHTML = `
        <div class="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary material-symbols-outlined">campaign</div>
        <div>
          <h3 class="text-white font-bold text-lg leading-tight">Broadcast Mode</h3>
          <p class="text-xs text-primary">Message will be sent to all ${Object.keys(usersMap).length} users</p>
        </div>
      `;
    } else {
      const u = usersMap[id];
      if (u) {
        chatHeaderInfo.innerHTML = `
          <img src="${u.photo}" onerror="this.src='https://via.placeholder.com/150'" class="w-10 h-10 rounded-full object-cover">
          <div>
            <h3 class="text-white font-bold text-lg leading-tight">${u.name}</h3>
            <p class="text-xs text-gray-500">${u.email}</p>
          </div>
        `;
      }
    }

    renderUserList(); // update active state
    renderMessages();
    
    // Enable input
    chatInput.disabled = false;
    sendBtn.disabled = false;
    chatInput.focus();
  };

  broadcastBtn.addEventListener('click', () => window.selectUser('broadcast'));

  // 4. Render Messages
  function renderMessages() {
    let displayMsgs = [];
    
    if (selectedUserId === 'broadcast') {
      // Show all broadcast messages sent by admin? Or just empty state?
      // Since broadcasts are sent individually to each user, maybe we just show a log of admin's broadcasts.
      // For MVP, broadcast mode shows empty or a list of past broadcasts?
      chatMessagesEl.innerHTML = `
        <div class="h-full flex flex-col items-center justify-center text-primary/50 text-center px-4">
          <span class="material-symbols-outlined text-6xl mb-4 opacity-50">campaign</span>
          <p class="text-lg font-bold text-white">Broadcast to All Users</p>
          <p class="text-sm mt-2 max-w-md">Type a message below and hit send. It will be delivered directly to the support chat of every user in the system.</p>
        </div>
      `;
      return;
    } else {
      displayMsgs = allMessages.filter(m => m.user_id === selectedUserId);
    }

    if (displayMsgs.length === 0) {
      chatMessagesEl.innerHTML = `<div class="text-center text-gray-500 mt-10">No messages yet.</div>`;
      return;
    }

    chatMessagesEl.innerHTML = displayMsgs.map(m => {
      const isAdmin = m.sender === 'admin';
      return `
        <div class="flex ${isAdmin ? 'justify-end' : 'justify-start'}">
          <div class="max-w-[75%] rounded-2xl px-4 py-3 ${isAdmin ? 'bg-primary text-black rounded-br-sm' : 'bg-[#1a1a1a] text-white border border-[#333] rounded-bl-sm'}">
            <p class="text-sm">${escapeHtml(m.message)}</p>
            <span class="text-[10px] mt-1.5 block opacity-60 text-right font-medium">${formatTime(new Date(m.created_at))}</span>
          </div>
        </div>
      `;
    }).join('');

    chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
  }

  // 5. Send Message
  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = chatInput.value.trim();
    if (!text) return;

    chatInput.value = '';
    chatInput.focus();

    if (selectedUserId === 'broadcast') {
      // Send to all users
      const userIds = Object.keys(usersMap);
      if (userIds.length === 0) {
        alert("No users to broadcast to.");
        return;
      }
      
      sendBtn.disabled = true;
      const inserts = userIds.map(uid => ({
        user_id: uid,
        sender: 'admin',
        message: text,
      }));

      const { error } = await window.supabaseClient.from('support_messages').insert(inserts);
      sendBtn.disabled = false;
      
      if (error) {
        alert("Failed to broadcast: " + error.message);
      } else {
        // Visual feedback
        chatInput.placeholder = "Broadcast sent successfully!";
        setTimeout(() => chatInput.placeholder = "Type a message...", 3000);
      }

    } else {
      // Send to single user
      const u = usersMap[selectedUserId];
      if (!u) return;

      const newMsg = {
        user_id: selectedUserId,
        user_name: u.name,
        user_email: u.email,
        user_photo: u.photo,
        sender: 'admin',
        message: text
      };

      // Optimistic UI update could be added here, but relying on realtime sync is safer
      const { error } = await window.supabaseClient.from('support_messages').insert([newMsg]);
      if (error) {
        alert("Failed to send: " + error.message);
      }
    }
  });

  // Utils
  function formatTime(date) {
    if (!(date instanceof Date) || isNaN(date)) return '';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function escapeHtml(unsafe) {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
  }

  // Allow enter to submit textarea
  chatInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      chatForm.dispatchEvent(new Event('submit'));
    }
  });

  fetchAllMessages();
});
