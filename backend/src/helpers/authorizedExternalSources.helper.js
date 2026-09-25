export const authorizedExternalSources = Object.freeze([
  { id: 'estadistica-formosa', name: 'Dirección de Estadística, Censos y Documentación de Formosa', type: 'official-portal', origin: 'https://estadistica.formosa.gob.ar/', status: 'registered', sourceUpdatedAt: null },
  { id: 'datos-argentina', name: 'Datos Argentina', type: 'official-portal', origin: 'https://datos.gob.ar/', status: 'registered', sourceUpdatedAt: null },
  { id: 'datos-argentina-ckan', name: 'API CKAN de Datos Argentina', type: 'official-api', origin: 'https://datos.gob.ar/api/3/', status: 'registered', sourceUpdatedAt: null },
  { id: 'datos-argentina-georef', name: 'API Georef de Datos Argentina', type: 'official-api', origin: 'https://apis.datos.gob.ar/georef/api/', status: 'available', sourceUpdatedAt: null },
  { id: 'datos-argentina-series', name: 'Series de Tiempo de Datos Argentina', type: 'official-api', origin: 'https://datos.gob.ar/series/api', status: 'registered', sourceUpdatedAt: null },
]);

export const findAuthorizedExternalSource = (id) => authorizedExternalSources.find((source) => source.id === id);
