import { createClient } from '@libsql/client';

const url = process.env.TURSO_DATABASE_URL || 'libsql://logistics-logistics.aws-us-east-2.turso.io';
const authToken = process.env.TURSO_AUTH_TOKEN;

export const turso = createClient({
  url,
  authToken: authToken || undefined,
});
