
import { withThemeFromJSXProvider } from '@storybook/addon-styling';
import { ThemeProvider } from 'styled-components';
import { themes } from '../packages/extension-ui/src/components/themes'
import { BodyTheme } from '../packages/extension-ui/src/components/View'

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
    viewport: {
      defaultViewport: "narrow",
      viewports: {
        narrow: {
          name: "narrow",
          type: "mobile",
          styles: {
            width: "360px",
            height: "625px",
          }
        }
      },
    },
    backgrounds: {
      default: "dark",
      values: [{
        name: "dark",
        value: themes.dark.background,
      }]
    }
  },
};

export default preview;

export const decorators = [
  withThemeFromJSXProvider({
    GlobalStyles: BodyTheme,
    Provider: ThemeProvider,
    themes: {
      dark: themes.dark
    },
    defaultTheme: 'dark'
  }),
];
