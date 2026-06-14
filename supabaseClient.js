// Supabase Client Initialization & Local-First Sync
const supabaseUrl = 'https://biwgybdoahycmdsskted.supabase.co';
const supabaseKey = 'sb_publishable_-oUU_urjlm2nlNBDVZ3nJQ_Iu9HdKyb';

if (window.supabase) {
  window.supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
  
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

  // Auto-redirect authenticated users away from landing/login/signup pages
  (async function checkSessionAndRedirect() {
    try {
      const { data: { session } } = await window.supabaseClient.auth.getSession();
      if (session) {
        let profile = localStorage.getItem('nutrify_profile');
        if (!profile) {
          await window.syncWithCloud();
          profile = localStorage.getItem('nutrify_profile');
        }

        const path = window.location.pathname;
        const page = path.substring(path.lastIndexOf('/') + 1) || 'index.html';
        
        if (page === 'index.html' || page === 'login.html' || page === 'signup.html') {
          if (profile) {
            window.location.replace('dashboard.html');
          } else {
            window.location.replace('onboarding.html');
          }
        }
      }
    } catch (e) {
      console.error("Session check/redirect failed:", e);
    }
  })();

} else {
  console.error("Supabase library not loaded. Make sure the CDN script is included.");
}
