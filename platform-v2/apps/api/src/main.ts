import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';

const port = Number(process.env.PORT ?? 4000);

const server = createServer((request, response) => {
  const traceId = request.headers['x-trace-id']?.toString() ?? randomUUID();
  response.setHeader('x-trace-id', traceId);
  response.setHeader('content-type', 'application/json; charset=utf-8');

  if (request.method === 'GET' && request.url === '/api/v1/health') {
    response.statusCode = 200;
    response.end(JSON.stringify({ status: 'ok', service: 'api', traceId }));
    return;
  }

  response.statusCode = 404;
  response.end(JSON.stringify({
    error: {
      code: 'NOT_FOUND',
      message: 'Route not found.',
      traceId,
      retryable: false
    }
  }));
});

server.listen(port, () => {
  console.log(JSON.stringify({ level: 'info', service: 'api', event: 'server.started', port }));
});
