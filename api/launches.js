import { dispatchProvider } from '../server/vercel/dispatch.js';
import { rocketLaunchesProxy } from '../server/providers/space/launch-library.js';
export default (req,res) => dispatchProvider(req,res,rocketLaunchesProxy);
