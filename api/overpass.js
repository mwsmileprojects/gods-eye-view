import { dispatchProvider } from '../server/vercel/dispatch.js';
import { overpassProxy } from '../server/providers/overpass.js';
export default (req,res) => dispatchProvider(req,res,overpassProxy);
