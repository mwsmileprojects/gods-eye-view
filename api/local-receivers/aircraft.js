import { dispatchProvider } from '../../server/vercel/dispatch.js';
import { localReceiversProxy } from '../../server/providers/local-receivers.js';
export default (req,res) => dispatchProvider(req,res,localReceiversProxy);
