import { dispatchProvider } from '../server/vercel/dispatch.js';
import { gbfsProxy } from '../server/providers/gbfs.js';
export default (req,res) => dispatchProvider(req,res,gbfsProxy);
