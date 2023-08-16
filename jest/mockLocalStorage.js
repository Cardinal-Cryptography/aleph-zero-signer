import chrome from 'sinon-chrome';

chrome.storage.local.get.callsFake(() => ({ splashLastShownMs: Date.now()}))
globalThis.chrome = chrome;
