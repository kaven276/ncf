import React, { useEffect, useMemo, lazy, Suspense } from 'react';
import { usePromise } from 'clib/hooks/async/usePromise';

export class ErrorBoundary extends React.Component<any, { hasError: boolean, key: number }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, key: 0 };
  }
  static getDerivedStateFromError(error: any) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // You can also log the error to an error reporting service
  }
  render() {
    if (this.state.hasError) {
      return (
        <p>
          <span>当前菜单页异常，请重新进入。{this.state.key}</span>
          <button onClick={() => this.setState({ hasError: false, key: this.state.key + 1 })}>点击刷新</button>
        </p>
      );
    }
    const renderProps = this.props.children;
    //@ts-ignore
    return renderProps(this.state.key);
  }
}

/** route wrapper 代码分割方式动态加载路由模块，并且配置 BreadCrumb 的文字.
 * react Suspense(Experimental) 版本，
 * @example
 *  <Route exact path="/permission/rolelist" component={routeSplit(() => import('containers/RoleList'), "角色管理")} />
 */
export const routeBySuspense = (ComponentPromiseCreator: Parameters<typeof lazy>[0], pageName: string) => () => {
  const ComponentLazyWithName = withRouteName(lazy(ComponentPromiseCreator), pageName);
  return (
    <Suspense fallback={<div>loading...</div>}>
      <ComponentLazyWithName />
    </Suspense>
  );
}

/** route wrapper 代码分割方式动态加载路由模块，并且配置 BreadCrumb 的文字
 * @example
 *  <Route exact path="/permission/rolelist" component={routeSplit(() => import('containers/RoleList'), "角色管理")} />
 */
export const routeByUsePromise = (ComponentPromiseCreator: Parameters<typeof lazy>[0], pageName?: string) => () => {
  const as = usePromise(`load comp (${pageName})`, [], ComponentPromiseCreator);
  if (!as.o) {
    return (
      <div>正在加载{pageName}页面，请稍候...</div>
    );
  }
  const Component = as.d.default;
  const ComponentWithName = pageName ? withRouteName(Component, pageName) : Component;
  // return <ComponentWithName />;
  return (
    <ErrorBoundary>
      {/* key 更新为了卸载并重新加载路由组件，errorCount 为了告知因为异常重新加载路由组件 */}
      {(key: number) => <ComponentWithName key={key} errorCount={key} />}
    </ErrorBoundary>
  );
}



export { routeByUsePromise as routeSplit };

/** 用于缓存 withRouteName 返回的组件 */
const RouteMap = new Map();

/**
 * 原来在每个路由的主 react 组件中通过 props.pageName 取路由页名称并显示在 bread_crumb 中，
 * 现在统一在 withRouteName 中设置路由页面名称。
 * 原来的大量散步这个逻辑的代码全部删除，
 * @param {*} Component 路由对应的组件
 * @param {*} pageName 路由名称，显示在顶部的 bread_crumb 中
 * @returns 原来的 Component
 * <route components=(<WithRoutName c={component}>)
 */
export function withRouteName(Component: React.LazyExoticComponent<React.ComponentType<any>>, pageName: string) {
  if (RouteMap.get(Component)) {
    return RouteMap.get(Component);
  }
  // 需要利用 useEffect，因此必须返回一个组件定义
  // ComponentPropsWithRef<React.ElementType<HTMLElement>>
  const RouteComponet = (props: any) => {
    useEffect(() => {
      const BreadCrumb: HTMLElement = window.document.querySelector('#bread_crumb')!;
      const oldPageName = BreadCrumb.innerHTML;
      BreadCrumb.innerHTML = pageName;
      return () => {
        BreadCrumb.innerHTML = oldPageName || ''; // 老值可能是 undefined
      }
    }, [pageName]);
    // 最终还是要渲染目标组件
    return useMemo(() => (<Component {...props} />), [Component]);
  }
  RouteMap.set(Component, RouteComponet);
  return RouteComponet;
}
