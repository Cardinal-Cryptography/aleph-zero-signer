// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ThemeProps } from '../types';

import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';

import { validateSeed } from '@polkadot/extension-ui/messaging';
import { objectSpread } from '@polkadot/util';
import { KeypairType } from '@polkadot/util-crypto/types';

import { Warning } from '../components';
import useTranslation from '../hooks/useTranslation';
import { AccountInfo } from '../Popup/ImportSeed';
import MnemonicPill from './MnemonicPill';

interface Props extends ThemeProps {
  className?: string;
  onAccountChange: (account: AccountInfo | null) => void;
  type: KeypairType;
  seed: string | null;
  genesis: string;
  path: string | null;
  address: string;
  setAddress: (address: string) => void;
  error: string;
  setError: (error: string) => void;
  onChange: (seed: string) => void;
}

const MnemonicInput = ({
  address,
  className,
  error,
  genesis,
  onAccountChange,
  onChange,
  path,
  seed,
  setAddress,
  setError,
  type
}: Props) => {
  const [mnemonicWords, setMnemonicWords] = useState<string[]>(Array(12).fill(''));
  const { t } = useTranslation();

  const _handlePaste = useCallback(
    (event: React.ClipboardEvent) => {
      event.preventDefault();
      const MNEMONIC_LENGTH = 12;

      setMnemonicWords([]);
      const pastedWords = event.clipboardData.getData('text').trim().split(' ').slice(0, 12);
      const defaultValue = '';
      const fillArray = Array(MNEMONIC_LENGTH - pastedWords.length).fill(defaultValue);
      const result = pastedWords.concat(fillArray);

      setMnemonicWords(result);
      onChange(result.join(' '));
    },
    [onChange, setMnemonicWords]
  );

  const _handleChange = useCallback(
    (value: string, index: number) => {
      if (mnemonicWords.every((word) => word === '')) {
        return;
      }

      const newMnemonicWords = [...mnemonicWords];

      newMnemonicWords[index] = value;

      onChange(newMnemonicWords.join(' '));
      setMnemonicWords(newMnemonicWords.slice(0, 12));
    },
    [mnemonicWords, onChange, setMnemonicWords]
  );

  useEffect(() => {
    setMnemonicWords(seed ? seed.split(' ') : Array(12).fill(''));
  }, [seed]);

  useEffect(() => {
    // No need to validate an empty seed
    // we have a dedicated error for this
    if (!seed) {
      onAccountChange(null);

      return;
    }

    console.log('seed: ', seed);

    const suri = `${seed || ''}${path || ''}`;

    validateSeed(suri, type)
      .then((validatedAccount) => {
        console.log('validatedAccount: ', validatedAccount);
        setError('');
        setAddress(validatedAccount.address);
        onAccountChange(objectSpread<AccountInfo>({}, validatedAccount, { genesis, type }));
      })
      .catch(() => {
        setAddress('');
        onAccountChange(null);
        setError(path ? t<string>('Invalid mnemonic seed or derivation path') : t<string>('Invalid secret phrase'));
      });
  }, [t, genesis, seed, path, onAccountChange, type, setError, setAddress]);

  return (
    <div
      className={className}
      onPaste={_handlePaste}
    >
      <div className='mnemonic-container'>
        {mnemonicWords.map((word, index) => (
          <MnemonicPill
            className='mnemonic-pill'
            index={index + 1}
            isError={!!error && !!seed}
            key={index + 1}
            name={`input${index}`}
            onChange={_handleChange}
            readonly={false}
            word={mnemonicWords[index]}
            // eslint-disable-next-line react/jsx-no-bind
          />
        ))}
      </div>
      {!!error && !!seed && <Warning isDanger>{error}</Warning>}
    </div>
  );
};

export default styled(MnemonicInput)(
  ({ theme }: Props) => `

  .mnemonic-container {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-between;
    width: 100%;
    user-select: all;
  }

  .mnemonic-pill {
    width: 30%;
    margin-bottom: 8px;
  }

  .mnemonic-index {
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${theme.subTextColor};
    background: ${theme.menuBackground};
    min-width: 24px;
    min-height: 24px;
    font-weight: 300;
    font-size: 13px;
    line-height: 130%;
    border-radius: 50%;
  }
`
);
