import { dispatchProvider } from '../server/vercel/dispatch.js';
import { transitProxy } from '../server/providers/transit.js';
export default (req,res) => dispatchProvider(req,res,transitProxy);
