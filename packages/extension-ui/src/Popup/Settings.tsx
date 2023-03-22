// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ThemeProps } from '../types';

import React from 'react';
import styled from 'styled-components';

import infoIcon from '../assets/information.svg';
import trustedIcon from '../assets/trusted.svg';
import { EditMenuCard, Svg } from '../components';
import { useGoTo } from '../hooks/useGoTo';
import useTranslation from '../hooks/useTranslation';
import Header from '../partials/Header';

interface Props extends ThemeProps {
  className?: string;
}

const SettingsMenuCard = styled(EditMenuCard)`
  margin-bottom: 4px;
  .description {
    width: 24px
  }
`;

function Settings({ className }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { goTo } = useGoTo();

  return (
    <>
      <Header
        goToFnOverride={goTo('/')}
        text={t<string>('Settings')}
        withBackArrow
        withHelp
      />
      <div className={className}>
        <SettingsMenuCard
          description=''
          onClick={goTo('/auth-list')}
          position='top'
          preIcon={
            <Svg
              className='icon'
              src={trustedIcon}
            />
          }
          tabIndex={0}
          title={t<string>('Trusted Apps')}
        />
        <SettingsMenuCard
          description=''
          onClick={goTo('/about')}
          position='bottom'
          preIcon={
            <Svg
              className='icon'
              src={infoIcon}
            />
          }
          tabIndex={0}
          title={t<string>('About Aleph Zero Signer')}
        />
      </div>
    </>
  );
}

export default React.memo(
  styled(Settings)(
    ({ theme }: Props) => `
  color: ${theme.textColor};
  height: 100%;
  height: calc(100vh - 2px);
  overflow-y: scroll;
  scrollbar-width: none;
      
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
