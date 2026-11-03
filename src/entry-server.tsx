import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { App } from './App';

/** Used at build time by scripts/prerender.mjs to produce static HTML for each page. */
export function render(url: string) {
  return renderToString(
    <StrictMode>
      <StaticRouter location={url}>
        <App />
      </StaticRouter>
    </StrictMode>,
  );
}

export { routeMeta, notFoundMeta } from './data/routes';
export { site } from './data/site';
