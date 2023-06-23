// Copyright 2019-2023 @polkadot/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { MetadataDef } from '@polkadot/extension-inject/types';
import type { KeyringPair, KeyringPair$Json, KeyringPair$Meta } from '@polkadot/keyring/types';
import type { Registry, SignerPayloadJSON, SignerPayloadRaw } from '@polkadot/types/types';
import type { SubjectInfo } from '@polkadot/ui-keyring/observable/types';
import type { KeypairType } from '@polkadot/util-crypto/types';
import type { AccountJson, AllowedPath, AuthorizeRequest, MessageTypes, MetadataRequest, RequestAccountChangePassword, RequestAccountCreateHardware, RequestAccountCreateSuri, RequestAccountEdit, RequestAccountExport, RequestAccountForget, RequestAccountShow, RequestAccountTie, RequestAccountValidate, RequestActiveTabsUrlUpdate, RequestAuthorizeApprove, RequestAuthorizeReject, RequestBatchRestore, RequestDeriveCreate, RequestDeriveValidate, RequestJsonRestore, RequestMetadataApprove, RequestMetadataReject, RequestSeedCreate, RequestSeedValidate, RequestSigningApprovePassword, RequestSigningApproveSignature, RequestSigningCancel, RequestSigningIsLocked, RequestTypes, RequestUpdateAuthorizedAccounts, ResponseAccountExport, ResponseAuthorizeList, ResponseDeriveValidate, ResponseJsonGetAccountInfo, ResponseSeedCreate, ResponseSeedValidate, ResponseSigningIsLocked, ResponseType, SigningRequest } from '../types';

import { ALLOWED_PATH, PASSWORD_EXPIRY_MS } from '@polkadot/extension-base/defaults';
import { isJsonAuthentic, signJson } from '@polkadot/extension-base/utils/accountJsonIntegrity';
import { metadataExpand } from '@polkadot/extension-chains';
import { TypeRegistry } from '@polkadot/types';
import keyring from '@polkadot/ui-keyring';
import { accounts as accountsObservable } from '@polkadot/ui-keyring/observable/accounts';
import { assert, isHex } from '@polkadot/util';
import { keyExtractSuri, mnemonicGenerate, mnemonicValidate } from '@polkadot/util-crypto';

import { withErrorLog } from './helpers';
import State from './State';
import { createSubscription, unsubscribe } from './subscriptions';

type CachedUnlocks = Record<string, number>;

const SEED_DEFAULT_LENGTH = 12;
const SEED_LENGTHS = [12, 15, 18, 21, 24];
const ETH_DERIVE_DEFAULT = "/m/44'/60'/0'/0/0";

function getSuri (seed: string, type?: KeypairType): string {
  return type === 'ethereum' ? `${seed}${ETH_DERIVE_DEFAULT}` : seed;
}

function isJsonPayload (value: SignerPayloadJSON | SignerPayloadRaw): value is SignerPayloadJSON {
  return (value as SignerPayloadJSON).genesisHash !== undefined;
}

const POPUP_WINDOW_OPTS: chrome.windows.CreateData = {
  focused: true,
  height: 600,
  left: 150,
  state: 'normal',
  top: 150,
  type: 'popup',
  width: 360
};

export default class Extension {
  readonly #cachedUnlocks: CachedUnlocks;

  readonly #state: State;

  constructor (state: State) {
    this.#cachedUnlocks = {};
    this.#state = state;
  }

  private async transformAccounts (accounts: SubjectInfo): Promise<AccountJson[]> {
    const defaultAuthAccountSelection = await this.#state.getDefaultAuthAccountSelection();

    return Object.values(accounts).map(
      ({ json: { address, meta }, type }): AccountJson => ({
        address,
        isDefaultAuthSelected: defaultAuthAccountSelection.includes(address),
        ...meta,
        type
      })
    );
  }

  private accountsCreateHardware ({ accountIndex, address, addressOffset, genesisHash, hardwareType, name }: RequestAccountCreateHardware): boolean {
    keyring.addHardware(address, hardwareType, { accountIndex, addressOffset, genesisHash, name });

    return true;
  }

  private accountsCreateSuri ({ genesisHash, name, password, suri, type }: RequestAccountCreateSuri): boolean {
    keyring.addUri(getSuri(suri, type), password, { genesisHash, name }, type);

    return true;
  }

  private accountsChangePassword ({ address, newPass, oldPass }: RequestAccountChangePassword): boolean {
    const pair = keyring.getPair(address);

    assert(pair, 'Unable to find pair');

    try {
      if (!pair.isLocked) {
        pair.lock();
      }

      pair.decodePkcs8(oldPass);
    } catch (error) {
      throw new Error('oldPass is invalid');
    }

    keyring.encryptAccount(pair, newPass);

    return true;
  }

  private accountsEdit ({ address, name }: RequestAccountEdit): boolean {
    const pair = keyring.getPair(address);

    assert(pair, 'Unable to find pair');

    keyring.saveAccountMeta(pair, { ...pair.meta, name });

    return true;
  }

  private async accountsExport ({ address, password }: RequestAccountExport): Promise<ResponseAccountExport> {
    return {
      exportedJson: await signJson(
        keyring.backupAccount(keyring.getPair(address), password),
        password
      )
    };
  }

  private async accountsForget ({ address }: RequestAccountForget): Promise<boolean> {
    const authUrls = await this.#state.getAuthUrls();

    // cycle through authUrls and prepare the diff
    const authorizedAccountsDiff = Object.fromEntries(Object.entries(authUrls).flatMap(([url, urlInfo]) => {
      if (!urlInfo.authorizedAccounts.includes(address)) {
        return [];
      }

      return [[url, urlInfo.authorizedAccounts.filter((previousAddress) => previousAddress !== address)] as const];
    }));

    await this.#state.updateAuthorizedAccounts(authorizedAccountsDiff);

    // cycle through default account selection for auth and remove any occurence of the account
    const newDefaultAuthAccounts = (await this.#state.getDefaultAuthAccountSelection()).filter((defaultSelectionAddress) => defaultSelectionAddress !== address);

    await this.#state.updateDefaultAuthAccounts(newDefaultAuthAccounts);

    keyring.forgetAccount(address);

    return true;
  }

  private refreshAccountPasswordCache (pair: KeyringPair): number {
    const { address } = pair;

    const savedExpiry = this.#cachedUnlocks[address] || 0;
    const remainingTime = savedExpiry - Date.now();

    if (remainingTime < 0) {
      this.#cachedUnlocks[address] = 0;
      pair.lock();

      return 0;
    }

    return remainingTime;
  }

  private accountsShow ({ address, isShowing }: RequestAccountShow): boolean {
    const pair = keyring.getPair(address);

    assert(pair, 'Unable to find pair');

    keyring.saveAccountMeta(pair, { ...pair.meta, isHidden: !isShowing });

    return true;
  }

  private accountsTie ({ address, genesisHash }: RequestAccountTie): boolean {
    const pair = keyring.getPair(address);

    assert(pair, 'Unable to find pair');

    keyring.saveAccountMeta(pair, { ...pair.meta, genesisHash });

    return true;
  }

  private accountsValidate ({ address, password }: RequestAccountValidate): boolean {
    try {
      keyring.backupAccount(keyring.getPair(address), password);

      return true;
    } catch (e) {
      return false;
    }
  }

  private accountsSubscribe (id: string, port: chrome.runtime.Port): boolean {
    const cb = createSubscription<'pri(accounts.subscribe)'>(id, port);
    const subscription = accountsObservable.subject.subscribe((accounts: SubjectInfo): void => {
      // It is the callbacks job to handle errors, so not doing it here
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      this.transformAccounts(accounts).then(cb);
    });

    port.onDisconnect.addListener((): void => {
      unsubscribe(id);
      subscription.unsubscribe();
    });

    return true;
  }

  private authorizeApprove ({ authorizedAccounts, id }: RequestAuthorizeApprove): boolean {
    const queued = this.#state.getAuthRequest(id);

    assert(queued, 'Unable to find request');

    const { resolve } = queued;

    resolve({ authorizedAccounts, result: true });

    return true;
  }

  private authorizeReject ({ id }: RequestAuthorizeReject): boolean {
    const queued = this.#state.getAuthRequest(id);

    assert(queued, 'Unable to find request');

    const { reject } = queued;

    reject(new Error('Rejected'));

    return true;
  }

  private async authorizeUpdate ({ authorizedAccounts, url }: RequestUpdateAuthorizedAccounts): Promise<void> {
    return this.#state.updateAuthorizedAccounts({ [url]: authorizedAccounts });
  }

  private authorizeDateUpdate (url: string): Promise<void> {
    return this.#state.updateAuthorizedDate(url);
  }

  private async getAuthList (): Promise<ResponseAuthorizeList> {
    return { list: await this.#state.getAuthUrls() };
  }

  private authorizeSubscribe (id: string, port: chrome.runtime.Port): boolean {
    const cb = createSubscription<'pri(authorize.requests)'>(id, port);
    const subscription = this.#state.authSubject.subscribe((requests: AuthorizeRequest[]): void => cb(requests));

    port.onDisconnect.addListener((): void => {
      unsubscribe(id);
      subscription.unsubscribe();
    });

    return true;
  }

  private async metadataApprove ({ id }: RequestMetadataApprove): Promise<boolean> {
    const queued = this.#state.getMetaRequest(id);

    assert(queued, 'Unable to find request');

    const { request, resolve } = queued;

    await this.#state.saveMetadata(request);

    resolve(true);

    return true;
  }

  private async metadataGet (genesisHash: string | null): Promise<MetadataDef | null> {
    return (await this.#state.getKnownMetadata()).find((result) => result.genesisHash === genesisHash) || null;
  }

  private metadataList (): Promise<MetadataDef[]> {
    return this.#state.getKnownMetadata();
  }

  private metadataReject ({ id }: RequestMetadataReject): boolean {
    const queued = this.#state.getMetaRequest(id);

    assert(queued, 'Unable to find request');

    const { reject } = queued;

    reject(new Error('Rejected'));

    return true;
  }

  private metadataSubscribe (id: string, port: chrome.runtime.Port): boolean {
    const cb = createSubscription<'pri(metadata.requests)'>(id, port);
    const subscription = this.#state.metaSubject.subscribe((requests: MetadataRequest[]): void => cb(requests));

    port.onDisconnect.addListener((): void => {
      unsubscribe(id);
      subscription.unsubscribe();
    });

    return true;
  }

  private async jsonRestore ({ file, password, skipAuthenticityCheck }: RequestJsonRestore): Promise<void> {
    if (!skipAuthenticityCheck && !await isJsonAuthentic(file, password)) {
      throw new Error('JSON authenticity check failed');
    }

    try {
      keyring.restoreAccount(file, password);
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }

  private async batchRestore ({ file, password, skipAuthenticityCheck }: RequestBatchRestore): Promise<void> {
    if (!skipAuthenticityCheck && !await isJsonAuthentic(file, password)) {
      throw new Error('JSON authenticity check failed');
    }

    try {
      keyring.restoreAccounts(file, password);
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }

  private jsonGetAccountInfo (json: KeyringPair$Json): ResponseJsonGetAccountInfo {
    try {
      const { address,
        meta: { genesisHash, name },
        type } = keyring.createFromJson(json);

      return {
        address,
        genesisHash,
        name,
        type
      } as ResponseJsonGetAccountInfo;
    } catch (e) {
      console.error(e);
      throw new Error((e as Error).message);
    }
  }

  private seedCreate ({ length = SEED_DEFAULT_LENGTH, seed: _seed, type }: RequestSeedCreate): ResponseSeedCreate {
    const seed = _seed || mnemonicGenerate(length);

    return {
      address: keyring.createFromUri(getSuri(seed, type), {}, type).address,
      seed
    };
  }

  private seedValidate ({ suri, type }: RequestSeedValidate): ResponseSeedValidate {
    const { phrase } = keyExtractSuri(suri);

    if (isHex(phrase)) {
      assert(isHex(phrase, 256), 'Hex seed needs to be 256-bits');
    } else {
      // sadly isHex detects as string, so we need a cast here
      assert(SEED_LENGTHS.includes(phrase.split(' ').length), `Mnemonic needs to contain ${SEED_LENGTHS.join(', ')} words`);
      assert(mnemonicValidate(phrase), 'Not a valid mnemonic seed');
    }

    return {
      address: keyring.createFromUri(getSuri(suri, type), {}, type).address,
      suri
    };
  }

  private async signingApprovePassword ({ id, password, savePass }: RequestSigningApprovePassword): Promise<boolean> {
    const queued = this.#state.getSignRequest(id);

    assert(queued, 'Unable to find request');

    const { reject, request, resolve } = queued;
    const pair = keyring.getPair(queued.account.address);

    if (!pair) {
      reject(new Error('Unable to find pair'));

      return false;
    }

    this.refreshAccountPasswordCache(pair);

    // if the keyring pair is locked, the password is needed
    if (pair.isLocked && !password) {
      reject(new Error('Password needed to unlock the account'));
    }

    if (pair.isLocked) {
      try {
        pair.decodePkcs8(password);
      } catch (e) {
        throw new Error('invalid password');
      }
    }

    // construct a new registry (avoiding pollution), between requests
    let registry: Registry;
    const { payload } = request;

    if (isJsonPayload(payload)) {
      // Get the metadata for the genesisHash
      const metadata = (await this.#state.getKnownMetadata()).find(({ genesisHash }) => genesisHash === payload.genesisHash);

      if (metadata) {
        // we have metadata, expand it and extract the info/registry
        const expanded = metadataExpand(metadata, false);

        registry = expanded.registry;
        registry.setSignedExtensions(payload.signedExtensions, expanded.definition.userExtensions);
      } else {
        // we have no metadata, create a new registry
        registry = new TypeRegistry();
        registry.setSignedExtensions(payload.signedExtensions);
      }
    } else {
      // for non-payload, just create a registry to use
      registry = new TypeRegistry();
    }

    const result = request.sign(registry, pair);

    if (savePass) {
      // unlike queued.account.address the following
      // address is encoded with the default prefix
      // which what is used for password caching mapping
      this.#cachedUnlocks[pair.address] = Date.now() + PASSWORD_EXPIRY_MS;
    } else {
      pair.lock();
    }

    resolve({
      id,
      ...result
    });

    return true;
  }

  private signingApproveSignature ({ id, signature }: RequestSigningApproveSignature): boolean {
    const queued = this.#state.getSignRequest(id);

    assert(queued, 'Unable to find request');

    const { resolve } = queued;

    resolve({ id, signature });

    return true;
  }

  private signingCancel ({ id }: RequestSigningCancel): boolean {
    const queued = this.#state.getSignRequest(id);

    assert(queued, 'Unable to find request');

    const { reject } = queued;

    reject(new Error('Cancelled'));

    return true;
  }

  private signingIsLocked ({ id }: RequestSigningIsLocked): ResponseSigningIsLocked {
    const queued = this.#state.getSignRequest(id);

    assert(queued, 'Unable to find request');

    const address = queued.request.payload.address;
    const pair = keyring.getPair(address);

    assert(pair, 'Unable to find pair');

    const remainingTime = this.refreshAccountPasswordCache(pair);

    return {
      isLocked: pair.isLocked,
      remainingTime
    };
  }

  private signingSubscribe (id: string, port: chrome.runtime.Port): boolean {
    const cb = createSubscription<'pri(signing.requests)'>(id, port);
    const subscription = this.#state.signSubject.subscribe((requests: SigningRequest[]): void => cb(requests));

    port.onDisconnect.addListener((): void => {
      unsubscribe(id);
      subscription.unsubscribe();
    });

    return true;
  }

  // this method is called when we want to open up the popup from the ui
  private windowOpen (path: AllowedPath): boolean {
    const url = `${chrome.runtime.getURL('external.html')}#${path}`;

    if (!ALLOWED_PATH.includes(path)) {
      console.error('Not allowed to open the url:', url);

      return false;
    }

    // We're adding chrome.windows.update to make sure that the extension popup is not fullscreened
    // There is a bug in Chrome that causes the extension popup to be fullscreened when user has any fullscreened browser window opened on the main screen
    withErrorLog(() => chrome.windows.create({ ...POPUP_WINDOW_OPTS, url },
      (window): void => {
        if (window) {
          chrome.windows.update(window.id || 0, { state: 'normal' }).catch(console.error);
        }
      }));

    return true;
  }

  private derive (parentAddress: string, suri: string, password: string, metadata: KeyringPair$Meta): KeyringPair {
    const parentPair = keyring.getPair(parentAddress);

    try {
      parentPair.decodePkcs8(password);
    } catch (e) {
      throw new Error('invalid password');
    }

    try {
      return parentPair.derive(suri, metadata);
    } catch (err) {
      throw new Error(`"${suri}" is not a valid derivation path`);
    }
  }

  private derivationValidate ({ parentAddress, parentPassword, suri }: RequestDeriveValidate): ResponseDeriveValidate {
    const childPair = this.derive(parentAddress, suri, parentPassword, {});

    return {
      address: childPair.address,
      suri
    };
  }

  private derivationCreate ({ genesisHash, name, parentAddress, parentPassword, password, suri }: RequestDeriveCreate): boolean {
    const childPair = this.derive(parentAddress, suri, parentPassword, {
      genesisHash,
      name,
      parentAddress,
      suri
    });

    keyring.addPair(childPair, password);

    return true;
  }

  private async removeAuthorization (url: string): Promise<ResponseAuthorizeList> {
    return { list: await this.#state.removeAuthorization(url) };
  }

  private deleteAuthRequest (requestId: string): void {
    return this.#state.deleteAuthRequest(requestId);
  }

  private async updateCurrentTabs ({ urls }: RequestActiveTabsUrlUpdate) {
    await this.#state.updateCurrentTabsUrl(urls);
  }

  private getConnectedTabsUrl () {
    return this.#state.getConnectedTabsUrl();
  }

  // Weird thought, the eslint override is not needed in Tabs
  // eslint-disable-next-line @typescript-eslint/require-await
  public async handle<TMessageType extends MessageTypes> (id: string, type: TMessageType, request: RequestTypes[TMessageType], port?: chrome.runtime.Port): Promise<ResponseType<TMessageType>> {
    switch (type) {
      case 'pri(authorize.approve)':
        return this.authorizeApprove(request as RequestAuthorizeApprove);

      case 'pri(authorize.reject)':
        return this.authorizeReject(request as RequestAuthorizeReject);

      case 'pri(authorize.list)':
        return this.getAuthList();

      case 'pri(authorize.remove)':
        return this.removeAuthorization(request as string);

      case 'pri(authorize.delete.request)':
        return this.deleteAuthRequest(request as string);

      case 'pri(authorize.requests)':
        return port && this.authorizeSubscribe(id, port);

      case 'pri(authorize.update)':
        return this.authorizeUpdate(request as RequestUpdateAuthorizedAccounts);

      case 'pri(authorizeDate.update)':
        return this.authorizeDateUpdate(request as string);

      case 'pri(accounts.create.hardware)':
        return this.accountsCreateHardware(request as RequestAccountCreateHardware);

      case 'pri(accounts.create.suri)':
        return this.accountsCreateSuri(request as RequestAccountCreateSuri);

      case 'pri(accounts.changePassword)':
        return this.accountsChangePassword(request as RequestAccountChangePassword);

      case 'pri(accounts.edit)':
        return this.accountsEdit(request as RequestAccountEdit);

      case 'pri(accounts.export)':
        return this.accountsExport(request as RequestAccountExport);

      case 'pri(accounts.forget)':
        return this.accountsForget(request as RequestAccountForget);

      case 'pri(accounts.show)':
        return this.accountsShow(request as RequestAccountShow);

      case 'pri(accounts.subscribe)':
        return port && this.accountsSubscribe(id, port);

      case 'pri(accounts.tie)':
        return this.accountsTie(request as RequestAccountTie);

      case 'pri(accounts.validate)':
        return this.accountsValidate(request as RequestAccountValidate);

      case 'pri(metadata.approve)':
        return this.metadataApprove(request as RequestMetadataApprove);

      case 'pri(metadata.get)':
        return this.metadataGet(request as string);

      case 'pri(metadata.list)':
        return this.metadataList();

      case 'pri(metadata.reject)':
        return this.metadataReject(request as RequestMetadataReject);

      case 'pri(metadata.requests)':
        return port && this.metadataSubscribe(id, port);

      case 'pri(activeTabsUrl.update)':
        return this.updateCurrentTabs(request as RequestActiveTabsUrlUpdate);

      case 'pri(connectedTabsUrl.get)':
        return this.getConnectedTabsUrl();

      case 'pri(derivation.create)':
        return this.derivationCreate(request as RequestDeriveCreate);

      case 'pri(derivation.validate)':
        return this.derivationValidate(request as RequestDeriveValidate);

      case 'pri(json.restore)':
        return this.jsonRestore(request as RequestJsonRestore);

      case 'pri(json.batchRestore)':
        return this.batchRestore(request as RequestBatchRestore);

      case 'pri(json.account.info)':
        return this.jsonGetAccountInfo(request as KeyringPair$Json);

      case 'pri(ping)':
        return Promise.resolve(true);

      case 'pri(seed.create)':
        return this.seedCreate(request as RequestSeedCreate);

      case 'pri(seed.validate)':
        return this.seedValidate(request as RequestSeedValidate);

      case 'pri(settings.notification)':
        return this.#state.setNotification(request as string);

      case 'pri(signing.approve.password)':
        return this.signingApprovePassword(request as RequestSigningApprovePassword);

      case 'pri(signing.approve.signature)':
        return this.signingApproveSignature(request as RequestSigningApproveSignature);

      case 'pri(signing.cancel)':
        return this.signingCancel(request as RequestSigningCancel);

      case 'pri(signing.isLocked)':
        return this.signingIsLocked(request as RequestSigningIsLocked);

      case 'pri(signing.requests)':
        return port && this.signingSubscribe(id, port);

      case 'pri(window.open)':
        return this.windowOpen(request as AllowedPath);

      default:
        throw new Error(`Unable to handle message of type ${type}`);
    }
  }
}
