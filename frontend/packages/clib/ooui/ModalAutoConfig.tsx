import { cloneElement, ReactElement } from 'react';
import { ModalProps } from 'antd';
import { observer } from 'mobx-react';

type OperateProps = {
  children: ReactElement
} & ModalProps

export function ModalAutoConfig_(p: OperateProps) {
  const modal = p.children;
  return cloneElement(modal, {
      visible: true,
      mask: true,
      maskClosable: false,
      closable: false,
      destroyOnClose: true,
  } as ModalProps);
}

export const ModalAutoConfig = observer(ModalAutoConfig_);