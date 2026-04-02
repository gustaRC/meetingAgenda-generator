
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/',
  locale: undefined,
  routes: [
  {
    "renderMode": 2,
    "redirectTo": "/login",
    "route": "/"
  },
  {
    "renderMode": 2,
    "route": "/login"
  },
  {
    "renderMode": 2,
    "route": "/nova-pauta"
  },
  {
    "renderMode": 2,
    "route": "/configuracoes"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 773, hash: 'd37b10fa8a66e0dce82f0df2f8b95b7a781dd31a52906732b0d0fc9650892877', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 1287, hash: '170068796b1b04aa93ea1e1f87945e938f505cf6fb6c1fc3e23358007da839f5', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'nova-pauta/index.html': {size: 31151, hash: '086b2497a4fd589159dd4208d7e5e8069ffb720569e5335e97106aefe2f9480e', text: () => import('./assets-chunks/nova-pauta_index_html.mjs').then(m => m.default)},
    'configuracoes/index.html': {size: 31151, hash: '086b2497a4fd589159dd4208d7e5e8069ffb720569e5335e97106aefe2f9480e', text: () => import('./assets-chunks/configuracoes_index_html.mjs').then(m => m.default)},
    'login/index.html': {size: 31151, hash: '086b2497a4fd589159dd4208d7e5e8069ffb720569e5335e97106aefe2f9480e', text: () => import('./assets-chunks/login_index_html.mjs').then(m => m.default)},
    'styles-5INURTSO.css': {size: 0, hash: 'menYUTfbRu8', text: () => import('./assets-chunks/styles-5INURTSO_css.mjs').then(m => m.default)}
  },
};
