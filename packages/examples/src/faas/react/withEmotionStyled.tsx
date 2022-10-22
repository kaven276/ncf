import React from 'react';
import styled from '@emotion/styled';

/*
emotion 需要 yarn add @emotion/react @emotion/styled，后者需要前者一同安装才能使用。
服务端渲染直接自然支持，无需对 @ncf/mw-react-server-renderer 做任何调整。
就凭这一点来说，emotion SSR 就优于 styled-components(需要中间件特别支持才行)
参考：https://emotion.sh/docs/ssr
*/

const Button = styled.button({
  color: 'turquoise',
  padding: 4,
  marginLeft: 2,
  marginRight: 2,
});

export const faas = async () => {
  return (
    <div>
      <span>emotion</span>
      <Button>styled button</Button>
    </div>
  )
}
