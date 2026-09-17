(() => {
  'use strict';

  // Prevent multiple injections
  if (document.getElementById('ig-unfollowers-floating-btn')) {
    return;
  }

  // 1. Create Backdrop
  const backdrop = document.createElement('div');
  backdrop.id = 'ig-unfollowers-backdrop';
  document.body.appendChild(backdrop);

  // 2. Create Drawer Iframe
  const iframe = document.createElement('iframe');
  iframe.id = 'ig-unfollowers-drawer';
  iframe.src = chrome.runtime.getURL('index.html');
  iframe.allow = 'clipboard-write';
  iframe.referrerPolicy = 'no-referrer';
  document.body.appendChild(iframe);

  // 3. Create Floating Trigger Button
  const btn = document.createElement('button');
  btn.id = 'ig-unfollowers-floating-btn';
  btn.title = '¿Quién me dejó de seguir?';
  btn.innerHTML = `
    <svg viewBox="0 0 24 24">
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
      <circle cx="8.5" cy="7" r="4"></circle>
      <line x1="18" y1="8" x2="23" y2="13"></line>
      <line x1="23" y1="8" x2="18" y2="13"></line>
    </svg>
  `;
  document.body.appendChild(btn);

  let isOpen = false;

  const toggleDrawer = (open) => {
    isOpen = typeof open === 'boolean' ? open : !isOpen;
    if (isOpen) {
      iframe.classList.add('open');
      backdrop.classList.add('active');
      btn.style.display = 'none';
    } else {
      iframe.classList.remove('open');
      backdrop.classList.remove('active');
      btn.style.display = 'flex';
    }
  };

  btn.addEventListener('click', () => toggleDrawer());
  backdrop.addEventListener('click', () => toggleDrawer(false));

  // Helper: Read cookie
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop().split(';').shift();
    }
    return null;
  };

  // 4. Message Bridge between Host Page and Angular Iframe
  window.addEventListener('message', async (event) => {
    // Only accept messages from our extension iframe
    if (event.source !== iframe.contentWindow) {
      return;
    }

    const { type, action, requestId, payload } = event.data || {};

    if (type === 'IU_CLOSE_DRAWER') {
      toggleDrawer(false);
      return;
    }

    if (type === 'IU_API_REQUEST') {
      const sendResponse = (success, data, error) => {
        iframe.contentWindow?.postMessage(
          {
            type: 'IU_API_RESPONSE',
            requestId,
            success,
            data,
            error,
          },
          '*'
        );
      };

      try {
        if (action === 'IU_GET_SESSION') {
          const viewerId = getCookie('ds_user_id');
          const csrfToken = getCookie('csrftoken');
          sendResponse(true, { viewerId, csrfToken });
          return;
        }

        if (action === 'IU_FETCH_FRIENDSHIPS') {
          const { kind, maxId, count } = payload;
          const viewerId = getCookie('ds_user_id');
          if (!viewerId) {
            sendResponse(false, null, 'No hay sesión activa en Instagram.');
            return;
          }

          let url = `https://www.instagram.com/api/v1/friendships/${viewerId}/${kind}/?count=${count || 50}`;
          if (maxId) {
            url += `&max_id=${encodeURIComponent(maxId)}`;
          }

          const response = await fetch(url, {
            credentials: 'same-origin',
            headers: {
              'X-IG-App-ID': '936619743392459',
            },
          });

          if (!response.ok) {
            sendResponse(false, null, `HTTP ${response.status}: Error al obtener ${kind}`);
            return;
          }

          const data = await response.json();
          sendResponse(true, data);
          return;
        }

        if (action === 'IU_UNFOLLOW_USER') {
          const { userId } = payload;
          const csrfToken = getCookie('csrftoken');
          if (!csrfToken) {
            sendResponse(false, null, 'Token de seguridad no encontrado (csrftoken).');
            return;
          }

          const url = `https://www.instagram.com/web/friendships/${userId}/unfollow/`;
          const response = await fetch(url, {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
              'content-type': 'application/x-www-form-urlencoded',
              'x-csrftoken': csrfToken,
            },
          });

          sendResponse(response.ok, { success: response.ok });
          return;
        }
      } catch (err) {
        sendResponse(false, null, err.message || 'Error desconocido');
      }
    }
  });

  // 5. Listen to messages from background service worker (e.g. extension icon click)
  chrome.runtime?.onMessage?.addListener((message, _sender, sendResponse) => {
    if (message && message.type === 'TOGGLE_UNFOLLOWERS_DRAWER') {
      toggleDrawer();
      sendResponse({ status: 'ok', isOpen });
    }
  });
})();
