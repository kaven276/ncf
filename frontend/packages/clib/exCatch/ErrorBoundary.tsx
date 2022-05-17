import React from "react";
import { ErrorInfo,SaveErrorInfo } from './index';
/**
 * error boundary 统计 react运行过程中发生的错误。
 */

 export class ErrorBoundary extends React.Component<any, { hasError: boolean, key: number, error: { message?: boolean | React.ReactChild | React.ReactFragment | React.ReactPortal | null | undefined; stack?: boolean | React.ReactChild | React.ReactFragment | React.ReactPortal | null | undefined; } }>{
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, key: 0, error: {} };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true };
  }
  componentDidCatch(error: any, errorInfo: React.ErrorInfo) {
    const Info = {
      "type": 'ErrorBoundary',
      "message": error.message,
      "stack": errorInfo.componentStack,
    } as ErrorInfo;
    SaveErrorInfo(Info);
    this.setState({
      error: error
    })
  }
  render() {
    if (this.state.hasError) {
      return (
        <p>
          <span>恭喜你又写出一个bug，请尽快解决问题，以免影响工作进度。</span>
          <p>
            {this.state.error.message}
            <br />
            {this.state.error.stack}
          </p>
        </p>
      );
    }
    return this.props.children;
  }
}