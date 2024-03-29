#!/usr/bin/env ts-node --transpile-only

// yarn unit src/faas/usecase/test.uc.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { render, Text, Box, useInput, useApp, useFocus } from 'ink';
import { outerCall } from '@ncf/microkernel';
import { IUser } from 'src/intf/user';
import Table from 'ink-table';
import { UncontrolledTextInput } from 'ink-text-input';
import Markdown from 'ink-markdown';
import MultiSelect from 'ink-multi-select';
import SelectInput from 'ink-select-input';
import { ISpec as FindUserSpec } from 'src/faas/typeorm/hr/findUsers.spec';

const WELCOME_TEXT = `
欢迎来到 \`ink-ncf\` 控制台！功能概览如下(按 **q** 退出):
`

const Counter = () => {
  const [query, setQuery] = useState('');
  const [userList, setUserList] = useState<IUser[]>([]);
  useEffect(() => {
    outerCall<FindUserSpec>('/typeorm/hr/findUsers', {
      onlyFirstName: query ? query : undefined,
    }).then((resp: IUser[]) => {
      setUserList(resp.sort((a, b) => a.id - b.id));
    }).catch(console.error);
  }, [query]);

  const app = useApp();

  useInput((input, key) => {
    // 因为存在 input 焦点，需按 escape 后，再按 q 退出进程
    if (input === 'q') {
      app.exit();
      process.exit();
    }
  });

  const { isFocused } = useFocus();
  const bgc = isFocused ? 'rgb(232, 131, 136)' : '';
  const nameList = useMemo(() => {
    return userList.map(u => ({
      label: `${u.firstName} ${u.lastName ?? ''}`,
      value: u.firstName,
    }))
  }, [userList]);

  return (
    <Box width={120} flexDirection="column">
      <Markdown>{WELCOME_TEXT}</Markdown>
      <Box borderStyle="classic" display='flex'>
        <Text color="blue" backgroundColor={bgc}>{JSON.stringify(userList, null, 2)}</Text>
      </Box>
      <Box flexDirection="row" display='flex'>
        <Text>Enter your query:</Text>
        <UncontrolledTextInput onSubmit={(t) => setQuery(t)} placeholder="input username" />
      </Box>
      {/* <SelectInput items={nameList} onSelect={(item => setQuery(item.value))} /> */}
      <Table data={userList as any[]} />
    </Box>
  )
}

render(<Counter />);
