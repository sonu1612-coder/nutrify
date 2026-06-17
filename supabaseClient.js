// Supabase Client Initialization & Local-First Sync

async function initSupabase() {
  if (!window.supabase) {
    console.error("Supabase library not loaded. Make sure the CDN script is included.");
    return;
  }

  try {
    const res = await fetch('/api/config');
    const config = await res.json();
    window.supabaseClient = window.supabase.createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);
  } catch (err) {
    console.error("Failed to load Supabase config:", err);
    return;
  }
  // Expose an async sync mechanism
  window.syncWithCloud = async function() {
    const { data: { user } } = await window.supabaseClient.auth.getUser();
    if (!user) return false;

    // Fetch cloud state
    const { data, error } = await window.supabaseClient
      .from('user_sync_state')
      .select('state_json')
      .eq('user_id', user.id)
      .single();

    if (!error && data && data.state_json) {
      // Merge cloud state down to local storage
      const state = data.state_json;
      if (state.profile) localStorage.setItem('nutrify_profile', JSON.stringify(state.profile));
      if (state.logs) localStorage.setItem('nutrify_logs', JSON.stringify(state.logs));
      if (state.chat) localStorage.setItem('nutrify_chat', JSON.stringify(state.chat));
      if (state.history) localStorage.setItem('nutrify_history', JSON.stringify(state.history));
    }
    return true;
  };

  window.pushToCloud = async function() {
    const { data: { user } } = await window.supabaseClient.auth.getUser();
    if (!user) return;

    const state = {
      profile: JSON.parse(localStorage.getItem('nutrify_profile')),
      logs: JSON.parse(localStorage.getItem('nutrify_logs')),
      chat: JSON.parse(localStorage.getItem('nutrify_chat')),
      history: JSON.parse(localStorage.getItem('nutrify_history')),
    };

    await window.supabaseClient
      .from('user_sync_state')
      .upsert({ user_id: user.id, state_json: state, updated_at: new Date().toISOString() });
  };

  // Intercept localStorage.setItem to auto-push (debounced)
  const originalSetItem = localStorage.setItem;
  let syncTimeout = null;
  
  localStorage.setItem = function(key, value) {
    originalSetItem.apply(localStorage, arguments);
    if (key.startsWith('nutrify_')) {
      clearTimeout(syncTimeout);
      syncTimeout = setTimeout(() => {
        window.pushToCloud().catch(err => console.error("Cloud sync failed:", err));
      }, 2000); // Debounce saves by 2 seconds
    }
  };

  // Auto-redirect authenticated or local-bypassed users away from landing/login/signup pages
  (async function checkSessionAndRedirect() {
    try {
      const { data: { session } } = await window.supabaseClient.auth.getSession();
      const localOfflineAccount = localStorage.getItem('nutrify_account');
      
      if (session || localOfflineAccount) {
        let profile = localStorage.getItem('nutrify_profile');
        if (!profile && session) {
          // Only attempt cloud sync if there's a real session
          await window.syncWithCloud();
          profile = localStorage.getItem('nutrify_profile');
        }

        const path = window.location.pathname;
        const page = path.substring(path.lastIndexOf('/') + 1) || 'index.html';
        
        if (page === 'login.html' || page === 'signup.html') {
          if (profile) {
            window.location.replace('dashboard.html');
          } else {
            window.location.replace('onboarding.html');
          }
        } else if (page === 'index.html' || page === '') {
          // Store auth state globally so index.html can redirect after intro video
          window.userAuthState = { loggedIn: true, hasProfile: !!profile };
        }
      }
    } catch (e) {
      console.error("Session check/redirect failed:", e);
    }
  })();

  // --- Multi-Account Offline System ---
  
  window.freezeCurrentAccount = function() {
    const accountStr = localStorage.getItem('nutrify_account');
    if (!accountStr) return;
    try {
      const account = JSON.parse(accountStr);
      if (!account.email) return;
      
      const email = account.email;
      let allAccounts = JSON.parse(localStorage.getItem('nutrify_all_accounts')) || {};
      
      allAccounts[email] = {
        name: account.name,
        email: account.email,
        profile: JSON.parse(localStorage.getItem('nutrify_profile')),
        dbProfile: JSON.parse(localStorage.getItem('nutrify_db_profile')),
        logs: JSON.parse(localStorage.getItem('nutrify_logs')),
        chat: JSON.parse(localStorage.getItem('nutrify_chat')),
        history: JSON.parse(localStorage.getItem('nutrify_history'))
      };
      
      localStorage.setItem('nutrify_all_accounts', JSON.stringify(allAccounts));
    } catch (err) {
      console.error("Failed to freeze account:", err);
    }
  };

  window.thawAccount = function(email) {
    try {
      let allAccounts = JSON.parse(localStorage.getItem('nutrify_all_accounts')) || {};
      if (allAccounts[email]) {
        const acc = allAccounts[email];
        if (acc.profile) localStorage.setItem('nutrify_profile', JSON.stringify(acc.profile));
        if (acc.dbProfile) localStorage.setItem('nutrify_db_profile', JSON.stringify(acc.dbProfile));
        if (acc.logs) localStorage.setItem('nutrify_logs', JSON.stringify(acc.logs));
        if (acc.chat) localStorage.setItem('nutrify_chat', JSON.stringify(acc.chat));
        if (acc.history) localStorage.setItem('nutrify_history', JSON.stringify(acc.history));
        return true;
      }
    } catch (err) {
      console.error("Failed to thaw account:", err);
    }
    return false;
  };

  // Email Validation for disposable/temporary domains
  window.isDisposableEmail = function(email) {
    if (!email) return false;
    const disposableDomains = [
      'tempmail.com', 'guerrillamail.com', 'mailinator.com', 
      '10minutemail.com', 'yopmail.com', 'throwawaymail.com', 
      'temp-mail.org', 'fakemail.net', 'disposablemail.com',
      'tempmailaddress.com', 'tempmail.net', 'temp-mail.io', 
      '10minemail.com', 'trashmail.com', 'tempmail.ninja',
      'maildrop.cc', 'getairmail.com', 'sharklasers.com',
      'tempmail.us', 'tempmail.co.uk', 'tempmail.fr',
      'dispostable.com', 'nada.ltd', 'inbox.lv', '1secmail.com',
      '1secmail.net', '1secmail.org', 'dropmail.me',
      'tempmail.alt.com', 'emailondeck.com', 'mohmal.com', 'crazymail.com'
    ];
    const parts = email.split('@');
    if (parts.length !== 2) return false;
    const domain = parts[1].toLowerCase();
    return disposableDomains.includes(domain);
  };

}

initSupabase();
