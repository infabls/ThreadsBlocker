// pnpm build -> src/bundle.js (threads-api для браузера и Android-webview)
import { build } from 'esbuild';
import { nodeModulesPolyfillPlugin } from 'esbuild-plugins-node-modules-polyfill';

await build({
  entryPoints: ['lib/entry.js'],
  bundle: true,
  minify: true,
  format: 'iife',
  platform: 'browser',
  target: 'es2019',
  outfile: 'src/bundle.js',
  alias: { axios: './node_modules/axios/dist/browser/axios.cjs' }, // один экземпляр axios для библиотеки и перехватчика
  define: { global: 'window' },
  plugins: [nodeModulesPolyfillPlugin({ globals: { Buffer: true, process: true } })],
});
console.log('src/bundle.js готов');
