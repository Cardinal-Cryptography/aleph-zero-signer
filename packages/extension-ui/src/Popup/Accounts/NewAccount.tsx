// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ThemeProps } from '../../types';

import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import styled from 'styled-components';

import { AuthUrls } from '@polkadot/extension-base/background/handlers/State';
import { AccountJson } from '@polkadot/extension-base/background/types';
import getNetworkMap from '@polkadot/extension-ui/util/getNetworkMap';

import { AccountContext, ActionContext, Button, ButtonArea, RemoveAuth, VerticalSpace } from '../../components';
import Checkbox from '../../components/Checkbox';
import useTranslation from '../../hooks/useTranslation';
import { getAuthList, updateAuthorization } from '../../messaging';
import { AccountSelection, Header } from '../../partials';
import { createGroupedAccountData } from '../../util/createGroupedAccountData';

interface Props extends RouteComponentProps, ThemeProps {
  className?: string;
}

const CustomButtonArea = styled(ButtonArea)`
  padding-top: 16px;
  padding-bottom: 0px;
`;

function NewAccount({ className, location: { search } }: Props): React.ReactElement<Props> {
  const { hierarchy, selectedAccounts = [], setSelectedAccounts } = useContext(AccountContext);
  const [authList, setAuthList] = useState<AuthUrls | null>(null);

  const { t } = useTranslation();
  const onAction = useContext(ActionContext);
  const searchParams = new URLSearchParams(search);
  const url = searchParams.get('url');
  const networkMap = useMemo(() => getNetworkMap(), []);
  const { flattened, getParentName } = useMemo(() => createGroupedAccountData(hierarchy), [hierarchy]);
  let test: AccountJson[] = [];

  console.log('url', url);

  useEffect(() => {
    getAuthList()
      .then(({ list }) => setAuthList(list))
      .catch((e) => console.error(e));
  }, []);

  useEffect(() => {
    getAuthList()
      .then(({ list }) => {
        if (url && !list[url]) {
          return;
        }

        if (url && setSelectedAccounts) {
          setSelectedAccounts(list[url].authorizedAccounts);
        }
      })
      .catch(console.error);
  }, [setSelectedAccounts, url]);

  if (authList && url) {
    test = flattened.filter((account) => {
      if (account.whenCreated) {
        return account.whenCreated > authList[url].lastAuth;
      }

      return false;
    });
  }

  const _onApprove = useCallback((): void => {
    if (!url) {
      return;
    }

    updateAuthorization(selectedAccounts, url)
      .then(() => onAction('/auth-list'))
      .catch(console.error);
  }, [onAction, selectedAccounts, url]);

  const _onCancel = useCallback((): void => {
    onAction('/auth-list');
  }, [onAction]);

  return (
    <>
      <Header
        smallMargin={true}
        text={t<string>('Connected accounts')}
        withBackArrow
      />
      <div className={className}>
        {url && (
          <>
            <RemoveAuth url={url} />
            {test.length > 0 && test.map((account) => <div key={account.address}>{account.name}</div>)}
            <AccountSelection
              className='accountSelection'
              showHidden={true}
              url={url}
              withWarning={false}
            />
          </>
        )}
      </div>
      <VerticalSpace />
      <CustomButtonArea>
        <Button
          onClick={_onCancel}
          secondary
        >
          {t<string>('Cancel')}
        </Button>
        <Button
          className='acceptButton'
          onClick={_onApprove}
        >
          {t<string>('Change')}
        </Button>
      </CustomButtonArea>
    </>
  );
}

export default withRouter(styled(NewAccount)`
  margin-top: -16px;
  overflow: hidden;
  .accountSelection {
    ${Checkbox} {
        margin-right: 16px;
      }
    .accountList {
      height: 350px;
      padding: 0px 8px;
    }
  }
  .acceptButton {
    width: 90%;
    margin: 0.5rem auto 0;
  }
`);