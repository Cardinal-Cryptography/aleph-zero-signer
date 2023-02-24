// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useCallback, useContext, useEffect, useState } from 'react';
import styled from 'styled-components';

import { PASSWORD_EXPIRY_MIN } from '@polkadot/extension-base/defaults';

import {
  ActionBar,
  ActionContext,
  BottomWrapper,
  Button,
  ButtonArea,
  Checkbox,
  Link,
  VerticalSpace
} from '../../../components';
import useTranslation from '../../../hooks/useTranslation';
import { approveSignPassword, cancelSignRequest, isSignLocked } from '../../../messaging';
import Unlock from '../Unlock';

interface Props {
  buttonText: string;
  className?: string;
  error: string | null;
  isExternal?: boolean;
  isFirst: boolean;
  setError: (value: string | null) => void;
  signId: string;
}

function SignArea({ buttonText, className, error, isExternal, isFirst, setError, signId }: Props): JSX.Element {
  const [savePass, setSavePass] = useState(false);
  const [isLocked, setIsLocked] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const onAction = useContext(ActionContext);
  const { t } = useTranslation();
  const _goTo = useCallback((path: string) => () => onAction(path), [onAction]);

  useEffect(() => {
    setIsLocked(null);
    let timeout: NodeJS.Timeout;

    !isExternal &&
      isSignLocked(signId)
        .then(({ isLocked, remainingTime }) => {
          setIsLocked(isLocked);
          timeout = setTimeout(() => {
            setIsLocked(true);
          }, remainingTime);

          // if the account was unlocked check the remember me
          // automatically to prolong the unlock period
          !isLocked && setSavePass(true);
        })
        .catch((error: Error) => console.error(error));

    return () => {
      !!timeout && clearTimeout(timeout);
    };
  }, [isExternal, signId]);

  const _onSign = useCallback((): void => {
    setIsBusy(true);
    approveSignPassword(signId, savePass, password)
      .then((): void => {
        setIsBusy(false);
      })
      .catch((error: Error): void => {
        setIsBusy(false);
        setError(error.message);
        console.error(error);
      });
  }, [password, savePass, setError, signId]);

  const _onCancel = useCallback((): void => {
    cancelSignRequest(signId)
      .then(() => _goTo('transaction-declined'))
      .catch((error: Error) => console.error(error));
  }, [_goTo, signId]);

  const StyledCheckbox = styled(Checkbox)`
  margin-left: 8px;
`;

  const RememberPasswordCheckbox = () => (
    <StyledCheckbox
      checked={savePass}
      label={
        isLocked
          ? t<string>('Remember password for {{expiration}} minutes', {
              replace: { expiration: PASSWORD_EXPIRY_MIN }
            })
          : t<string>('Extend the period without password by {{expiration}} minutes', {
              replace: { expiration: PASSWORD_EXPIRY_MIN }
            })
      }
      onChange={setSavePass}
    />
  );

  const CustomButtonArea = styled(ButtonArea)`
  padding: 0px 24px;
  margin-bottom: 0px;
  `;

  return (
    <>
      <div className={className}>
        {isFirst && !isExternal && (
          <>
            {isLocked && (
              <Unlock
                error={error}
                isBusy={isBusy}
                onSign={_onSign}
                password={password}
                setError={setError}
                setPassword={setPassword}
              />
            )}
            <RememberPasswordCheckbox />
          </>
        )}
      </div>
      <CustomButtonArea>
        <Button
          isDanger
          onClick={_onCancel}
          secondary
        >
          {t<string>('Decline')}
        </Button>
        <Button
          isBusy={isBusy}
          isDisabled={(!!isLocked && !password) || !!error}
          isSuccess
          // eslint-disable-next-line react/jsx-no-bind
          onClick={() => {
            _onSign();
            onAction('transaction-signed');
          }}
        >
          {buttonText}
        </Button>
      </CustomButtonArea>
    </>
  );
}

export default styled(SignArea)`
  flex-direction: column;
  padding: 6px 8px;
`;
