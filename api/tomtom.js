import { dispatchProvider } from '../server/vercel/dispatch.js';
import { tomtomProxy } from '../server/providers/traffic.js';
export default (req,res) => dispatchProvider(req,res,tomtomProxy);
