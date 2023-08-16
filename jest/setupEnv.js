// Copyright 2017-2023 @polkadot/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0

const chrome = require('sinon-chrome');

const nodeCrypto = require('crypto');
const { TextDecoder } = require('@polkadot/x-textencoder/node');
const { TextEncoder } = require('@polkadot/x-textencoder/node');

Object.defineProperty(global.self, 'crypto', {
  value: nodeCrypto.webcrypto
});

global.TextDecoder = TextDecoder;
global.TextEncoder = TextEncoder;

global.prompt = jest.fn();

document.execCommand = jest.fn();

chrome.storage.local.get.callsFake(() => ({ splashLastShownMs: Date.now()}))