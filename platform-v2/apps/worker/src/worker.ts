const intervalMs = Number(process.env.WORKER_HEARTBEAT_MS ?? 30000);

function log(event: string, data: Record<string, unknown> = {}): void {
  console.log(JSON.stringify({
    level: 'info',
    service: 'worker',
    event,
    timestamp: new Date().toISOString(),
    ...data
  }));
}

log('worker.started', { intervalMs });

setInterval(() => {
  log('worker.heartbeat');
}, intervalMs);
