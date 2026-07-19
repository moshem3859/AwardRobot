const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');
const { searchAllProviders } = require('./src/providers');
const { buildCombinations } = require('./src/combiner');

const PORT = process.env.PORT || 3000;
const PUBLIC = path.join(__dirname, 'public');

function send(res, status, body, type='application/json') {
  res.writeHead(status, {'Content-Type': type, 'Cache-Control': 'no-store'});
  res.end(type.includes('json') ? JSON.stringify(body) : body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', c => { data += c; if (data.length > 1_000_000) reject(new Error('Request too large')); });
    req.on('end', () => {
      try { resolve(data ? JSON.parse(data) : {}); } catch { reject(new Error('Invalid JSON')); }
    });
  });
}

function serveStatic(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  let file = url.pathname === '/' ? '/index.html' : url.pathname;
  const full = path.normalize(path.join(PUBLIC, file));
  if (!full.startsWith(PUBLIC)) return send(res, 403, 'Forbidden', 'text/plain');
  if (!fs.existsSync(full) || fs.statSync(full).isDirectory()) return send(res, 404, 'Not found', 'text/plain');
  const ext = path.extname(full);
  const types = {'.html':'text/html; charset=utf-8','.css':'text/css','.js':'application/javascript','.svg':'image/svg+xml'};
  send(res, 200, fs.readFileSync(full), types[ext] || 'application/octet-stream');
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === 'GET' && req.url === '/api/health') {
      return send(res, 200, {
        ok: true,
        providers: {
          amadeus: Boolean(process.env.AMADEUS_CLIENT_ID && process.env.AMADEUS_CLIENT_SECRET),
          seatsAero: Boolean(process.env.SEATSAERO_API_KEY),
          demoFallback: true
        }
      });
    }

    if (req.method === 'POST' && req.url === '/api/search') {
      const input = await readBody(req);
      const normalized = {
        origins: input.origins || ['JFK','EWR'],
        destination: input.destination || 'TLV',
        startDate: input.startDate,
        endDate: input.endDate || input.startDate,
        passengers: Number(input.passengers || 1),
        cabin: input.cabin || 'ANY',
        maxLayoverHours: Number(input.maxLayoverHours || 24),
        minLayoverHours: Number(input.minLayoverHours || 3),
        allowAirportChange: Boolean(input.allowAirportChange),
        allowOvernight: input.allowOvernight !== false,
        gateways: input.gateways || []
      };
      if (!normalized.startDate) return send(res, 400, {error:'startDate is required'});
      if (normalized.passengers < 1 || normalized.passengers > 9) return send(res, 400, {error:'passengers must be 1-9'});

      const providerResult = await searchAllProviders(normalized);
      const combinations = buildCombinations(providerResult.segments, normalized);
      return send(res, 200, {
        query: normalized,
        providers: providerResult.providers,
        warnings: providerResult.warnings,
        searchedAt: new Date().toISOString(),
        segmentCount: providerResult.segments.length,
        combinations
      });
    }

    return serveStatic(req, res);
  } catch (err) {
    console.error(err);
    return send(res, 500, {error: err.message || 'Unexpected error'});
  }
});

server.listen(PORT, () => console.log(`Award Robot running at http://localhost:${PORT}`));
