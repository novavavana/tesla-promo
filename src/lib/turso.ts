import { createClient } from '@libsql/client';

const url = process.env.TURSO_DATABASE_URL || 'libsql://logistics-logistics.aws-us-east-2.turso.io';
const authToken = process.env.TURSO_AUTH_TOKEN || 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODkyNTc2NjUsImlkIjoiMDFhMDk3ZTMtYjkwMS03NDA0LTliZWMtNWMzZmRiMzE2Mjg4Iiwia2lkIjoiOFpDM0pCdDBCSGE5YXp0bzdDT1V2c0tBLThFSm9ISURmbHUzV3lVYnNrTSIsInJpZCI6IjBhM2QzYjVkLTM1NWYtNDE2My04Y2I2LTczNTQ4YzMyOTE5ZiJ9.xFYSNxHpbkz-c3b6u7z31LC2A1iXIeh_cJKv17gpEiEDAmiMYOEqETPRBWqTPOWJ56atoKQPigpTieYc7_3VCw';

export const turso = createClient({
  url,
  authToken,
});
