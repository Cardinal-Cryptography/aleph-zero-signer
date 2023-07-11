// Copyright 2019-2023 @polkadot/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { InjectedAccount, InjectedMetadataKnown, MetadataDef } from '@polkadot/extension-inject/types';
import type { KeyringPair } from '@polkadot/keyring/types';
import type { SignerPayloadJSON, SignerPayloadRaw } from '@polkadot/types/types';
import type { SubjectInfo } from '@polkadot/ui-keyring/observable/types';
import type { MessageTypes, RequestAccountList, RequestAccountUnsubscribe, RequestAuthorizeTab, RequestTypes, ResponseSigning, ResponseTypes } from '../types';

import { PHISHING_PAGE_REDIRECT } from '@polkadot/extension-base/defaults';
import { canDerive, localStorageStores } from '@polkadot/extension-base/utils';
import { checkIfDenied } from '@polkadot/phishing';
import keyring from '@polkadot/ui-keyring';
import { accounts as accountsObservable } from '@polkadot/ui-keyring/observable/accounts';
import { assert, isNumber } from '@polkadot/util';

import RequestBytesSign from '../RequestBytesSign';
import RequestExtrinsicSign from '../RequestExtrinsicSign';
import { withErrorLog } from './helpers';
import State, { AuthResponse } from './State';

function transformAccounts (accounts: SubjectInfo, anyType = false): InjectedAccount[] {
  return Object
    .values(accounts)
    .filter(({ json: { meta: { isHidden } } }) => !isHidden)
    .filter(({ type }) => anyType ? true : canDerive(type))
    .sort((a, b) => (a.json.meta.whenCreated || 0) - (b.json.meta.whenCreated || 0))
    .map(({ json: { address, meta: { genesisHash, name } }, type }): InjectedAccount => ({
      address,
      genesisHash,
      name,
      type
    }));
}

export default class Tabs {
  readonly #state: State;

  constructor (state: State) {
    this.#state = state;
  }

  public setupSubscriptions () {
    accountsObservable.subject.subscribe((accounts: SubjectInfo): void => {
      const transformedAccounts = transformAccounts(accounts);

      localStorageStores.accountsAuthorizedSubscribingTabs.get()
        .then((subscribingTabs) => Object.entries(subscribingTabs))
        .then((subscribingTabsEntries) =>
          Promise.all(subscribingTabsEntries.map(([tabId, { messageId, url }]) =>
            this.filterForAuthorizedAccounts(transformedAccounts, url)
              .then((accounts) =>
                chrome.tabs.sendMessage(Number(tabId), { id: messageId, subscription: accounts })
              )
          ))
        )
        .catch((e) => {
          console.error('Error handling authorized accounts subscription:', e);
        });
    });

    chrome.tabs.onRemoved.addListener((removedTabId) => {
      localStorageStores.accountsAuthorizedSubscribingTabs.update(({ [removedTabId]: messageToRemove, ...tabs }) => {
        if (messageToRemove) {
          console.log(`Removing the ${removedTabId} tab from the list of authorized accounts listeners.`);
        } else {
          console.error(`No ${removedTabId} tab on the list of authorized accounts listeners.`);
        }

        return tabs;
      }).catch((e) => console.error('Error unsubscribing from subscription:', e));
    });
  }

  private async filterForAuthorizedAccounts (accounts: InjectedAccount[], url: string): Promise<InjectedAccount[]> {
    const auth = (await this.#state.getAuthUrls())[new URL(url).origin];

    return accounts.filter(
      (allAcc) =>
        auth.authorizedAccounts
          // we have a list, use it
          ? auth.authorizedAccounts.includes(allAcc.address)
          // if no authorizedAccounts and isAllowed return all - these are old converted urls
          : auth.isAllowed
    );
  }

  private authorize (url: string, request: RequestAuthorizeTab): Promise<AuthResponse> {
    return this.#state.authorizeUrl(url, request);
  }

  private accountsListAuthorized (url: string, { anyType }: RequestAccountList): Promise<InjectedAccount[]> {
    const transformedAccounts = transformAccounts(accountsObservable.subject.getValue(), anyType);

    return this.filterForAuthorizedAccounts(transformedAccounts, url);
  }

  private async accountsSubscribeAuthorized (url: string, messageId: string, tabId: number): Promise<number> {
    await localStorageStores.accountsAuthorizedSubscribingTabs.update((subscribingTabs) => ({
      ...subscribingTabs,
      [tabId]: {
        url,
        messageId
      }
    }));

    return tabId;
  }

  private async accountsUnsubscribe (url: string, { id: tabIdToRemove }: RequestAccountUnsubscribe): Promise<void> {
    await localStorageStores.accountsAuthorizedSubscribingTabs.update((allSubs) => {
      const { [tabIdToRemove]: subToRemove, ...otherSubs } = allSubs;

      if (subToRemove) {
        console.log(`Removing the ${tabIdToRemove} tab from the list of authorized accounts listeners.`);
      } else {
        console.error(`No ${tabIdToRemove} tab on the list of authorized accounts listeners.`);
      }

      if (subToRemove.url !== url) {
        console.log(`The request tab url ("${url}") does not match the url registered in the subscription ("${subToRemove.url}").`);

        return allSubs;
      }

      return otherSubs;
    }).catch((e) => console.error('Error unsubscribing from subscription:', e));
  }

  private getSigningPair (address: string): KeyringPair {
    const pair = keyring.getPair(address);

    assert(pair, 'Unable to find keypair');

    return pair;
  }

  private bytesSign (url: string, request: SignerPayloadRaw): Promise<ResponseSigning> {
    const address = request.address;
    const pair = this.getSigningPair(address);

    return this.#state.sign(url, new RequestBytesSign(request), { address, ...pair.meta });
  }

  private extrinsicSign (url: string, request: SignerPayloadJSON): Promise<ResponseSigning> {
    const address = request.address;
    const pair = this.getSigningPair(address);

    return this.#state.sign(url, new RequestExtrinsicSign(request), { address, ...pair.meta });
  }

  private metadataProvide (url: string, request: MetadataDef): Promise<boolean> {
    return this.#state.injectMetadata(url, request);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async metadataList (url: string): Promise<InjectedMetadataKnown[]> {
    return (await this.#state.getKnownMetadata()).map(({ genesisHash, specVersion }) => ({
      genesisHash,
      specVersion
    }));
  }
  //
  // private rpcListProviders (): Promise<ResponseRpcListProviders> {
  //   return this.#state.rpcListProviders();
  // }
  //
  // private rpcSend (request: RequestRpcSend): Promise<JsonRpcResponse> {
  //   return this.#state.rpcSend(request, port);
  // }
  //
  // private rpcStartProvider (key: string): Promise<ProviderMeta> {
  //   throw new Error('Not used?');
  //
  //   return this.#state.rpcStartProvider(key, port);
  // }
  //
  // private async rpcSubscribe (request: RequestRpcSubscribe, id: string): Promise<boolean> {
  //   throw new Error('Not used?');
  //   const innerCb = createSubscription<'pub(rpc.subscribe)'>(id, port);
  //   const cb = (_error: Error | null, data: SubscriptionMessageTypes['pub(rpc.subscribe)']): void => innerCb(data);
  //   const subscriptionId = await this.#state.rpcSubscribe(request, cb, port);
  //
  //   port.onDisconnect.addListener((): void => {
  //     unsubscribe(id);
  //     withErrorLog(() => this.rpcUnsubscribe({ ...request, subscriptionId }, port));
  //   });
  //
  //   return true;
  // }
  //
  // private rpcSubscribeConnected (request: null, id: string): Promise<boolean> {
  //   throw new Error('Not used?');
  //   const innerCb = createSubscription<'pub(rpc.subscribeConnected)'>(id, port);
  //   const cb = (_error: Error | null, data: SubscriptionMessageTypes['pub(rpc.subscribeConnected)']): void => innerCb(data);
  //
  //   this.#state.rpcSubscribeConnected(request, cb, port);
  //
  //   port.onDisconnect.addListener((): void => {
  //     unsubscribe(id);
  //   });
  //
  //   return Promise.resolve(true);
  // }
  //
  // private async rpcUnsubscribe (request: RequestRpcUnsubscribe): Promise<boolean> {
  //   throw new Error('Not used?');
  //
  //   return this.#state.rpcUnsubscribe(request, port);
  // }

  private redirectPhishingLanding (phishingWebsite: string): void {
    const nonFragment = phishingWebsite.split('#')[0];
    const encodedWebsite = encodeURIComponent(nonFragment);
    const url = `${chrome.runtime.getURL('external.html')}#${PHISHING_PAGE_REDIRECT}/${encodedWebsite}`;

    chrome.tabs.query({ url: nonFragment }, (tabs) => {
      tabs
        .map(({ id }) => id)
        .filter((id): id is number => isNumber(id))
        .forEach((id) =>
          withErrorLog(() => chrome.tabs.update(id, { url }))
        );
    });
  }

  private async redirectIfPhishing (url: string): Promise<boolean> {
    const isInDenyList = await checkIfDenied(url);

    if (isInDenyList) {
      this.redirectPhishingLanding(url);

      return true;
    }

    return false;
  }

  public async handle<TMessageType extends MessageTypes> (type: TMessageType, request: RequestTypes[TMessageType], messageId: string, url: string, tabId: number): Promise<ResponseTypes[keyof ResponseTypes]> {
    if (type === 'pub(phishing.redirectIfDenied)') {
      return this.redirectIfPhishing(url);
    }

    if (type !== 'pub(authorize.tab)') {
      await this.#state.ensureUrlAuthorized(url);
    }

    switch (type) {
      case 'pub(authorize.tab)':
        return this.authorize(url, request as RequestAuthorizeTab);

      case 'pub(accounts.list)':
        return this.accountsListAuthorized(url, request as RequestAccountList);

      case 'pub(accounts.subscribe)':
        return this.accountsSubscribeAuthorized(url, messageId, tabId);

      case 'pub(accounts.unsubscribe)':
        return this.accountsUnsubscribe(url, request as RequestAccountUnsubscribe);

      case 'pub(bytes.sign)':
        return this.bytesSign(url, request as SignerPayloadRaw);

      case 'pub(extrinsic.sign)':
        return this.extrinsicSign(url, request as SignerPayloadJSON);

      case 'pub(metadata.list)':
        return this.metadataList(url);

      case 'pub(metadata.provide)':
        return this.metadataProvide(url, request as MetadataDef);

        // case 'pub(rpc.listProviders)':
        //   return this.rpcListProviders();
        //
        // case 'pub(rpc.send)':
        //   return this.rpcSend(request as RequestRpcSend);
        //
        // case 'pub(rpc.startProvider)':
        //   return this.rpcStartProvider(request as string);
        //
        // case 'pub(rpc.subscribe)':
        //   return this.rpcSubscribe(request as RequestRpcSubscribe, messageId);
        //
        // case 'pub(rpc.subscribeConnected)':
        //   return this.rpcSubscribeConnected(request as null, messageId);
        //
        // case 'pub(rpc.unsubscribe)':
        //   return this.rpcUnsubscribe(request as RequestRpcUnsubscribe);

      default:
        throw new Error(`Unable to handle message of type ${type}`);
    }
  }
}
