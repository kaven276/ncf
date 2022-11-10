const swStats = require('swagger-stats');
// const apiSpec = require('swagger.json');
const e2k = require('express-to-koa');

exports.middleware = e2k(swStats.getMiddleware(
  // { swaggerSpec: apiSpec }
));

// 参考 https://github.com/slanatech/swagger-stats
// 查看 http://localhost:8000/swagger-stats/stats
// 查看 http://localhost:8000/swagger-stats/metrics
