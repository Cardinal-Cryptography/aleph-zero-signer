// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect } from 'react';
import styled from 'styled-components';

import useTranslation from '@polkadot/extension-ui/hooks/useTranslation';

import Hero from './Hero/Hero';

type Props = {
  successType: 'created' | 'imported';
};

const AccountCreationSuccess = ({ successType }: Props) => {
  const { t } = useTranslation();

  useEffect(() => {
    const timeoutId = setTimeout(window.close, 2000);

    return () => clearTimeout(timeoutId);
  }, []);

  const headerText = {
    created: t('Account created successfully!'),
    imported: t('New account has been imported successfully!')
  }[successType];

  return (
    <Container>
      <Hero
        headerText={headerText}
        iconType='success'
      />
    </Container>
  );
};

export default AccountCreationSuccess;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 200px;
`;
