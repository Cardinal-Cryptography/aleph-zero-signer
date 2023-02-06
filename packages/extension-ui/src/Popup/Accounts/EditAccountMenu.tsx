// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ThemeProps } from '../../types';

import React, { useCallback, useContext, useEffect, useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import { RouteComponentProps, withRouter } from 'react-router';
import styled from 'styled-components';

import { AccountJson } from '@polkadot/extension-base/background/types';
import { EditMenuCard, Identicon } from '@polkadot/extension-ui/components';
import useMetadata from '@polkadot/extension-ui/hooks/useMetadata';
import { IconTheme } from '@polkadot/react-identicon/types';

import { Switch } from '../../components';
import { AccountContext, SettingsContext } from '../../components/contexts';
import useToast from '../../hooks/useToast';
import useTranslation from '../../hooks/useTranslation';
import { showAccount } from '../../messaging';
import Header from '../../partials/Header';
import { ellipsisName } from '../../util/ellipsisName';

interface Props extends RouteComponentProps<{ address: string; isExternal: string }>, ThemeProps {
  className?: string;
}

function EditAccountMenu({
  className,
  match: {
    params: { address, isExternal }
  }
}: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { accounts, hierarchy } = useContext(AccountContext);
  const { show } = useToast();

  // console.log(accounts);
  // console.log('hierarchy', hierarchy);

  function findAccountByAddress(accounts: AccountJson[], _address: string): AccountJson | null {
    return accounts.find(({ address }): boolean => address === _address) || null;
  }

  function findAccountInHierarchy(accounts: AccountJson[], _address: string) {
    return hierarchy.find(({ address }): boolean => address === _address) || null;
  }

  const _onCopy = useCallback(() => show(t('Copied'), 'success'), [show, t]);

  // const account = findAccountByAddress(accounts, address);
  const [account, setAccount] = useState(findAccountInHierarchy(accounts, address));

  console.log('account', account?.isHidden);
  const [isHidden, setIsHidden] = useState(account?.isHidden);

  console.log('account', account);

  const chain = useMetadata(account && account.genesisHash, true);
  const settings = useContext(SettingsContext);

  const prefix = chain ? chain.ss58Format : settings.prefix === -1 ? 42 : settings.prefix;

  const theme = (account && account.type === 'ethereum' ? 'ethereum' : chain?.icon || 'polkadot') as IconTheme;

  const _toggleVisibility = useCallback((): void => {
    console.log('toggleVisibility from address', address, isHidden);
    address &&
      showAccount(address, isHidden || false)
        .then((data) => {
          if (account) {
            setAccount({
              ...account,
              isHidden: !account.isHidden
            });
          }

          setIsHidden(data);
        })
        .catch(console.error);
  }, [address, isHidden, account]);
  //   {
  //     "address": "5Co7EFHvAxbdW2o2TdK8wycB6V98G5UqZCr1idG5tx175Q3t",
  //     "isDefaultAuthSelected": false,
  //     "genesisHash": "",
  //     "name": "maTEUSZ",
  //     "whenCreated": 1675359808197,
  //     "type": "sr25519"
  // }

  return (
    <>
      <Header
        showBackArrow
        showHelp
        text={t<string>('Edit Account')}
      />
      {/* TODO: */}
      <div className={className}>
        <Identicon
          className='identityIcon'
          iconTheme={theme}
          isExternal={isExternal === 'true'}
          onCopy={_onCopy}
          prefix={prefix}
          value={address}
        />
        {/* 
className?: string;
  preIcon?: React.ReactNode;
  title: string;
  description: string;
  extra?: 'chevron' | 'copy' | 'toggle';
  onClick?: () => void; */}
        <EditMenuCard
          description='Controller'
          extra='chevron'
          position='top'
          title='Name'
        />
        <CopyToClipboard text={(address && address) || ''}>
          <EditMenuCard
            description={ellipsisName(address) || ''}
            extra='copy'
            onClick={_onCopy}
            position='middle'
            title='Address'
          />
        </CopyToClipboard>
        <EditMenuCard
          description='Network'
          extra='chevron'
          position='middle'
          title='Name'
        />
        <EditMenuCard
          description=''
          position='bottom'
          title='Visibility for apps'
          toggle={
            <>
              <Switch
                checked={account?.isHidden || false}
                checkedLabel={t<string>('')}
                onChange={_toggleVisibility}
                uncheckedLabel={t<string>('')}
              />
            </>
          }
        />
        <EditMenuCard
          description=''
          extra='chevron'
          position='both'
          title='Create a sub-account'
        />
        <EditMenuCard
          description=''
          extra='chevron'
          position='both'
          title='Forget'
        />
        {address}
        {isExternal}
      </div>
    </>
  );
}

export default React.memo(
  withRouter(
    styled(EditAccountMenu)(
      ({ theme }: Props) => `
  color: ${theme.textColor};
  height: 100%;
  height: calc(100vh - 2px);
  overflow-y: scroll;
  scrollbar-width: none;
      
  .identityIcon {
    display: flex;
    justify-content: center;
    margin: 0 auto;
    width: 80px;
    height: 80px;
    margin-bottom: 18px;

    & svg {
      width: 80px;
      height: 80px;
    }
  }

  &::-webkit-scrollbar {
    display: none;
  }
  `
    )
  )
);
