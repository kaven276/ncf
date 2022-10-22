
import React from 'react';
import { Helmet, } from "@ncf/mw-react-server-render";
import styled, { keyframes } from 'styled-components';

const Header = styled.h1<{
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}>`
  color: red;
  background: blue;
`;

// Create the keyframes
const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

// Here we create a component that will rotate everything we pass in over two seconds
const Rotate = styled.div`
  display: inline-block;
  padding: 2rem 1rem;
  font-size: 1.2rem;
  &:hover {
    animation: ${rotate} 2s linear infinite;
  }
`;

interface ButtonProps {
  /** 是否是首要按钮 */
  primary?: boolean;
}
const Button = styled.button<ButtonProps>`
  /* Adapt the colors based on primary prop */
  background: ${props => props.primary ? "palevioletred" : "white"};
  color: ${props => props.primary ? "white" : "palevioletred"};
  font-size: 1em;
  margin: 1em;
  padding: 0.25em 1em;
  border: 2px solid palevioletred;
  border-radius: 3px;
`;

// Static object
const Box = styled.div({
  background: 'palevioletred',
});

// Adapting based on props
const PropsBox = styled(Box)((props: {
  $background: string,
}) => ({
  display: 'inline-block',
  $background: props.$background,
  padding: '50px',
  margin: '50px',
  border: '1px solid silver',
  borderRadius: '8px',
}));

export const faas = async (req: ButtonProps) => {
  return (
    <div>
      <Helmet>
        <title>styled component example</title>
      </Helmet>
      <Header level={4}>header</Header>
      <div>
        <Button primary={req.primary} id='a'>click me</Button>
        <Button as="a" href="/">click me</Button>
      </div>
      <Box>
        <Rotate>waiting...</Rotate>
      </Box>
      <PropsBox $background="silver">
        <Rotate>waiting...</Rotate>
      </PropsBox>
    </div>
  )
}
