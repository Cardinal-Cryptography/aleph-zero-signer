// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

export function getFaviconUrl(url: string): string {
  try {
    const domain = new URL(url).hostname;

    return `https://www.google.com/s2/favicons?domain=${domain}`;
  } catch (error) {
    console.error('An error occurred while parsing URL:', error);

    return '';
  }
}
