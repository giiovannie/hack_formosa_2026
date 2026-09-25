import { matchedData } from 'express-validator';
import { buildProcessedRecordFilters } from '../helpers/processedRecordFilters.helper.js';
import { calculateHistoricalSeries } from '../helpers/historicalSeries.helper.js';
import { findAuthorizedExternalSource } from '../helpers/authorizedExternalSources.helper.js';

const seriesSourceId = 'datos-argentina-series';
const endpoint = 'https://apis.datos.gob.ar/series/api/series';
const label = (date, interval) => interval === 'year' ? date.slice(0, 4) : interval === 'month' ? date.slice(0, 7) : date.slice(0, 10);

export const createContextualizationControllers = (database, models, externalFetch = fetch) => ({
  analyze: async (req, res, next) => {
    try {
      const { from, to, interval, metric, field, externalSourceId, seriesId } = matchedData(req, { locations: ['query'] });
      if (from > to || (metric === 'count' ? !!field : !field)) {
        return res.status(400).json({ message: 'Período o métrica inválidos' });
      }
      const source = findAuthorizedExternalSource(externalSourceId);
      if (!source) return res.status(404).json({ message: 'Fuente externa no autorizada' });
      if (externalSourceId !== seriesSourceId) return res.status(409).json({ message: 'Esta fuente no ofrece una serie temporal para contextualización' });
      const { where, appliedFilters } = await buildProcessedRecordFilters(models, req);
      const internalPoints = await calculateHistoricalSeries(database, models, where, { from, to, interval, metric, field });
      const url = new URL(endpoint);
      for (const [key, value] of Object.entries({ ids: seriesId, start_date: from, end_date: to, collapse: interval,
        limit: '120', metadata: 'simple', format: 'json' })) url.searchParams.set(key, value);
      let status = 'failed';
      let body;
      try {
        const response = await externalFetch(url, { method: 'GET', redirect: 'error', signal: AbortSignal.timeout(5000), headers: { Accept: 'application/json' } });
        if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) throw new Error('Respuesta externa inválida');
        const raw = await response.text();
        if (raw.length > 131072) throw new Error('Respuesta externa demasiado extensa');
        body = JSON.parse(raw);
        if (!Array.isArray(body.data) || body.data.some((point) => !Array.isArray(point) || point.length !== 2 || typeof point[0] !== 'string')) {
          throw new Error('Formato de serie inválido');
        }
        status = 'success';
      } catch { status = 'failed'; }
      const consultedAt = new Date();
      const log = await models.ExternalQueryModel.create({ companyId: req.user.companyId, userId: req.user.id,
        sourceKey: source.id, queryType: 'historical_series', parameters: { seriesId, from, to, interval }, status, consultedAt });
      if (status !== 'success') return res.status(502).json({ message: 'No se pudo consultar la serie oficial', queryId: log.id });
      const externalPoints = body.data.filter(([date, value]) => typeof value === 'number' && Number.isFinite(value))
        .map(([date, value]) => ({ period: label(date, interval), value }));
      const externalByPeriod = new Map(externalPoints.map((point) => [point.period, point.value]));
      const overlap = internalPoints.filter((point) => externalByPeriod.has(point.period))
        .map((point) => ({ period: point.period, internalValue: point.value, externalValue: externalByPeriod.get(point.period),
          includedRecords: point.includedRecords }));
      return res.status(200).json({ message: 'Contexto temporal obtenido', context: {
        period: { from, to, interval }, internal: { metric, field: field ?? null, filters: appliedFilters, points: internalPoints },
        external: { provenance: { kind: 'external', sourceId: source.id, name: source.name, origin: source.origin,
          apiOrigin: new URL(endpoint).origin, seriesId, consultedAt, queryId: log.id }, points: externalPoints },
        observedOverlap: overlap, status: overlap.length >= 2 ? 'observed' : 'insufficient_overlap',
        interpretation: 'Coincidencia temporal descriptiva; no demuestra causalidad ni comparabilidad de unidades.',
      } });
    } catch (error) { return next(error); }
  },
});
