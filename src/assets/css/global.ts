import { createGlobalStyle, css } from 'styled-components';

export const globalStyles = css`
  body,
  html,
  #root {
    min-height: 100vh;
    height: auto;
  }

  body {
    overflow: hidden;
    margin: 0;
    padding: 0;
  }
`;

export const GlobalStyle = createGlobalStyle`${globalStyles}`;
