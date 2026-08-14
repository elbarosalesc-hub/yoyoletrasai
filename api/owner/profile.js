import { authorizeOwnerRequest } from '../_owner-auth.js';
import { yoyoRuntimeStatus } from '../_yoyo-native-runtime.js';
import { yoyoStorageStatus } from '../_yoyo-storage.js';
import { OWNER_PLATFORM_PROFILE, ownerProfileChecklist } from '../../shared/owner-platform-config.js';
import { benchmarkCoverage, YOYO_IMPLEMENTED_CAPABILITIES } from '../../shared/yoyo-capability-benchmark.js';

export default async function handler(req, res) {
  res.setHeader?.('Cache-Control', 'no-store');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Método no permitido.' });
  const context = await authorizeOwnerRequest(req);
  if (!context.ok) return res.status(context.status).json({ error: context.error });

  try {
    const runtime = yoyoRuntimeStatus();
    const storage = yoyoStorageStatus();
    const coverage = benchmarkCoverage(YOYO_IMPLEMENTED_CAPABILITIES);
    const checklist = ownerProfileChecklist({ runtime, storage, coverage });
    return res.status(200).json({
      profile: OWNER_PLATFORM_PROFILE,
      runtime,
      storage,
      coverage,
      checklist,
      safeguards: {
        productionMutation: false,
        domainMutation: false,
        aliasMutation: false,
        message: 'Este panel es informativo y de configuración segura. No promueve cambios a producción por sí solo.',
      },
    });
  } catch (error) {
    console.error('Owner profile status failed', { message: error.message });
    return res.status(500).json({ error: 'No fue posible cargar el centro de control propietario.' });
  }
}
