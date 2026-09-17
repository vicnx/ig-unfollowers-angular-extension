// Background Service Worker (Manifest V3)

chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id) return;

  if (tab.url && tab.url.includes('instagram.com')) {
    try {
      await chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_UNFOLLOWERS_DRAWER' });
    } catch (e) {
      // If content script is not yet injected or tab reloaded, execute content script
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js'],
      });
      await chrome.scripting.insertCSS({
        target: { tabId: tab.id },
        files: ['content.css'],
      });
      setTimeout(() => {
        chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_UNFOLLOWERS_DRAWER' });
      }, 200);
    }
  } else {
    // Open Instagram in new tab
    chrome.tabs.create({ url: 'https://www.instagram.com/' });
  }
});
