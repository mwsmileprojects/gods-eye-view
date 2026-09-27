import { dispatchProvider } from '../server/vercel/dispatch.js';
import { geocodeProxy } from '../server/providers/regional/place.js';
export default (req,res) => dispatchProvider(req,res,geocodeProxy);
