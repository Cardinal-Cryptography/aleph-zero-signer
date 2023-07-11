// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type {
  AllowedPath,
  ConnectedTabsUrlResponse,
  MessageTypes,
  MessageTypesWithNoSubscriptions,
  MessageTypesWithNullRequest,
  RequestTypes,
  ResponseAuthorizeList,
  ResponseDeriveValidate,
  ResponseJsonGetAccountInfo,
  ResponseSigningIsLocked,
  ResponseTypes,
  SeedLengths,
} from '@polkadot/extension-base/background/types';
import type { Chain } from '@polkadot/extension-chains/types';
import type { KeyringPair$Json } from '@polkadot/keyring/types';
import type { KeyringPairs$Json } from '@polkadot/ui-keyring/types';
import type { HexString } from '@polkadot/util/types';
import type { KeypairType } from '@polkadot/util-crypto/types';

import { v4 as uuid } from 'uuid';

import { PORT_EXTENSION } from '@polkadot/extension-base/defaults';
import { metadataExpand } from '@polkadot/extension-chains';
import { MetadataDef } from '@polkadot/extension-inject/types';

import allChains from './util/chains';
import { getSavedMeta, setSavedMeta } from './MetadataCache';

function sendMessage<TMessageType extends MessageTypesWithNullRequest>(
  message: TMessageType
): Promise<ResponseTypes[TMessageType]>;
function sendMessage<TMessageType extends MessageTypesWithNoSubscriptions>(
  message: TMessageType,
  data: RequestTypes[TMessageType]
): Promise<ResponseTypes[TMessageType]>;
async function sendMessage<TMessageType extends MessageTypes>(
  message: TMessageType,
  data?: RequestTypes[TMessageType],
): Promise<ResponseTypes[TMessageType]> {
  const { response } = await chrome.runtime.sendMessage({ id: uuid(), message, data });

  return response as ResponseTypes[TMessageType];
}

export async function editAccount(address: string, name: string): Promise<boolean> {
  return sendMessage('pri(accounts.edit)', { address, name });
}

export function changePassword(address: string, oldPass: string, newPass: string): Promise<boolean> {
  return sendMessage('pri(accounts.changePassword)', { address, oldPass, newPass });
}

export async function showAccount(address: string, isShowing: boolean): Promise<boolean> {
  return sendMessage('pri(accounts.show)', { address, isShowing });
}

export async function tieAccount(address: string, genesisHash: string | null): Promise<boolean> {
  return sendMessage('pri(accounts.tie)', { address, genesisHash });
}

export async function exportAccount(address: string, password: string): Promise<{ exportedJson: KeyringPair$Json }> {
  return sendMessage('pri(accounts.export)', { address, password });
}

export async function validateAccount(address: string, password: string): Promise<boolean> {
  return sendMessage('pri(accounts.validate)', { address, password });
}

export async function forgetAccount(address: string): Promise<boolean> {
  return sendMessage('pri(accounts.forget)', { address });
}

export async function approveAuthRequest(id: string, authorizedAccounts: string[]): Promise<boolean> {
  return sendMessage('pri(authorize.approve)', { authorizedAccounts, id });
}

export async function rejectAuthRequest(id: string): Promise<boolean> {
  return sendMessage('pri(authorize.reject)', { id });
}

export async function approveMetaRequest(id: string): Promise<boolean> {
  return sendMessage('pri(metadata.approve)', { id });
}

export async function cancelSignRequest(id: string): Promise<boolean> {
  return sendMessage('pri(signing.cancel)', { id });
}

export async function isSignLocked(id: string): Promise<ResponseSigningIsLocked> {
  return sendMessage('pri(signing.isLocked)', { id });
}

export async function approveSignPassword(id: string, savePass: boolean, password?: string): Promise<boolean> {
  return sendMessage('pri(signing.approve.password)', { id, password, savePass });
}

export async function approveSignSignature(id: string, signature: HexString): Promise<boolean> {
  return sendMessage('pri(signing.approve.signature)', { id, signature });
}

export async function createAccountHardware(
  address: string,
  hardwareType: string,
  accountIndex: number,
  addressOffset: number,
  name: string,
  genesisHash: string
): Promise<boolean> {
  return sendMessage('pri(accounts.create.hardware)', {
    accountIndex,
    address,
    addressOffset,
    genesisHash,
    hardwareType,
    name
  });
}

export async function createAccountSuri(
  name: string,
  password: string,
  suri: string,
  type?: KeypairType,
  genesisHash?: string
): Promise<boolean> {
  return sendMessage('pri(accounts.create.suri)', { genesisHash, name, password, suri, type });
}

export async function createSeed(
  length?: SeedLengths,
  seed?: string,
  type?: KeypairType
): Promise<{ address: string; seed: string }> {
  return sendMessage('pri(seed.create)', { length, seed, type });
}

export async function getAllMetadata(): Promise<MetadataDef[]> {
  return sendMessage('pri(metadata.list)');
}

export async function getMetadata(genesisHash?: string | null, isPartial = false): Promise<Chain | null> {
  if (!genesisHash) {
    return null;
  }

  let request = getSavedMeta(genesisHash);

  if (!request) {
    request = sendMessage('pri(metadata.get)', genesisHash || null);
    setSavedMeta(genesisHash, request);
  }

  const def = await request;

  if (def) {
    return metadataExpand(def, isPartial);
  } else if (isPartial) {
    const chain = allChains.find((chain) => chain.genesisHash === genesisHash);

    if (chain) {
      return metadataExpand(
        {
          ...chain,
          specVersion: 0,
          tokenDecimals: 15,
          tokenSymbol: 'Unit',
          types: {}
        },
        isPartial
      );
    }
  }

  return null;
}

export async function getConnectedTabsUrl(): Promise<ConnectedTabsUrlResponse> {
  return sendMessage('pri(connectedTabsUrl.get)', null);
}

export async function rejectMetaRequest(id: string): Promise<boolean> {
  return sendMessage('pri(metadata.reject)', { id });
}

export async function getAuthList(): Promise<ResponseAuthorizeList> {
  return sendMessage('pri(authorize.list)');
}

export async function removeAuthorization(url: string): Promise<ResponseAuthorizeList> {
  return sendMessage('pri(authorize.remove)', url);
}

export async function updateAuthorization(authorizedAccounts: string[], url: string): Promise<void> {
  return sendMessage('pri(authorize.update)', { authorizedAccounts, url });
}

export async function updateAuthorizationDate(url: string): Promise<void> {
  return sendMessage('pri(authorizeDate.update)', url);
}

export async function deleteAuthRequest(requestId: string): Promise<void> {
  return sendMessage('pri(authorize.delete.request)', requestId);
}

export async function validateSeed(suri: string, type?: KeypairType): Promise<{ address: string; suri: string }> {
  return sendMessage('pri(seed.validate)', { suri, type });
}

export async function validateDerivationPath(
  parentAddress: string,
  suri: string,
  parentPassword: string
): Promise<ResponseDeriveValidate> {
  return sendMessage('pri(derivation.validate)', { parentAddress, parentPassword, suri });
}

export async function deriveAccount(
  parentAddress: string,
  suri: string,
  parentPassword: string,
  name: string,
  password: string,
  genesisHash: string | null
): Promise<boolean> {
  return sendMessage('pri(derivation.create)', { genesisHash, name, parentAddress, parentPassword, password, suri });
}

export async function windowOpen(path: AllowedPath): Promise<boolean> {
  return sendMessage('pri(window.open)', path);
}

export async function jsonGetAccountInfo(json: KeyringPair$Json): Promise<ResponseJsonGetAccountInfo> {
  return sendMessage('pri(json.account.info)', json);
}

export async function jsonRestore(
  file: KeyringPair$Json,
  password: string,
  skipAuthenticityCheck?: boolean
): Promise<void> {
  return sendMessage('pri(json.restore)', { file, password, skipAuthenticityCheck });
}

export async function batchRestore(
  file: KeyringPairs$Json,
  password: string,
  skipAuthenticityCheck?: boolean
): Promise<void> {
  return sendMessage('pri(json.batchRestore)', { file, password, skipAuthenticityCheck });
}

export async function setNotification(notification: string): Promise<boolean> {
  return sendMessage('pri(settings.notification)', notification);
}

export const sendPopupReadyMessage = () => {
  // Establishing a port connection for the background service worker to detect that popup is opened
  chrome.runtime.connect({ name: PORT_EXTENSION });
};

const subscribers: { [message in keyof ResponseTypes]?: Set<((data: ResponseTypes[message]) => void)> } = {};

const handleIncomingMessage = <Message extends keyof typeof subscribers>(
  message: { message: Message, data: ResponseTypes[Message]},
  sender: chrome.runtime.MessageSender,
) => {
  console.log('Message:', message, 'received from sender:', sender);

  subscribers[message.message]?.forEach((listener) => listener(message.data));
};

const createSubscriber = <Message extends keyof typeof subscribers>(message: Message) => (cb: (data: ResponseTypes[Message]) => void) => {
  if (!subscribers[message]) {
    subscribers[message] = new Set() as typeof subscribers[typeof message];
  }

  subscribers[message]?.add(cb);

  return () => subscribers[message]?.delete(cb);
};

export const subscribeAccounts = createSubscriber('pri(accounts.changed)');

export const subscribeAuthorizeRequests = createSubscriber('pri(authorize.requests.changed)');

export const subscribeMetadataRequests = createSubscriber('pri(metadata.requests.changed)');

export const subscribeSigningRequests = createSubscriber('pri(signing.requests.changed)');

chrome.runtime.onMessage.addListener(handleIncomingMessage);
