import { dispatchProvider } from '../server/vercel/dispatch.js';
import { cctvProxy } from '../server/providers/cctv.js';
export default (req,res) => dispatchProvider(req,res,() => cctvProxy({sourceRoot:process.cwd()}));
