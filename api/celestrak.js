import { dispatchProvider } from '../server/vercel/dispatch.js';
import { celestrakProxy } from '../server/providers/space/celestrak.js';
export default (req,res) => dispatchProvider(req,res,celestrakProxy);
