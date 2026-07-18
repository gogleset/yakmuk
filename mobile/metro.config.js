const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const fs = require('fs');
const path = require('path');

const config = getDefaultConfig(__dirname);

const LOG_DIR = path.join(__dirname, 'logs');
const LOG_FILE = path.join(LOG_DIR, 'api.log');

// Metro는 로컬 개발 전용 — 앱 __DEV__ 가드와 짝
const prevEnhance = config.server?.enhanceMiddleware;
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware, server) => {
    const base = prevEnhance ? prevEnhance(middleware, server) : middleware;
    return (req, res, next) => {
      if (req.url?.startsWith('/__yakmuk_api_log') && req.method === 'POST') {
        const chunks = [];
        req.on('data', (chunk) => chunks.push(chunk));
        req.on('end', () => {
          try {
            fs.mkdirSync(LOG_DIR, { recursive: true });
            const line = Buffer.concat(chunks).toString('utf8');
            fs.appendFileSync(
              LOG_FILE,
              line.endsWith('\n') ? line : `${line}\n`,
              'utf8',
            );
            res.writeHead(204);
            res.end();
          } catch (e) {
            console.error('[api-log] write failed', e);
            res.writeHead(500);
            res.end('log write failed');
          }
        });
        return;
      }
      return base(req, res, next);
    };
  },
};

module.exports = withNativeWind(config, { input: './global.css' });
