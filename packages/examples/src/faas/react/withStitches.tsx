import React from 'react';
import * as st from '@stitches/react';
// import * as st from './stitches.config';

const scaleUp = st.keyframes({
  '0%': { transform: 'scale(1)' },
  '100%': { transform: 'scale(1.5)' },
});

const ButtonST = st.styled('button', {
  // backgroundColor: 'gainsboro',
  backgroundColor: '$gray400',
  borderRadius: '9999px',
  fontSize: '13px',
  padding: '10px 25px',
  '&:hover': {
    backgroundColor: 'lightgray',
    color: '$color$gray400',
    animation: `${scaleUp} 200ms`,
  },
  variants: {
    /** button 配色选项 */
    color: {
      violet: {
        backgroundColor: 'blueviolet',
        color: 'white',
        '&:hover': {
          backgroundColor: 'darkviolet',
        },
      },
      gray: {
        backgroundColor: 'gainsboro',
        '&:hover': {
          backgroundColor: 'lightgray',
        },
      },
    },
    size: {
      small: {
        fontSize: '13px',
        height: '25px',
        paddingRight: '10px',
        paddingLeft: '10px',
      },
      large: {
        fontSize: '15px',
        height: '35px',
        paddingLeft: '15px',
        paddingRight: '15px',
      },
    },
    outlined: {
      true: {
        borderColor: 'green',
      },
    },
  },
});

// CheckoutButton 的 className 带着 ButtonST 的
const CheckoutButton = st.styled(ButtonST, {
  '--c1': 'none'
});

const globalStyles = st.globalCss({
  '@supports (display: grid)': {
    body: {
      display: 'grid',
    },
  },
});

const Grid = st.styled('div', {
  '@supports (display: grid)': {
    display: 'grid',
  },
});

function StitchesDemo() {
  return (
    <div>
      <ButtonST>{ButtonST.toString()}</ButtonST>
      <ButtonST size="small" color="gray" css={{ borderRadius: '0' }}>{ButtonST.toString()}</ButtonST>
      <CheckoutButton size="large" color="violet" outlined>{CheckoutButton.toString()}</CheckoutButton>
    </div>
  );
}

export const faas = async () => {
  return (
    <StitchesDemo />
  )
};
