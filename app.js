// Helper script for YOVA FLASH PS4 Web Host UI
import { offsetsFor } from './ps4_offsets.js';

(function () {
  'use strict';

  // Launch Jailbreak Execution with Parameters
  window.launchJailbreak = function (payloadName) {
    const verbose = document.getElementById('optVerbose')?.checked ? '1' : '0';
    const showLog = document.getElementById('optLog')?.checked ? '1' : '1';
    
    let url = 'jb.html?log=' + showLog + '&verbose=' + verbose;
    if (payloadName) {
      url += '&payload=' + encodeURIComponent(payloadName);
    }
    
    window.location.href = url;
  };

  // PS4 Controller (Gamepad API) & Keyboard 'X' button listener
  let gamepadPollId = null;
  let lastXState = false;

  function pollGamepad() {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    for (let i = 0; i < gamepads.length; i++) {
      const gp = gamepads[i];
      if (gp && gp.buttons && gp.buttons[0]) {
        // Button 0 = 'X' (Cross) button on PlayStation Controller / A button
        const isPressed = gp.buttons[0].pressed || gp.buttons[0].value > 0.5;
        if (isPressed && !lastXState) {
          lastXState = true;
          window.launchJailbreak('goldhen');
          return;
        } else if (!isPressed) {
          lastXState = false;
        }
      }
    }
    gamepadPollId = requestAnimationFrame(pollGamepad);
  }

  window.addEventListener('gamepadconnected', function () {
    if (!gamepadPollId) gamepadPollId = requestAnimationFrame(pollGamepad);
  });

  // Start polling immediately in case gamepad is already connected
  if (navigator.getGamepads) {
    gamepadPollId = requestAnimationFrame(pollGamepad);
  }

  // Keyboard shortcut: Pressing 'X', 'Enter', or 'Space' launches GoldHEN
  window.addEventListener('keydown', function (e) {
    if (e.key === 'x' || e.key === 'X' || e.key === 'Enter' || e.key === ' ') {
      window.launchJailbreak('goldhen');
    }
  });

  // AppCache / Offline Status Listener
  const cacheStatusEl = document.getElementById('cacheStatus');
  const cacheBadgeEl = document.getElementById('cacheBadge');
  const progressBarEl = document.getElementById('cacheProgressBar');
  const progressFillEl = document.getElementById('cacheProgressFill');

  if (window.applicationCache) {
    const appCache = window.applicationCache;

    appCache.addEventListener('checking', function () {
      updateCacheUI('Checking cache status...', 'checking');
    });

    appCache.addEventListener('noupdate', function () {
      updateCacheUI('YOVA FLASH Offline Host Ready', 'cached');
    });

    appCache.addEventListener('downloading', function () {
      updateCacheUI('Downloading cache files for offline use...', 'downloading');
      if (progressBarEl) progressBarEl.style.display = 'block';
    });

    appCache.addEventListener('progress', function (e) {
      if (e.lengthComputable && progressFillEl) {
        const pct = Math.round((e.loaded / e.total) * 100);
        progressFillEl.style.width = pct + '%';
        updateCacheUI('Caching YOVA FLASH: ' + pct + '%', 'downloading');
      }
    });

    appCache.addEventListener('cached', function () {
      updateCacheUI('YOVA FLASH Host Cached Successfully!', 'cached');
      if (progressBarEl) progressBarEl.style.display = 'none';
    });

    appCache.addEventListener('updateready', function () {
      updateCacheUI('New Cache Available. Reloading...', 'cached');
      try {
        appCache.swapCache();
      } catch (err) {}
      window.location.reload();
    });

    appCache.addEventListener('error', function () {
      updateCacheUI('YOVA FLASH Ready (Offline Mode)', 'cached');
    });
  }

  function updateCacheUI(msg, state) {
    if (cacheStatusEl) cacheStatusEl.textContent = msg;
    if (cacheBadgeEl) {
      if (state === 'cached') {
        cacheBadgeEl.textContent = 'OFFLINE READY';
        cacheBadgeEl.style.color = 'var(--accent-color)';
      } else if (state === 'downloading') {
        cacheBadgeEl.textContent = 'CACHING...';
        cacheBadgeEl.style.color = 'var(--status-warn)';
      }
    }
  }
})();
