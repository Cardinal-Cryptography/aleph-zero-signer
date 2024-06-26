// Copyright 2019-2023 @polkadot/extension-dapp authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { InjectedAccount, InjectedAccountWithMeta, InjectedExtension, InjectedProviderWithMeta, InjectedWindow, ProviderList, Unsubcall, Web3AccountsOptions } from '@polkadot/extension-inject/types';

import { isPromise, objectSpread, u8aEq } from '@polkadot/util';
import { decodeAddress, encodeAddress } from '@polkadot/util-crypto';

import { documentReadyPromise } from './util';

// expose utility functions
export { packageInfo } from './packageInfo';
export { unwrapBytes, wrapBytes } from './wrapBytes';

// just a helper (otherwise we cast all-over, so shorter and more readable)
const win = window as Window & InjectedWindow;

// don't clobber the existing object, but ensure non-undefined
win.injectedWeb3 = win.injectedWeb3 || {};

// true when anything has been injected and is available
function web3IsInjected (): boolean {
  return Object
    .values(win.injectedWeb3)
    .filter(({ connect, enable }) => !!(connect || enable))
    .length !== 0;
}

// helper to throw a consistent error when not enabled
function throwError (method: string): never {
  throw new Error(`${method}: web3Enable(originName) needs to be called before ${method}`);
}

// internal helper to map from Array<InjectedAccount> -> Array<InjectedAccountWithMeta>
function mapAccounts (source: string, list: InjectedAccount[], ss58Format?: number): InjectedAccountWithMeta[] {
  return list.map(({ address, genesisHash, name, type }): InjectedAccountWithMeta => ({
    address: address.length === 42
      ? address
      : encodeAddress(decodeAddress(address), ss58Format),
    meta: { genesisHash, name, source },
    type
  }));
}

// internal helper to filter accounts
function filterAccounts (list: InjectedAccount[], genesisHash?: string | null, type?: string[]): InjectedAccount[] {
  return list.filter((a) =>
    (!a.type || !type || type.includes(a.type)) &&
    (!a.genesisHash || !genesisHash || a.genesisHash === genesisHash)
  );
}

// have we found a properly constructed window.injectedWeb3
let isWeb3Injected = web3IsInjected();

// we keep the last promise created around (for queries)
let web3EnablePromise: Promise<InjectedExtension[]> | null = null;

export { isWeb3Injected, web3EnablePromise };

function getWindowExtensions (originName: string): Promise<InjectedExtension[]> {
  return Promise
    .all(
      Object
        .entries(win.injectedWeb3)
        .map(([nameOrHash, { connect, enable, version }]): Promise<(InjectedExtension | void)> =>
          Promise
            .resolve()
            .then(() =>
              connect
                // new style, returning all info
                ? connect(originName)
                : enable
                  // previous interface, leakages on name/version
                  ? enable(originName).then((e) =>
                    objectSpread<InjectedExtension>({ name: nameOrHash, version: version || 'unknown' }, e)
                  )
                  : Promise.reject(new Error('No connect(..) or enable(...) hook found'))
            )
            .catch(({ message }: Error): void => {
              console.error(`Error initializing ${nameOrHash}: ${message}`);
            })
        )
    )
    .then((exts) => exts.filter((e): e is InjectedExtension => !!e));
}

// enables all the providers found on the injected window interface
export function web3Enable (originName: string, compatInits: (() => Promise<boolean>)[] = []): Promise<InjectedExtension[]> {
  if (!originName) {
    throw new Error('You must pass a name for your app to the web3Enable function');
  }

  const initCompat = compatInits.length
    ? Promise.all(compatInits.map((c) => c().catch(() => false)))
    : Promise.resolve([true]);

  web3EnablePromise = documentReadyPromise(
    (): Promise<InjectedExtension[]> =>
      initCompat.then(() =>
        getWindowExtensions(originName)
          .then((values): InjectedExtension[] =>
            values.map((e): InjectedExtension => {
              // if we don't have an accounts subscriber, add a single-shot version
              if (!e.accounts.subscribe) {
                e.accounts.subscribe = (cb: (accounts: InjectedAccount[]) => void | Promise<void>): Unsubcall => {
                  e.accounts
                    .get()
                    .then(cb)
                    .catch(console.error);

                  return (): void => {
                    // no ubsubscribe needed, this is a single-shot
                  };
                };
              }

              return e;
            })
          )
          .catch((): InjectedExtension[] => [])
          .then((values): InjectedExtension[] => {
            const names = values.map(({ name, version }): string => `${name}/${version}`);

            isWeb3Injected = web3IsInjected();
            console.info(`web3Enable: Enabled ${values.length} extension${values.length !== 1 ? 's' : ''}: ${names.join(', ')}`);

            return values;
          })
      )
  );

  return web3EnablePromise;
}

// retrieve all the accounts across all providers
export async function web3Accounts ({ accountType, extensions, genesisHash, ss58Format }: Web3AccountsOptions = {}): Promise<InjectedAccountWithMeta[]> {
  if (!web3EnablePromise) {
    return throwError('web3Accounts');
  }

  const accounts: InjectedAccountWithMeta[] = [];
  const sources = await web3EnablePromise;
  const retrieved = await Promise.all(
    sources
      .filter(({ name: source }) =>
        !extensions ||
        extensions.includes(source)
      )
      .map(async ({ accounts, name: source }): Promise<InjectedAccountWithMeta[]> => {
        try {
          const list = await accounts.get();

          return mapAccounts(source, filterAccounts(list, genesisHash, accountType), ss58Format);
        } catch (error) {
          // cannot handle this one
          return [];
        }
      })
  );

  retrieved.forEach((result): void => {
    accounts.push(...result);
  });

  console.info(`web3Accounts: Found ${accounts.length} address${accounts.length !== 1 ? 'es' : ''}`);

  return accounts;
}

export async function web3AccountsSubscribe (cb: (accounts: InjectedAccountWithMeta[]) => void | Promise<void>, { accountType, extensions, genesisHash, ss58Format }: Web3AccountsOptions = {}): Promise<Unsubcall> {
  if (!web3EnablePromise) {
    return throwError('web3AccountsSubscribe');
  }

  const accounts: Record<string, InjectedAccount[]> = {};

  const triggerUpdate = (): void | Promise<void> =>
    cb(
      Object
        .entries(accounts)
        .reduce((result: InjectedAccountWithMeta[], [source, list]): InjectedAccountWithMeta[] => {
          result.push(...mapAccounts(source, filterAccounts(list, genesisHash, accountType), ss58Format));

          return result;
        }, [])
    );

  const sources = await web3EnablePromise;
  const unsubs = sources
    .filter(({ name: source }) =>
      !extensions ||
      extensions.includes(source)
    )
    .map(({ accounts: { subscribe }, name: source }): Unsubcall =>
      subscribe((result): void => {
        accounts[source] = result;

        try {
          const result = triggerUpdate();

          if (result && isPromise(result)) {
            result.catch(console.error);
          }
        } catch (error) {
          console.error(error);
        }
      })
    );

  return (): void => {
    unsubs.forEach((unsub): void => {
      unsub();
    });
  };
}

// find a specific provider based on the name
export async function web3FromSource (source: string): Promise<InjectedExtension> {
  if (!web3EnablePromise) {
    return throwError('web3FromSource');
  }

  const sources = await web3EnablePromise;
  const found = source && sources.find(({ name }) => name === source);

  if (!found) {
    throw new Error(`web3FromSource: Unable to find an injected ${source}`);
  }

  return found;
}

// find a specific provider based on an address
export async function web3FromAddress (address: string): Promise<InjectedExtension> {
  if (!web3EnablePromise) {
    return throwError('web3FromAddress');
  }

  const accounts = await web3Accounts();
  let found: InjectedAccountWithMeta | undefined;

  if (address) {
    const accountU8a = decodeAddress(address);

    found = accounts.find((account): boolean => u8aEq(decodeAddress(account.address), accountU8a));
  }

  if (!found) {
    throw new Error(`web3FromAddress: Unable to find injected ${address}`);
  }

  return web3FromSource(found.meta.source);
}

// retrieve all providers exposed by one source
export async function web3ListRpcProviders (source: string): Promise<ProviderList | null> {
  const { provider } = await web3FromSource(source);

  if (!provider) {
    console.warn(`Extension ${source} does not expose any provider`);

    return null;
  }

  return provider.listProviders();
}

// retrieve all providers exposed by one source
export async function web3UseRpcProvider (source: string, key: string): Promise<InjectedProviderWithMeta> {
  const { provider } = await web3FromSource(source);

  if (!provider) {
    throw new Error(`Extension ${source} does not expose any provider`);
  }

  const meta = await provider.startProvider(key);

  return { meta, provider };
}
