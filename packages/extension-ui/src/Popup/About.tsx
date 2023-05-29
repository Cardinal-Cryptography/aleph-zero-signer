// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ThemeProps } from '../types';

import React from 'react';
import styled from 'styled-components';

import alephMark from '../assets/alephMark.svg';
import { EditMenuCard, IconHeader } from '../components';
import useTranslation from '../hooks/useTranslation';
import { LINKS } from '../links';
import Header from '../partials/Header';

interface Props extends ThemeProps {
  className?: string;
}

const AboutMenuCard = styled(EditMenuCard)`
  padding: 0px 16px;
  margin-bottom: 16px;
  border-radius: 8px;
`;

function About({ className }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();

  return (
    <>
      <Header
        text={t<string>('About Aleph Zero Signer')}
        withBackArrow
        withHelp
      />
      <div className={className}>
        <StyledIconHeader
          headerText={t<string>('Aleph Zero Signer')}
          iconType='aleph'
        >
          {t<string>('Version')}&nbsp;{t<string>('version-number')}
        </StyledIconHeader>
        <AboutMenuCard
          description=''
          extra='link'
          link={LINKS.GENERAL_INTRODUCTION}
          position='bottom'
          title={t<string>('Help & Support')}
        />
        <AboutMenuCard
          description=''
          extra='link'
          link={LINKS.TERMS_OF_SERVICE}
          position='bottom'
          title={t<string>('Terms of Service')}
        />
        <AboutMenuCard
          description=''
          extra='link'
          link={LINKS.PRIVACY_POLICY}
          position='bottom'
          title={t<string>('Privacy Policy')}
        />
        <AboutMenuCard
          description=''
          extra='link'
          link={LINKS.MAIN_WEBSITE}
          position='bottom'
          title={t<string>('Visit Website')}
        />
      </div>
    </>
  );
}

const StyledIconHeader = styled(IconHeader)`
  margin-bottom: 32px;
`;

export default React.memo(
  styled(About)(
    ({ theme }: Props) => `
  color: ${theme.textColor};
  height: 100%;
  height: calc(100vh - 2px);
  overflow-y: scroll;
  scrollbar-width: none;
  margin-top: 38px;
      
  &::-webkit-scrollbar {
    display: none;
  }

  .icon {
    width: 20px;
    height: 20px;
    background: ${theme.primaryColor};
  }
  `
  )
);
