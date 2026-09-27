import { dispatchProvider } from '../server/vercel/dispatch.js';
import { cycloneProxy } from '../server/providers/cyclones.js';
export default (req,res) => dispatchProvider(req,res,cycloneProxy);
