import React, { createElement } from 'react';
import { render } from 'react-dom';
import { observable, action } from 'mobx';
import { observer } from 'mobx-react';

/** 配置 modal 为视图或者清空 */
const modalHolder = observable({
  modal: null as React.ReactElement | null,
});

export const setModal = action((modal: React.ReactElement | null) => {
  modalHolder.modal = modal;
})

const anchorElement = document.createElement('div');
document.body.append(anchorElement);

function ModalAnchor_() {
  console.log(modalHolder.modal);
  return modalHolder.modal;
}

const ModalAnchor = observer(ModalAnchor_);

// 提供 ooui 操作弹出层的渲染放置地
render(createElement(ModalAnchor), anchorElement);
