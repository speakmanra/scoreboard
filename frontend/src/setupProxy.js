// Auto-loaded by Create React App's dev server.
//
// In Agent Hub previews the browser only sees the frontend container, so
// requests to the backend must be proxied from inside this dev server.
// BACKEND_URL points at the backend service over the compose network;
// outside of docker we fall back to localhost:8000 so non-Docker dev
// (e.g. ./scripts/start-dev.sh) still works.
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  const target = process.env.BACKEND_URL || 'http://localhost:8000';
  const proxy = createProxyMiddleware({
    target,
    changeOrigin: true,
    ws: true,
    logLevel: 'warn',
  });
  app.use('/api', proxy);
  app.use('/admin', proxy);
  // Only proxy Django's own static namespaces to the backend. Django serves
  // admin assets under /static/admin and the DRF browsable API under
  // /static/rest_framework. The CRA dev server serves its OWN bundle under
  // /static/js, /static/css and /static/media, so proxying all of /static
  // would forward /static/js/bundle.js to Django (which 404s) and break the
  // app. Scope the proxy so CRA keeps serving its dev assets.
  app.use('/static/admin', proxy);
  app.use('/static/rest_framework', proxy);
};
