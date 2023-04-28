// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useCallback, useEffect, useState } from 'react';

import { InputWithLabel, ValidatedInput } from '../components';
import PasswordField from '../components/PasswordField';
import useTranslation from '../hooks/useTranslation';
import { allOf, isSameAs } from '../util/validators';

interface Props {
  isFocussed?: boolean;
  onChange: (password: string | null) => void;
  label?: string;
}

export default function Password({ label, onChange }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const [pass1, setPass1] = useState<string>('');
  const [pass2, setPass2] = useState<string>('');
  const isSecondPasswordValid = useCallback(
    (firstPassword: string) => allOf(isSameAs(firstPassword, t<string>('Passwords do not match'))),
    [t]
  );

  useEffect((): void => {
    onChange(pass1 && pass2 ? pass1 : null);
  }, [onChange, pass1, pass2]);

  return (
    <>
      <PasswordField
        label={label || t<string>('Set password')}
        onValidatedChange={setPass1}
        validationUserInput={[]}
      />
      <ValidatedInput
        component={InputWithLabel}
        data-input-repeat-password
        label={t<string>('Confirm password')}
        onValidatedChange={setPass2}
        type='password'
        validator={isSecondPasswordValid(pass1)}
      />
    </>
  );
}
