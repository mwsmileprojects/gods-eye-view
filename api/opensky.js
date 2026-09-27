import { dispatchProvider } from '../server/vercel/dispatch.js';
import { openSkyProxy } from '../server/providers/aircraft/opensky.js';
export default (req,res) => dispatchProvider(req,res,openSkyProxy);
