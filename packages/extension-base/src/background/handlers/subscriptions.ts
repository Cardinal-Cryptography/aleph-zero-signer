// Copyright 2019-2023 @polkadot/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0

// TODO: Delete this file? Or extract the new subscription ways and put it here?

import type createStoreDefinition from '../../utils/localStorageStores/createStoreDefinition';
import type { MessageTypesWithSubscriptions, SubscriptionMessageTypes } from '../types';

type TabId = number
type SubscriptionStore = ReturnType<ReturnType<typeof createStoreDefinition<{ [messageId: string]: TabId }>>>;

// return a subscription callback, that will send the data to the caller
export async function createSubscription<TMessageType extends MessageTypesWithSubscriptions> (messageId: string, tabId: number, subscriptionsStore: SubscriptionStore): Promise<(data: SubscriptionMessageTypes[TMessageType]) => Promise<unknown>> {
  await subscriptionsStore.update((messages) => ({
    ...messages,
    [messageId]: tabId
  }));

  return async (subscription: SubscriptionMessageTypes[TMessageType]): Promise<unknown> => (await subscriptionsStore.get())[messageId]
    ? chrome.tabs.sendMessage(tabId, { id: messageId, subscription })
    : Promise.resolve();
}

// clear a previous subscriber
export async function unsubscribe (messageId: string, subscriptionsStore: SubscriptionStore): Promise<void> {
  await subscriptionsStore.update(({ [messageId]: messageToRemove, ...messages }) => {
    if (messageToRemove) {
      console.log(`Unsubscribing from ${messageId}`);
    } else {
      console.error(`Unable to unsubscribe from ${messageId}`);
    }

    return messages;
  });
}
