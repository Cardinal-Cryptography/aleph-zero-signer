// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useCallback, useContext, useRef, useState } from 'react';
import { noop } from 'rxjs';

import { SnackbarTypes } from '../../types';
import { ActionContext } from '../contexts';
import { ToastContext } from '..';
import Toast from './Toast';

interface ToastProviderProps {
  children?: React.ReactNode;
}

export const TOAST_TIMEOUT = 2500;

const ToastProvider = ({ children }: ToastProviderProps): React.ReactElement<ToastProviderProps> => {
  const [content, setContent] = useState('');
  const [visible, setVisible] = useState(false);
  const [type, setType] = useState<SnackbarTypes>('info');
  const method = useRef<NodeJS.Timeout>();
  const [timerId, setTimerId] = useState<NodeJS.Timeout>();
  const onAction = useContext(ActionContext);

  const cancelCallback = useCallback(
    (shouldRedirectBack: boolean) => {
      setVisible(false);
      clearTimeout(method.current);
      method.current = undefined;
      shouldRedirectBack && onAction('/');
    },
    [onAction]
  );

  const show = useCallback(
    (message: string, type: SnackbarTypes = 'info', callback?: () => void): (() => void) => {
      if (visible) {
        return noop;
      }

      if (callback) {
        method.current = setTimeout(() => callback(), TOAST_TIMEOUT);
      }

      const timerId = setTimeout(() => {
        setVisible(false);
        cancelCallback(false);
      }, TOAST_TIMEOUT);

      setTimerId(timerId);
      setContent(message);
      setVisible(true);

      if (type) {
        setType(type);
      }

      return (): void => {
        clearTimeout(timerId);
        cancelCallback(false);
      };
    },
    [cancelCallback, visible]
  );

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <Toast
        content={content}
        onUndoClick={cancelCallback}
        setVisible={setVisible}
        toastTimeout={timerId}
        type={type}
        undoTimeout={method.current}
        visible={visible}
      />
    </ToastContext.Provider>
  );
};

export default ToastProvider;

ToastProvider.displayName = 'Toast';
