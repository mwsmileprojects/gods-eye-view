import { dispatchProvider } from '../../server/vercel/dispatch.js';
import { adsbLolProxy } from '../../server/providers/aircraft/adsb-lol.js';
export default (req,res) => dispatchProvider(req,res,adsbLolProxy);
