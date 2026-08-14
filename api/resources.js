import { resources } from '../src/data.js';

const publicFields = [
  'id',
  'title',
  'type',
  'level',
  'subject',
  'skill',
  'duration',
  'difficulty',
  'objective',
  'tags',
];

export default function handler(_request, response) {
  const publicResources = resources.map((resource) =>
    Object.fromEntries(publicFields.map((field) => [field, resource[field]])),
  );

  response.status(200).json({
    status: 'ok',
    count: publicResources.length,
    resources: publicResources,
  });
}
