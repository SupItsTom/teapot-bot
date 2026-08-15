import infima from 'infima/dist/css/default/default.css';
import css from '../styles/custom.css';

export function renderPage(content) {
	return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light dark">

  <title>Teapot Bot</title>

  <style>
    ${infima}
    ${css}
  </style>
</head>

<body>
  ${content}
</body>
</html>`;
}
