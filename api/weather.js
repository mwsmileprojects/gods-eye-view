import { dispatchProvider } from '../server/vercel/dispatch.js';
import { weatherProxy } from '../server/providers/weather.js';
export default (req,res) => dispatchProvider(req,res,weatherProxy);
