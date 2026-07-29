export interface WebHealth {
  readonly status: 'ok';
  readonly service: 'web';
  readonly version: string;
}

export function getWebHealth(version = '0.1.0'): WebHealth {
  return {
    status: 'ok',
    service: 'web',
    version
  };
}
