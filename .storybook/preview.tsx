import React from 'react';

import chrome from 'sinon-chrome/extensions';

import '../jest/mockLocalStorage';
import { withThemeFromJSXProvider } from '@storybook/addon-styling';
import { ThemeProvider } from 'styled-components';
import { themes } from '../packages/extension-ui/src/components/themes'
import { BodyTheme } from '../packages/extension-ui/src/components/View'

import type { Preview } from '@storybook/react';
import { subscribeAccounts } from './__mocks__/messaging';
import Main from "../packages/extension-ui/src/components/Main";

/** @type { import('@storybook/react').Preview } */
const preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/,
      },
    },
    layout: 'centered',
    viewport: {
      defaultViewport: "popup",
      viewports: {
        popup: {
          name: "popup",
          type: "mobile",
          styles: {
            width: "360px",
            height: "600px",
          }
        },
        fullWidth: {
          name: "full width",
          type: "desktop",
        },
      },
    },
    backgrounds: {
      default: "dark",
      values: [
        {
          name: "dark",
          value: themes.dark.background,
        },
        {
          name: 'light',
          value: themes.light.background,
        }
      ]
    }
  },
};

export default preview;

export const decorators = [
  Story =>  <Main><Story /></Main>,
  withThemeFromJSXProvider({
    GlobalStyles: BodyTheme,
    Provider: ThemeProvider,
    themes: {
      dark: themes.dark
    },
    defaultTheme: 'dark'
  }),
  (Story) => {
    subscribeAccounts.setMockImpl((cb: Function) => cb([]));

    return <Story />;
  },
] satisfies Preview['decorators'];

chrome.runtime.connect.callsFake(() => ({
  onMessage: {
    addListener() {}
  },
  onDisconnect: {
    addListener() {}
  },
  postMessage() {}
}));
