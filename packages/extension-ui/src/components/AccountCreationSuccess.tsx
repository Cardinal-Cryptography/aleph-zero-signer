// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import styled from 'styled-components';

import useTranslation from '@polkadot/extension-ui/hooks/useTranslation';

import clearClipboard from '../util/clearClipboard';
import { Button, ButtonArea, IconHeader, VerticalSpace, WarningBox } from './index';

const AccountCreationSuccess = () => {
  const { t } = useTranslation();

  useEffect(() => {
    // clear clipboard when user closes current window
    window.addEventListener('beforeunload', clearClipboard);

    return () => window.removeEventListener('beforeunload', clearClipboard);
  }, []);

  return (
    <Container>
      <IconHeader
        headerText={t('Account created successfully!')}
        iconType='success'
      />
      <VerticalSpace />
      <WarningBox
        description={t<string>('Your clipboard will be cleared on closing of this screen.')}
        title={t<string>('Your secret phrase is safe!')}
      />
      <ButtonArea>
        <CopyToClipboard
          onCopy={window.close}
          text=' '
        >
          <Button secondary>
            <div>{t<string>('Got it!')}</div>
          </Button>
        </CopyToClipboard>
      </ButtonArea>
    </Container>
  );
};

export default AccountCreationSuccess;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-top: 160px;
  flex-grow: 1;
`;
