import { render } from 'react-dom';
import App from './app';
import { createElement } from 'react';
import './call';

render(createElement(App), document.getElementById('root')!);
