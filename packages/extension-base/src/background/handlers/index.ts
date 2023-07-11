// Copyright 2019-2023 @polkadot/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { MessageTypes, TransportRequestMessage } from '../types';

import Extension from './Extension';
import State from './State';
import Tabs from './Tabs';

const state = new State();

export const extension = new Extension(state);
export const tabs = new Tabs(state);

extension.setupSubscriptions();
tabs.setupSubscriptions();

export default async function handler<TMessageType extends MessageTypes> ({ data, id: messageId, message }: TransportRequestMessage<TMessageType>, sender: chrome.runtime.MessageSender) {
  const from = isSenderExtension(sender)
    ? 'extension popup'
    : sender.tab?.url || sender.url || '<unknown>';
  const source = `${from}: ${message}`;

  console.log(` [in] ${source}`); // :: ${JSON.stringify(request)}`);

  const handlerPromise =
    isSenderTab(sender) && messageId
      ? tabs.handle(message, data, messageId, from, sender.tab.id)
      : isSenderExtension(sender)
        ? extension.handle(message, data)
        : undefined;

  if (!handlerPromise) {
    console.error('The message was not categorized as either an extension message or a tab message.');

    return;
  }

  return handlerPromise
    .then((response) => {
      console.log(`[out] ${source}`); // :: ${JSON.stringify(response)}`);

      return { id: messageId, response };
    })
    .catch((error: Error) => {
      console.log(`[err] ${source}::`, error);

      return { error: error.message, id: messageId };
    });
}

const isSenderTab = (sender: chrome.runtime.MessageSender): sender is chrome.runtime.MessageSender & {
  tab: chrome.tabs.Tab & { id: number }
} => !!sender.tab;

// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/MessageSender#type
const isSenderExtension = (sender: chrome.runtime.MessageSender): sender is chrome.runtime.MessageSender & {
  id: string
} => !!sender.id;
