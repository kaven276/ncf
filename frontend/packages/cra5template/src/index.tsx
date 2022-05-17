import { render } from 'react-dom';
import App from './app';
import { createElement } from 'react';

render(createElement(App), document.getElementById('root')!);