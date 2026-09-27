import { dispatchProvider } from '../server/vercel/dispatch.js';
import { windProxy } from '../server/providers/wind.js';
export default (req,res) => dispatchProvider(req,res,windProxy);
