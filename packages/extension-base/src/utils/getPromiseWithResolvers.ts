// Copyright 2019-2023 @polkadot/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0

type PromiseExecutorParameters<T> = Parameters<ConstructorParameters<typeof Promise<T>>[0]>;
type Resolve<T> = PromiseExecutorParameters<T>[0];
type Reject<T> = PromiseExecutorParameters<T>[1];

const PLACEHOLDER_FN = () => { /* placeholder */ };

export const getPromiseWithResolvers = <T = unknown>() => {
  let resolveFn: Resolve<T> = PLACEHOLDER_FN;
  let rejectFn: Reject<T> = PLACEHOLDER_FN;

  const promise = new Promise<T>((resolve, reject) => {
    resolveFn = resolve;
    rejectFn = reject;
  });

  return {
    promise,
    resolve: resolveFn,
    reject: rejectFn
  };
};
