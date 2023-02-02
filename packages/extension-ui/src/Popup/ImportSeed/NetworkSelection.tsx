// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useCallback, useState } from 'react';
import styled from 'styled-components';

import { Address, BackButton, Button, ButtonArea, Dropdown, InputWithLabel, VerticalSpace } from '../../components';
import useTranslation from '../../hooks/useTranslation';
import { ThemeProps } from '../../types';

interface Props extends ThemeProps {
  address: string | null;
  name: string;
  className?: string;
  onChange: (genesis: string) => void;
  options: string;
  value: string;
  onNextStep: () => void;
  onPreviousStep: () => void;
}

function NetworkSelection({
  address,
  className,
  name,
  onChange,
  onNextStep,
  onPreviousStep,
  options,
  value
}: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const [advanced, setAdvanced] = useState(false);
  const [path, setPath] = useState<string | null>(null);

  const _onToggleAdvanced = useCallback(() => {
    setAdvanced(!advanced);
  }, [advanced]);

  return (
    <>
      <div className={className}>
        <Address
          address={address}
          name={name}
        />
        <Dropdown
          className='genesisSelection'
          label={t<string>('Network')}
          onChange={onChange}
          options={options}
          value={value}
        />
        <div
          className='advancedToggle'
          onClick={_onToggleAdvanced}
        >
          <FontAwesomeIcon icon={advanced ? faChevronDown : faChevronUp} />
          <span>{t<string>('Advanced')}</span>
        </div>
        {advanced && (
          <InputWithLabel
            className='derivationPath'
            isError={!!path}
            label={t<string>('Sub-account path')}
            onChange={setPath}
            value={path || ''}
          />
        )}
      </div>
      <VerticalSpace />
      <ButtonArea>
        <BackButton onClick={onPreviousStep} />
        <Button
          data-button-action='add new root'
          onClick={onNextStep}
        >
          {t<string>('Next')}
        </Button>
      </ButtonArea>
    </>
  );
}

export default React.memo(
  styled(NetworkSelection)(
    ({ theme }: ThemeProps) => `
    margin-top: 20px;
    
    .advancedToggle {
        color: ${theme.textColor};
        cursor: pointer;
        line-height: ${theme.lineHeight};
        letter-spacing: 0.04em;
        opacity: 0.65;
        margin-top: 16px;
    
        > span {
          font-size: ${theme.inputLabelFontSize};
          margin-left: 8px;
          vertical-align: middle;
        }
      }

`
  )
);
