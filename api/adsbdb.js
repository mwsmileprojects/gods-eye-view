import { dispatchProvider } from '../server/vercel/dispatch.js';
import { adsbdbProxy } from '../server/providers/aircraft/enrichment.js';
export default (req,res) => dispatchProvider(req,res,adsbdbProxy);
