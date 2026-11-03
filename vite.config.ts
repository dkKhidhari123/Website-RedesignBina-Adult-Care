import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Serves /api/* from the Vercel function files during `npm run dev`,
 * so the contact form works locally without the Vercel CLI.
 * In production Vercel runs api/*.ts natively; this plugin is dev-only.
 */
function vercelApiDev(): Plugin {
  return {
    name: 'vercel-api-dev',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/api', async (req, res) => {
        const route = (req.url ?? '/').split('?')[0].replace(/^\//, '');
        try {
          const mod = await server.ssrLoadModule(`/api/${route}.ts`);
          let raw = '';
          for await (const chunk of req) raw += chunk;
          const vReq = Object.assign(req, { body: raw ? JSON.parse(raw) : undefined });
          const vRes = Object.assign(res, {
            status(code: number) {
              res.statusCode = code;
              return vRes;
            },
            json(data: unknown) {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(data));
              return vRes;
            },
          });
          await mod.default(vReq, vRes);
        } catch (err) {
          server.config.logger.error(String(err));
          res.statusCode = 500;
          res.end(JSON.stringify({ ok: false, error: 'Dev API error' }));
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  // Expose server-only .env values to the dev API handlers (never to the client bundle).
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''));
  return {
    plugins: [react(), vercelApiDev()],
    build: { target: 'es2020', cssCodeSplit: true },
  };
});
