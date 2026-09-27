import { dispatchProvider } from '../server/vercel/dispatch.js';
import { trackBackfillProxies } from '../server/providers/aircraft/tracks.js';
export default (req,res) => dispatchProvider(req,res,trackBackfillProxies);
