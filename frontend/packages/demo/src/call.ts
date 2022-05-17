import { faasCall } from 'clib/call/faasCall';
import type { ISpec as findUsers } from 'api/typeorm/hr/findUsers.spec';

function testFaasCall() {
  faasCall<findUsers>('/typeorm/hr/findUsers', {
    onlyFirstName: 'T',
    showNames: true,
  }).then(resp => {
    console.log(resp.data[0].firstName)
  });
}

testFaasCall();
