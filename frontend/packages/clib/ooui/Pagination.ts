import type { PaginationProps } from 'antd/es/pagination';
import { range } from 'clib/util/fake';

// 参考 packages/common-frontend-tools/src/tools/convertToAntTable/index.js

/** 查询列表请求中后台返回的分页信息 */
export interface RequestPagination {
  pageNum: number,
  pageSize: number,
}

/** 查询列表请求中后台返回的分页信息，用于列表mock，自动转换 antd table pagination */
export interface ResponsePagination {
  pageNum: number,
  pageNo?: number,
  pageSize: number,
  total: number,
  // totalList: null
  totalPage: number,
}

export function convertToAntTable(p: ResponsePagination): PaginationProps | undefined {
  if ('total' in p || 'pageSize' in p) {
    return {
      total: p.total || 0,
      pageSize: p.pageSize,
      current: p.pageNum || p.pageNo!, // oss 返回 pageNo 而不是 pageNum
    }
  } else {
    return undefined
  }
}

export function convertFromAntTable(p: PaginationProps): RequestPagination {
  return {
    pageNum: p.current!,
    pageSize: p.pageSize!,
  };
}

export function mockPagination(req2: RequestPagination): ResponsePagination {
  const req = { ...req2 };
  req.pageNum = req.pageNum || 1;
  req.pageSize = req.pageSize || 10;

  const totalPage = req.pageNum + range(0, 10);
  const total = range(1, req.pageSize) + totalPage * req.pageSize;

  return {
    pageNum: req.pageNum,
    pageSize: req.pageSize,
    total,
    totalPage,
  };
}
