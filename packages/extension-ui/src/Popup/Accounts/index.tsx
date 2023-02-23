// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ThemeProps } from '../../types';

import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';

import { AccountJson, AccountWithChildren } from '@polkadot/extension-base/background/types';
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
  const defaultNetwork = 'any';

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

  interface GroupedData {
    [key: string]: AccountWithChildren[];
  }

  const flattened: AccountJson[] = filteredAccount.reduce((acc: AccountJson[], next) => {
    if (next.children) {
      next.children.forEach((c) => acc.push(c));
      delete next.children;
    }

    acc.push(next);

    return acc;
  }, []);

  const children = flattened.filter((item) => item.parentAddress);

  const parents = flattened.filter((item) => !item.parentAddress);

  const groupedParents: GroupedData = parents.reduce(
    (acc: GroupedData, next: AccountWithChildren) => {
      const { genesisHash } = next;
      const foundKey = Object.keys(knownGenesis).find((key) => knownGenesis[key].includes(genesisHash ?? ''));

      if (!foundKey) {
        acc.any.push(next);
      } else {
        acc[foundKey] = (acc[foundKey] ?? []).concat(next);
      }

      return acc;
    },
    { any: [] }
  );

  function filterChildren(
    children: AccountJson[],
    networkName: string,
    defaultNetwork: string,
    details: AccountWithChildren[]
  ) {
    return children.filter((child) => {
      if (!child.genesisHash && networkName === defaultNetwork) {
        return true;
      }

      return details.some((d) => d.genesisHash === child.genesisHash);
    });
  }

  function getParentName(parents: AccountJson[], child: AccountJson) {
    const parent = parents.find((i) => i.address === child.parentAddress);

    return parent?.name;
  }

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
              {Object.entries(groupedParents).map(([networkName, details]) => (
                <div key={networkName}>
                  {networkName !== defaultNetwork && <span className='network-heading'>{networkName}</span>}
                  {details.map((json) => (
                    <AccountsTree
                      {...json}
                      key={json.address}
                    />
                  ))}
                  {filterChildren(children, networkName, defaultNetwork, details).map((json) => (
                    <AccountsTree
                      {...json}
                      key={json.address}
                      parentName={getParentName(parents, json)}
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
    padding: 8px 0 8px 8px;
    margin: 24px 0 16px 0;
    border-bottom: 1px solid ${theme.boxBorderColor};
  }
`
);
