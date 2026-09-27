import { dispatchProvider } from '../server/vercel/dispatch.js';
import { radioBrowserProxy } from '../server/providers/radio.js';
export default (req,res) => dispatchProvider(req,res,radioBrowserProxy);
