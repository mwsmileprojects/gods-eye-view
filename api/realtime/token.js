import { createRealtimeTokenHandler } from '../../server/providers/openai/realtime.js';

const handler = createRealtimeTokenHandler();

export default async function realtimeToken(req, res) {
  return handler(req, res);
}
