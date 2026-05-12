import { z } from 'zod';

const HASURA_URL = process.env.HASURA_URL || 'http://localhost:18086/v1/graphql';
const HASURA_SECRET =
  process.env.HASURA_ADMIN_SECRET || 'BZPmB1rR9tKwF5cSAdcdzXt9WBuT6apcIyzToyEEsfE=';

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

export async function hasuraQuery<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const res = await fetch(HASURA_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Hasura-Admin-Secret': HASURA_SECRET,
    },
    body: JSON.stringify({ query, variables }),
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Hasura HTTP ${res.status}: ${await res.text()}`);
  }

  const json = (await res.json()) as GraphQLResponse<T>;

  if (json.errors && json.errors.length > 0) {
    throw new Error(`Hasura GraphQL: ${json.errors[0].message}`);
  }

  if (!json.data) {
    throw new Error('Hasura returned no data');
  }

  return json.data;
}
