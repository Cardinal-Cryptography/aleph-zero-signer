// Copyright 2019-2023 @polkadot/extension-bg authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { z } from 'zod';

export default <Z extends z.ZodType, D extends z.infer<Z>>(schema: Z, defaultValue?: D) => (namespace: string) => {
  type Content = z.infer<Z>
  type CurrentContent = Content
  type NewContent = Content

  const get = async (): Promise<Content> => {
    try {
      const { [namespace]: storageContent = defaultValue } = await chrome.storage.local.get([namespace]);

      return schema.parse(storageContent as unknown); // eslint-disable-line @typescript-eslint/no-unsafe-return
    } catch (e) {
      console.error(`The content of the "${namespace}" namespace in local storage does not match the schema:`, e);

      if (defaultValue) {
        return defaultValue; // eslint-disable-line @typescript-eslint/no-unsafe-return
      } else {
        throw e;
      }
    }
  };

  const set = async (value: Content) => {
    await chrome.storage.local.set({ [namespace]: value });
  };

  const update = async (updater: (currentContent: CurrentContent) => NewContent): Promise<NewContent> => {
    const currentContent = await get();

    const newContent = updater(currentContent);

    await chrome.storage.local.set({ [namespace]: newContent });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return newContent;
  };

  return {
    get,
    set,
    update
  };
};
