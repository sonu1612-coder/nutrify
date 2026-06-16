document.addEventListener('DOMContentLoaded', async () => {
  const chatWindow = document.getElementById('support-chat-window');
  const chatForm = document.getElementById('support-form');
  const chatInput = document.getElementById('support-input');
  const sendBtn = document.getElementById('support-send-btn');

  if (!window.supabaseClient) return;

  // Get current user info
  let user = null;
  let profile = JSON.parse(localStorage.getItem('nutrify_profile') || '{}');
  
  try {
    const { data: { session } } = await window.supabaseClient.auth.getSession();
    if (session) {
      user = session.user;
    } else {
      // Fallback for offline mode or unexpected state
      // Provide a dummy UUID for local testing if needed, though they shouldn't reach here without login
      const localAccount = JSON.parse(localStorage.getItem('nutrify_account') || '{}');
      user = { id: localAccount.id || 'local-' + Date.now(), email: localAccount.email || 'local@test.com' };
    }
  } catch(e) {
    console.error(e);
  }

  if (!user || !user.id) {
    chatWindow.innerHTML += `<div class="text-center text-error mt-4">You must be logged in to contact support.</div>`;
    chatInput.disabled = true;
    sendBtn.disabled = true;
    return;
  }

  let allMessages = [];

  async function loadMessages() {
    try {
      const { data, error } = await window.supabaseClient
        .from('support_messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      allMessages = data || [];
      renderMessages();

      // Subscribe to new messages
      window.supabaseClient
        .channel(`public:support_messages:user_id=eq.${user.id}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'support_messages', filter: `user_id=eq.${user.id}` }, payload => {
          // If the message wasn't sent by us just now
          const exists = allMessages.find(m => m.id === payload.new.id);
          if (!exists) {
            allMessages.push(payload.new);
            renderMessages();
          }
        })
        .subscribe();

    } catch (err) {
      console.error(err);
      chatWindow.innerHTML += `<div class="text-center text-error mt-4">Could not connect to support servers.</div>`;
    }
  }

  function renderMessages() {
    // Preserve the initial greeting
    const greeting = `
      <div class="text-center text-sm text-outline my-4">Chat Started</div>
      <div class="flex justify-start">
        <div class="bg-surface-container text-on-surface p-4 rounded-2xl rounded-tl-sm max-w-[80%] shadow-sm">
          <p class="text-body-md">Hi there! 👋 How can we help you with your Nutrify experience today?</p>
        </div>
      </div>
    `;

    if (allMessages.length === 0) {
      chatWindow.innerHTML = greeting;
      return;
    }

    let html = greeting;
    allMessages.forEach(m => {
      const isUser = m.sender === 'user';
      if (isUser) {
        html += `
          <div class="flex justify-end my-3 fade-in group items-center gap-2">
            <button onclick="deleteSupportMessage('${m.id}')" class="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-error hover:bg-error-container hover:text-error rounded-full flex-shrink-0 active:scale-90 cursor-pointer">
              <span class="material-symbols-outlined text-sm">delete</span>
            </button>
            <div class="bg-primary text-black p-4 rounded-2xl rounded-br-sm max-w-[80%] shadow-sm relative">
              <p class="text-body-md">${escapeHtml(m.message)}</p>
              <span class="text-[10px] mt-1.5 block opacity-60 text-right font-medium">${formatTime(new Date(m.created_at))}</span>
            </div>
          </div>
        `;
      } else {
        html += `
          <div class="flex justify-start my-3 fade-in group items-center gap-2">
            <div class="bg-surface-container text-on-surface p-4 rounded-2xl rounded-tl-sm max-w-[80%] shadow-[0_2px_10px_rgba(0,0,0,0.05)] border border-outline-variant/10 relative">
              <p class="text-body-md">${escapeHtml(m.message)}</p>
              <span class="text-[10px] mt-1.5 block text-outline font-medium">${formatTime(new Date(m.created_at))}</span>
            </div>
            <button onclick="deleteSupportMessage('${m.id}')" class="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-error hover:bg-error-container hover:text-error rounded-full flex-shrink-0 active:scale-90 cursor-pointer">
              <span class="material-symbols-outlined text-sm">delete</span>
            </button>
          </div>
        `;
      }
    });

    chatWindow.innerHTML = html;
    scrollToBottom();
  }

  function scrollToBottom() {
    setTimeout(() => {
      chatWindow.scrollTop = chatWindow.scrollHeight;
    }, 50);
  }

  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = chatInput.value.trim();
    if (!text) return;

    // Optimistic UI
    chatInput.value = '';
    
    // Auto-resize reset if we had a multi-line auto-resize logic
    
    const tempId = 'temp-' + Date.now();
    const newMsg = {
      id: tempId,
      user_id: user.id,
      user_name: profile.name || 'Unknown',
      user_email: user.email || '',
      user_photo: profile.avatar || 'https://via.placeholder.com/150',
      sender: 'user',
      message: text,
      created_at: new Date().toISOString()
    };

    allMessages.push(newMsg);
    renderMessages();

    // Send to DB
    const { data, error } = await window.supabaseClient.from('support_messages').insert([{
      user_id: newMsg.user_id,
      user_name: newMsg.user_name,
      user_email: newMsg.user_email,
      user_photo: newMsg.user_photo,
      sender: newMsg.sender,
      message: newMsg.message
    }]).select();

    if (error) {
      console.warn("Supabase insert failed, possibly due to unauthenticated session. Message kept locally.", error);
      // Do not remove the message from the UI, just assign a permanent ID and notify Telegram.
      const msgIndex = allMessages.findIndex(m => m.id === tempId);
      if (msgIndex !== -1) {
        allMessages[msgIndex].id = 'local-msg-' + Date.now();
      }
      notifyTelegramAdmin(newMsg);
      renderMessages();
    } else if (data && data[0]) {
      // replace temp id with real id
      const msgIndex = allMessages.findIndex(m => m.id === tempId);
      if (msgIndex !== -1) {
        allMessages[msgIndex] = data[0];
      }
      
      // Notify Admin via Telegram
      notifyTelegramAdmin(newMsg);
    }
  });

  // Telegram Notification Function
  async function notifyTelegramAdmin(msgObj) {
    const telegramToken = "8620033529:AAGZV4gwu9qabaaaWUk3FLyVa6PLtACigzA";
    const telegramChatId = "5670315898";
    const appUrl = window.location.origin; // e.g. http://127.0.0.1:5500
    
    // Escape markdown special characters if needed, but for simplicity we keep it standard
    const text = `🚨 *New Support Message*\n\n*Name:* ${msgObj.user_name}\n*Email:* ${msgObj.user_email}\n\n*Message:*\n${msgObj.message}\n\n[Open Dashboard to Reply](${appUrl}/admin.html)`;
    
    const url = `https://api.telegram.org/bot${telegramToken}/sendMessage`;
    try {
      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: telegramChatId,
          text: text,
          parse_mode: "Markdown",
          disable_web_page_preview: true
        })
      });
    } catch (err) {
      console.error("Failed to notify telegram", err);
    }
  }

  // Enter to send
  chatInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      chatForm.dispatchEvent(new Event('submit'));
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

  loadMessages();

  window.deleteSupportMessage = async function(id) {
    if (!confirm('Delete this message?')) return;
    
    // Remove locally for instant feedback
    allMessages = allMessages.filter(m => m.id !== id);
    renderMessages();
    
    // Remote DB
    if (user && window.supabaseClient) {
      try {
        await window.supabaseClient.from('support_messages').delete().eq('id', id);
      } catch(e) {
        console.warn("Could not delete from DB", e);
      }
    }
  };

  const clearBtn = document.getElementById('clear-support-chat-btn');
  if (clearBtn) {
    clearBtn.addEventListener('click', async () => {
      if (confirm('Clear entire support chat? This cannot be undone.')) {
        // Clear DB
        if (user && window.supabaseClient) {
          try {
            await window.supabaseClient.from('support_messages').delete().eq('user_id', user.id);
          } catch(e) {
            console.warn("Could not wipe DB", e);
          }
        }
        allMessages = [];
        renderMessages();
      }
    });
  }

});
