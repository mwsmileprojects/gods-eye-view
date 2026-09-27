import { dispatchProvider } from '../server/vercel/dispatch.js';
import { firePerimetersProxy } from '../server/providers/firePerimeters.js';
export default (req,res) => dispatchProvider(req,res,firePerimetersProxy);
