// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ThemeProps } from '../../types';

import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';

import { AccountWithChildren } from '@polkadot/extension-base/background/types';
import getNetworkMap from '@polkadot/extension-ui/util/getNetworkMap';
import { knownGenesis } from '@polkadot/networks/defaults';

import { AccountContext, AddButton, ButtonArea, ScrollWrapper, VerticalSpace } from '../../components';
import useTranslation from '../../hooks/useTranslation';
import { Header } from '../../partials';
import AccountsTree from './AccountsTree';
import AddAccount from './AddAccount';

interface Props extends ThemeProps {
  className?: string;
}

function Accounts({ className }: Props): React.ReactElement {
  const { t } = useTranslation();
  const [filter, setFilter] = useState('');
  const [filteredAccount, setFilteredAccount] = useState<AccountWithChildren[]>([]);
  const { hierarchy } = useContext(AccountContext);
  const networkMap = useMemo(() => getNetworkMap(), []);

  useEffect(() => {
    setFilteredAccount(
      filter
        ? hierarchy.filter(
            (account) =>
              account.name?.toLowerCase().includes(filter) ||
              (account.genesisHash && networkMap.get(account.genesisHash)?.toLowerCase().includes(filter))
          )
        : hierarchy
    );
  }, [filter, hierarchy, networkMap]);

  const _onFilter = useCallback((filter: string) => {
    setFilter(filter.toLowerCase());
  }, []);

  console.log('filteredAccount', filteredAccount);
  console.log('knownGenesis', knownGenesis);

  // knownGenesis.js
  const accountsByGenesisHash: { [key: string]: AccountWithChildren[] } = filteredAccount.reduce(
    (result: { [key: string]: AccountWithChildren[] }, account) => {
      const { genesisHash } = account;
      const foundKey = Object.keys(knownGenesis).find((key) => knownGenesis[key].includes(genesisHash ?? ''));

      if (!foundKey) {
        if (!result.any) {
          result.any = [];
        }

        result.any.push(account);

        return result;
      }

      if (!result[foundKey]) {
        result[foundKey] = [];
      }

      const accountWithChildren: AccountWithChildren = { ...account };

      if (account.parentAddress) {
        const parentAccount = filteredAccount.find(({ address }) => address === account.parentAddress);

        if (parentAccount) {
          if (!parentAccount.children) {
            parentAccount.children = [];
          }

          parentAccount.children.push(accountWithChildren);

          return result;
        }
      }

      result[foundKey].push(accountWithChildren);

      return result;
    },
    {}
  );

  console.log('accountsByGenesisHash', accountsByGenesisHash);

  return (
    <>
      {hierarchy.length === 0 ? (
        <AddAccount />
      ) : (
        <>
          <Header
            onFilter={_onFilter}
            showConnectedAccounts
            text={t<string>('Accounts')}
            withHelp
            withSettings
          />
          <ScrollWrapper>
            <div className={className}>
              {Object.keys(accountsByGenesisHash).map((genesisHash) => (
                <div key={genesisHash}>
                  {genesisHash !== 'any' && <span className='network-heading'>{genesisHash}</span>}
                  {accountsByGenesisHash[genesisHash].map((json, index) => (
                    <AccountsTree
                      {...json}
                      key={`${index}:${json.address}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </ScrollWrapper>
          <VerticalSpace />
          <ButtonArea>
            <AddButton />
          </ButtonArea>
        </>
      )}
    </>
  );
}

export default styled(Accounts)(
  ({ theme }: Props) => `
  height: calc(100vh - 2px);
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  .network-heading {
    display: flex;
    align-items: center;
    font-family: ${theme.secondaryFontFamily};
    font-style: normal;
    font-weight: 300;
    font-size: 11px;
    line-height: 120%;
    text-align: right;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: ${theme.subTextColor};
    padding: 8px 0 0 8px;
    margin: 24px 0 16px 0;
    border-bottom: 1px solid ${theme.boxBorderColor};
  }
`
);
