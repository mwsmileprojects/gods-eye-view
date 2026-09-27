import { dispatchProvider } from '../server/vercel/dispatch.js';
import { aisLiveProxy } from '../server/providers/vessels/ais-live.js';
export default (req,res) => dispatchProvider(req,res,aisLiveProxy);
