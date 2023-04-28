// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useCallback, useState } from 'react';
import styled from 'styled-components';

import InputWithLabel from '../InputWithLabel';
import getFeedback, { isPasswordTooWeak, ValidationResult } from './getFeedback';
import PasswordFeedback from './PasswordFeedback';

type Props = {
  className?: string;
  label: string;
  onValidatedChange: (value: string) => void;
  validationUserInput?: Array<string>;
}



function PasswordField({
  className,
  label,
  onValidatedChange,
  validationUserInput,
}: Props): React.ReactElement {
  const [isTouched, setIsTouched] = useState<boolean>(false);
  const [value, setValue] = useState<string>('');
  const [passwordFeedback, setPasswordFeedback] = useState<ValidationResult>({score: 0, warning: '', suggestions: []});

  const validateValue = useCallback((value: string): void => {
    const feedback = getFeedback(value, validationUserInput);

    setValue(value);
    setPasswordFeedback(feedback);
    setIsTouched(true);

    if (!isPasswordTooWeak(feedback)) {
      onValidatedChange(value);
    }

  }, [validationUserInput, onValidatedChange]);

  return (
    <div className={className}>
      <InputWithLabel
        isError={isTouched && isPasswordTooWeak(passwordFeedback)}
        label={label}
        onChange={validateValue}
        type='password'
        value={value}
      />
      {isTouched && <StyledPasswordFeedback feedback={passwordFeedback} />}
    </div>
  );
}

export const StyledPasswordFeedback = styled(PasswordFeedback)`
  margin-top: -8px;
  margin-bottom: 16px;
`;

export default PasswordField;
