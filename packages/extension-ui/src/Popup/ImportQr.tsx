// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useCallback, useContext, useState } from 'react';

import useToast from "@polkadot/extension-ui/hooks/useToast";
import { QrScanAddress } from '@polkadot/react-qr';

import { ActionContext, Address, ButtonArea, NextStepButton, VerticalSpace } from '../components';
import AccountNamePasswordCreation from '../components/AccountNamePasswordCreation';
import useTranslation from '../hooks/useTranslation';
import { createAccountExternal, createAccountSuri, createSeed } from '../messaging';
import { Header, Name } from '../partials';

interface QrAccount {
  content: string;
  genesisHash: string;
  isAddress: boolean;
  name?: string;
}

export default function ImportQr(): React.ReactElement {
  const { t } = useTranslation();
  const onAction = useContext(ActionContext);
  const [account, setAccount] = useState<QrAccount | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [password, setPassword] = useState<string | null>(null);
  const { show } = useToast();

  const _setAccount = useCallback((qrAccount: QrAccount) => {
    setAccount(qrAccount);
    setName(qrAccount?.name || null);

    if (qrAccount.isAddress) {
      setAddress(qrAccount.content);
    } else {
      createSeed(undefined, qrAccount.content)
        .then(({ address }) => setAddress(address))
        .catch(console.error);
    }
  }, []);

  const _onCreate = useCallback(() => {
    if (account && name) {
      if (account.isAddress) {
        createAccountExternal(name, account.content, account.genesisHash)
          .then(() => {
            show(t('Account created successfully!'), 'success');
            onAction('/');
          })
          .catch((error: Error) => {
            show(t('Account creation was not successful.'), 'critical');
            console.error(error);
          });
      } else if (password) {
        createAccountSuri(name, password, account.content, 'sr25519', account.genesisHash)
          .then(() => {
            show(t('Account created successfully!'), 'success');
            onAction('/')
          })
          .catch((error: Error) => {
            show(t('Account creation was not successful.'), 'critical');
            console.error(error);
          });
      }
    }
  }, [account, name, onAction, password, show, t]);

  return (
    <>
      <Header
        text={t<string>('Scan Address Qr')}
        withBackArrow
      />
      {!account && (
        <div>
          <QrScanAddress onScan={_setAccount} />
        </div>
      )}
      {account && (
        <>
          <div>
            <Address
              {...account}
              address={address}
              isExternal={true}
              name={name}
            />
          </div>
          {account.isAddress ? (
            <Name
              isFocused
              onChange={setName}
              value={name || ''}
            />
          ) : (
            <AccountNamePasswordCreation
              isBusy={false}
              onCreate={_onCreate}
              onNameChange={setName}
              onPasswordChange={setPassword}
            />
          )}
          <VerticalSpace />
          <ButtonArea>
            <NextStepButton
              isDisabled={!name || (!account.isAddress && !password)}
              onClick={_onCreate}
            >
              {t<string>('Add the account with identified address')}
            </NextStepButton>
          </ButtonArea>
        </>
      )}
    </>
  );
}
