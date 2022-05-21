export interface NewFlow {
  path: '/MST/newFlow',
  request: undefined,
  response: any,
}


export interface ApproveFlow {
  path: '/MST/approveFlow',
  request: {
    flowInst: number,
  },
  response: any,
}

export interface RejectFlow {
  path: '/MST/rejectFlow',
  request: {
    flowInst: number,
  },
  response: any,
}


export interface QueryFlow {
  path: '/MST/rejectFlow',
  request: {
    flowInst: number,
  },
  response: any,
}
