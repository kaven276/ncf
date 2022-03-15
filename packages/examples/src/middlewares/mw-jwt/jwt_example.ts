export const JWT_TEXT = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJvc3NfdmlldyIsInBob25lIjoiMTM4MjM0MzEzNTUiLCJ1cmxUb2tlbiI6IjI1TDNlRjFKIiwib3JnQ29kZSI6MTAwMDAxLCJyb2xlcyI6WyJ1Y2VudGVyI1JPTEVfVVNFUiIsImNtcCNDTVBfVEVOQU5UX1VTRVIiLCJvc3MjT1NTX1ZJRVciXSwiZXhwIjoxNjA2MzA4NTE4LCJ1dWlkIjoib3NzX3ZpZXciLCJlbWFpbCI6Im9zc192aWV3QGVubi5jbiIsInJlc291cmNlQ29kZXMiOltdLCJ1c2VybmFtZSI6Im9zc192aWV3In0.eXSuS_mUHCc3_EvNDuQk2NhVpTgotWpQUrKwGb6oY3k_k31fQrYpv8Ws-bBcgMdpoc-wBwtpRu742FR1TDIb5Q';

const JWT_TEXT_CONTENT = 'eyJzdWIiOiJvc3NfdmlldyIsInBob25lIjoiMTM4MjM0MzEzNTUiLCJ1cmxUb2tlbiI6IjI1TDNlRjFKIiwib3JnQ29kZSI6MTAwMDAxLCJyb2xlcyI6WyJ1Y2VudGVyI1JPTEVfVVNFUiIsImNtcCNDTVBfVEVOQU5UX1VTRVIiLCJvc3MjT1NTX1ZJRVciXSwiZXhwIjoxNjA2MzA4NTE4LCJ1dWlkIjoib3NzX3ZpZXciLCJlbWFpbCI6Im9zc192aWV3QGVubi5jbiIsInJlc291cmNlQ29kZXMiOltdLCJ1c2VybmFtZSI6Im9zc192aWV3In0';

const JWT_EXAMPLE_NOW = {
  "sub": "oss_view",
  "uuid": "oss_view",
  "orgCode": 100001, // 用户默认的组织
  "username": "oss_view",
  "phone": "13823431355", // 可以用于给当前登录用户发送短信
  "email": "oss_view@enn.cn", // 可以用于给当前登录用户发送邮件
  "urlToken": "25L3eF1J", // 有新的url粘贴保护机制，没用了
  "roles": [
    "ucenter#ROLE_USER",
    "cmp#CMP_TENANT_USER",
    "oss#OSS_VIEW"
  ],
  "exp": 1606308518, // 过期时间
  "resourceCodes": [], // 后端会用的权限数据，后来废弃了，这字段近期会去掉
}

const JWT_EXAMPLE_CONCISE = {
  "sub": "oss_view",
  "uuid": "oss_view",
  "orgCode": 100001, // 用户默认的组织
  "username": "oss_view",
  "phone": "13823431355", // 可以用于给当前登录用户发送短信
  "email": "oss_view@enn.cn", // 可以用于给当前登录用户发送邮件
  // "urlToken": "25L3eF1J", // 有新的url粘贴保护机制，没用了
  // "roles": [
  //   "ucenter#ROLE_USER",
  //   "cmp#CMP_TENANT_USER",
  //   "oss#OSS_VIEW"
  // ],
  "exp": 1606308518, // 过期时间
  // "resourceCodes": [], // 后端会用的权限数据，后来废弃了，这字段近期会去掉
}

type JWT_STRUCT = typeof JWT_EXAMPLE_CONCISE;
export { JWT_STRUCT };
