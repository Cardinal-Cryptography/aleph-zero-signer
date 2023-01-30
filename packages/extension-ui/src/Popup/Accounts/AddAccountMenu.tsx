// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ThemeProps } from '../../types';

import React, { useCallback, useContext } from 'react';
import styled from 'styled-components';

import { MenuCard } from '@polkadot/extension-ui/components';

import addIcon from '../../assets/add.svg';
import uploadIcon from '../../assets/upload.svg';
import { ActionContext, Button, ButtonArea } from '../../components';
import useTranslation from '../../hooks/useTranslation';
import Header from '../../partials/Header';

interface Props extends ThemeProps {
  className?: string;
}

function AddAccountMenu({ className }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const onAction = useContext(ActionContext);

  const _goToAccountCreate = useCallback(() => onAction('/account/create'), [onAction]);

  const _goHome = useCallback(() => onAction('/'), [onAction]);

  const _goToImportSeed = useCallback(() => onAction('/account/import-seed'), [onAction]);

  return (
    <>
      <Header
        showBackArrow
        showHelp
        text={t<string>('Add Account')}
      />
      <div className={className}>
        <div className='add-account-menu'>
          <MenuCard
            description={t<string>('Generate a new public address')}
            onClick={_goToAccountCreate}
            preIcon={<img src={addIcon} />}
            title={t<string>('Create a new account')}
          />
          <MenuCard
            description={t<string>('Accounts created in other \n wallets are also supported')}
            onClick={_goToImportSeed}
            preIcon={<img src={uploadIcon} />}
            title={t<string>('Import an existing account')}
          />
        </div>
      </div>
      <ButtonArea>
        <Button
          onClick={_goHome}
          secondary
        >
          {t<string>('Cancel')}
        </Button>
      </ButtonArea>
    </>
  );
}

export default React.memo(styled(AddAccountMenu)(({ theme }: Props) => `
  color: ${theme.textColor};
  height: 100%;
  height: calc(100vh - 2px);
  overflow-y: scroll;
  scrollbar-width: none;
  
  .add-account-menu{
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &::-webkit-scrollbar {
    display: none;
  }
  `
  )
);
