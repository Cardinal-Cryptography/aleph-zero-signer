// Copyright 2019-2023 @polkadot/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { MessageTypes, TransportRequestMessage } from '../types';

import { PORT_EXTENSION } from '../../defaults';
import Extension from './Extension';
import State from './State';
import Tabs from './Tabs';

const state = new State();
const extension = new Extension(state);
const tabs = new Tabs(state);

export default function handler<TMessageType extends MessageTypes> (
  { id: messageId, message, request }: TransportRequestMessage<TMessageType>,
  receivingPort: chrome.runtime.Port | undefined,
  allPorts: {
    contentPort?: chrome.runtime.Port | undefined,
    extensionPort?: chrome.runtime.Port | undefined,
  }
): void {
  const isExtension = !receivingPort || receivingPort?.name === PORT_EXTENSION;

  const sender = receivingPort?.sender as chrome.runtime.MessageSender;

  const from = isExtension
    ? 'extension'
    : (sender.tab && sender.tab.url) || sender.url || '<unknown>';
  const source = `${from}: ${messageId}: ${message}`;

  console.log(` [in] ${source}`); // :: ${JSON.stringify(request)}`);

  const respond = (response: unknown) => {
    receivingPort?.postMessage({ id: messageId, response });
  };

  const promise = isExtension
    ? extension.handle(messageId, message, request, respond, receivingPort, allPorts)
    : tabs.handle(messageId, message, request, respond, from, receivingPort);

  promise
    .catch((error: Error): void => {
      console.log(`[err] ${source}:: ${error.message}`);

      // only send message back to port if it's still connected
      if (receivingPort) {
        receivingPort.postMessage({ error: error.message, id: messageId });
      }
    });
}
