// @flow
const spinnerImgSrc = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCAyNCAyNCI+CjxjaXJjbGUgb3BhY2l0eT0nMC4yNScgY3g9IjEyIiBjeT0iMTIiIHI9IjEwIiBzdHJva2U9IiNGRkZGRkYiIHN0cm9rZS13aWR0aD0iNCI+PC9jaXJjbGU+CjxwYXRoIG9wYWNpdHk9JzAuNzUnIGZpbGw9IiNGRkZGRkYiIGQ9Ik00IDEyYTggOCAwIDAxOC04VjBDNS4zNzMgMCAwIDUuMzczIDAgMTJoNHptMiA1LjI5MUE3Ljk2MiA3Ljk2MiAwIDAxNCAxMkgwYzAgMy4wNDIgMS4xMzUgNS44MjQgMyA3LjkzOGwzLTIuNjQ3eiI+PC9wYXRoPgo8L3N2Zz4=`;

export const displayBlackLoadingScreen = (externalWindow: WindowProxy) => {
  externalWindow.document.write(
    `<html>
  <head>
    <style>
      body {
        margin: 0;
        padding: 0;
        background-color: #000000;
        overflow: hidden;
        height: 100vh;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
      }
      @keyframes spin {
        100% {
          transform:rotate(360deg);
        }
      }
      .spinning-loader {
        animation: spin 3s linear infinite;
      }
    </style>
  </head>
  <body>
      <img class="spinning-loader" width="50" alt="Loading..." src="${spinnerImgSrc}">
  </body>
</html>`
  );
};
