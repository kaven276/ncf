import { Modal } from 'antd';

/** 询问用户是否取消不再继续，cancel 则最终返回 true */
export async function cancelPromise(content: string) {
  return new Promise(resolve => {
    Modal.confirm({
      content: content,
      onOk: () => resolve(false),
      onCancel: () => resolve(true),
    })
  });
}
