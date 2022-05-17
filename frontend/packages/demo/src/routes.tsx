// 路由配置
import React, {Suspense} from 'react';
import { history } from './history';
import { Router, Switch, Route } from 'react-router-dom';

const routes = 
<Suspense fallback=''>
  <Switch>
    <Route exact path="/" component={React.lazy(() => import('./Home'))} />
    <Route path="/Home" component={React.lazy(() => import('./Home'))} />
  </Switch>
</Suspense>

function Routes() {
  return (
    <Router history={history}>
      {routes}
    </Router>
  )
}

export default Routes;