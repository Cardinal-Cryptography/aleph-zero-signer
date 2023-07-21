// Copyright 2019-2023 @polkadot/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { PORT_CONTENT, PORT_EXTENSION } from '@polkadot/extension-base/defaults';

const PORTS_NAMES_TO_ALIASES = {
  [PORT_CONTENT]: 'content',
  [PORT_EXTENSION]: 'extension'
} as const;

/**
 * @return Always use the port directly returned from this function to keep the
 * reference up to date - never reassign it.
 */
type GetPort = (portName: 'content' | 'extension') => chrome.runtime.Port
/**
 * @return Always use the port directly returned from this function to keep the
 * reference up to date - never reassign it.
 */
type GetCurrentPort = () => chrome.runtime.Port

export default (cb: (getPort: GetPort, getCurrentPort: GetCurrentPort) => void) => {
  const ports: {
    [key in typeof PORTS_NAMES_TO_ALIASES[keyof typeof PORTS_NAMES_TO_ALIASES]]?: chrome.runtime.Port | undefined
  } = {};

  const isKnownPort = (port: chrome.runtime.Port): port is chrome.runtime.Port & { name: keyof typeof ports } =>
    Object.keys(PORTS_NAMES_TO_ALIASES).includes(port.name);

  const getPort = (portAlias: keyof typeof ports) => {
    const port = ports[portAlias];

    if (!port) {
      throw new Error('Connection with the content script is not open.');
    }

    return port;
  };

  chrome.runtime.onConnect.addListener((port) => {
    // shouldn't happen, however... only listen to what we know about
    if (!isKnownPort(port)) {
      throw new Error(`Unknown connection from ${port.name}`);
    }

    ports[PORTS_NAMES_TO_ALIASES[port.name]] = port;

    /**
     * Not returning "port" directly in order to always return the fresh instance
     * of the port (i.e. with the same name).
     */
    const getCurrentPort = () => getPort(PORTS_NAMES_TO_ALIASES[port.name]);

    cb(getPort, getCurrentPort);
  });
};
