// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').then((registration) => {
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }, (err) => {
      console.log('ServiceWorker registration failed: ', err);
    });
  });
}

let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent the mini-infobar from appearing on mobile
  e.preventDefault();
  // Stash the event so it can be triggered later.
  deferredPrompt = e;
  // Update UI notify the user they can install the PWA
  showInstallPromotion();
});

function showInstallPromotion() {
  if (sessionStorage.getItem('pwa-install-dismissed') === 'true') {
    return; // Dismissed for this session
  }

  // Check if icon already exists
  if (document.getElementById('pwa-install-container')) return;

  const container = document.createElement('div');
  container.id = 'pwa-install-container';
  container.style.position = 'fixed';
  container.style.top = '20px'; // Top right
  container.style.right = '20px';
  container.style.zIndex = '99999';

  // Icon Button
  const iconBtn = document.createElement('button');
  iconBtn.className = 'relative w-12 h-12 rounded-full bg-white text-gray-800 flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95';
  iconBtn.innerHTML = `
    <span class="material-symbols-outlined" style="font-size: 28px;">download</span>
    <span class="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
  `;
  
  // Dropdown Menu
  const menu = document.createElement('div');
  menu.className = 'absolute top-14 right-0 bg-dark-gray border border-primary/30 rounded-xl shadow-2xl p-2 flex flex-col gap-1 w-48 text-white';
  menu.style.transition = 'opacity 0.2s, transform 0.2s';
  menu.style.opacity = '0';
  menu.style.transform = 'translateY(-10px)';
  menu.style.pointerEvents = 'none';

  const installBtn = document.createElement('button');
  installBtn.className = 'w-full text-left px-4 py-2 hover:bg-primary/20 hover:text-primary rounded-lg transition-colors font-semibold text-sm flex items-center gap-2';
  installBtn.innerHTML = '<span class="material-symbols-outlined text-base">download</span> Install';
  
  const removeBtn = document.createElement('button');
  removeBtn.className = 'w-full text-left px-4 py-2 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-colors font-semibold text-sm flex items-center gap-2 text-gray-300';
  removeBtn.innerHTML = '<span class="material-symbols-outlined text-base">close</span> Remove';

  menu.appendChild(installBtn);
  menu.appendChild(removeBtn);
  container.appendChild(iconBtn);
  container.appendChild(menu);
  document.body.appendChild(container);

  let menuOpen = false;

  iconBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    menuOpen = !menuOpen;
    if (menuOpen) {
      menu.style.opacity = '1';
      menu.style.transform = 'translateY(0)';
      menu.style.pointerEvents = 'auto';
    } else {
      menu.style.opacity = '0';
      menu.style.transform = 'translateY(-10px)';
      menu.style.pointerEvents = 'none';
    }
  });

  // Close menu if clicked outside
  document.addEventListener('click', () => {
    if (menuOpen) {
      menuOpen = false;
      menu.style.opacity = '0';
      menu.style.transform = 'translateY(-10px)';
      menu.style.pointerEvents = 'none';
    }
  });

  menu.addEventListener('click', (e) => e.stopPropagation());

  installBtn.addEventListener('click', async () => {
    menu.style.opacity = '0';
    menu.style.pointerEvents = 'none';
    menuOpen = false;
    
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        container.remove();
      }
      deferredPrompt = null;
    }
  });

  removeBtn.addEventListener('click', () => {
    sessionStorage.setItem('pwa-install-dismissed', 'true');
    container.remove();
  });
}

// Ensure the showInstallPromotion works even if beforeinstallprompt fired before the script loaded (sometimes happens)
// In most cases we just rely on the event listener.
