import { matchedData } from 'express-validator';
import { authorizedExternalSources, findAuthorizedExternalSource } from '../helpers/authorizedExternalSources.helper.js';

const georefId = 'datos-argentina-georef';
const georefUrl = 'https://apis.datos.gob.ar/georef/api/provincias';

export const createExternalSourceControllers = (models, externalFetch = fetch) => ({
  list: (_req, res) => res.status(200).json({ message: 'Fuentes externas autorizadas', sources: authorizedExternalSources }),
  consult: async (req, res, next) => {
    try {
      const { sourceId, nombre } = matchedData(req, { locations: ['params', 'query'] });
      const source = findAuthorizedExternalSource(sourceId);
      if (!source) return res.status(404).json({ message: 'Fuente externa no autorizada' });
      if (sourceId !== georefId) return res.status(409).json({ message: 'La fuente está registrada sin adaptador de consulta' });
      const parameters = { nombre: nombre ?? 'Formosa' };
      const url = new URL(georefUrl);
      url.searchParams.set('nombre', parameters.nombre);
      url.searchParams.set('campos', 'id,nombre');
      url.searchParams.set('max', '1');
      let status = 'failed';
      let data;
      try {
        const response = await externalFetch(url, { method: 'GET', redirect: 'error', signal: AbortSignal.timeout(5000), headers: { Accept: 'application/json' } });
        if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) throw new Error('Respuesta externa inválida');
        const body = await response.text();
        if (body.length > 65536) throw new Error('Respuesta externa demasiado extensa');
        data = JSON.parse(body);
        if (!Array.isArray(data.provincias)) throw new Error('Formato externo inválido');
        status = 'success';
      } catch {
        status = 'failed';
      }
      const query = await models.ExternalQueryModel.create({ companyId: req.user.companyId, userId: req.user.id,
        sourceKey: source.id, queryType: 'province_lookup', parameters, status, consultedAt: new Date() });
      if (status !== 'success') return res.status(502).json({ message: 'No se pudo consultar la fuente externa', queryId: query.id });
      return res.status(200).json({ message: 'Consulta externa completada', queryId: query.id,
        provenance: { kind: 'external', sourceId: source.id, name: source.name, origin: source.origin,
          consultedAt: query.consultedAt, sourceUpdatedAt: source.sourceUpdatedAt }, data: { provincias: data.provincias } });
    } catch (error) { return next(error); }
  },
  history: async (req, res, next) => {
    try {
      const rows = await models.ExternalQueryModel.findAll({ where: { companyId: req.user.companyId },
        attributes: ['id', 'sourceKey', 'queryType', 'parameters', 'status', 'consultedAt'], order: [['id', 'DESC']], limit: 100 });
      return res.status(200).json({ message: 'Consultas externas registradas', queries: rows });
    } catch (error) { return next(error); }
  },
});
