import { useState } from 'react';
import { observer } from 'mobx-react';

export function useDefineObserverComponent<T extends (props: any) => JSX.Element>(fc: T) {
  const result: T = useState(() => observer(fc))[0]
  return result;
}
