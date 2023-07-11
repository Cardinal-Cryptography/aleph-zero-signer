// Copyright 2019-2023 @polkadot/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0

// Runs in the extension background, handling all keyring access

import '@polkadot/extension-inject/crossenv';

import handleMessage, * as handlers from '@polkadot/extension-base/background/handlers';
import { withErrorLog } from '@polkadot/extension-base/background/handlers/helpers';
import { AccountsStore } from '@polkadot/extension-base/stores';
import keyring from '@polkadot/ui-keyring';
import { cryptoWaitReady } from '@polkadot/util-crypto';

// setup the notification (same a FF default background, white text)
withErrorLog(() => chrome.action.setBadgeBackgroundColor({ color: '#d90000' }));

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Message:', message, 'received from sender:', sender);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  handleMessage(message, sender)
    .then(sendResponse)
    .catch((e) =>
      console.log('Error:', e, 'while handling message:', message, 'received from sender:', sender)
    );

  return true;
});

function getActiveTabs () {
  // queriing the current active tab in the current window should only ever return 1 tab
  // although an array is specified here
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    // get the urls of the active tabs. In the case of new tab the url may be empty or undefined
    // we filter these out
    const urls: string[] = tabs
      .map(({ url }) => url)
      .filter((url) => !!url) as string[];

    handlers.extension.handle('pri(activeTabsUrl.update)', { urls }).catch((e) => {
      console.error('Error handling active tabs:', e);
    });
  });
}

// listen to tab updates this is fired on url change
chrome.tabs.onUpdated.addListener((_, changeInfo) => {
  // we are only interested in url change
  if (!changeInfo.url) {
    return;
  }

  getActiveTabs();
});

// the list of active tab changes when switching window
// in a mutli window setup
chrome.windows.onFocusChanged.addListener(() =>
  getActiveTabs()
);

// when clicking on an existing tab or opening a new tab this will be fired
// before the url is entered by users
chrome.tabs.onActivated.addListener(() => {
  getActiveTabs();
});

// when deleting a tab this will be fired
chrome.tabs.onRemoved.addListener(() => {
  getActiveTabs();
});

// initial setup
cryptoWaitReady()
  .then((): void => {
    console.log('crypto initialized');

    // load all the keyring data
    keyring.loadAll({ store: new AccountsStore(), type: 'sr25519' });

    console.log('initialization completed');
  })
  .catch((error): void => {
    console.error('initialization failed', error);
  });
