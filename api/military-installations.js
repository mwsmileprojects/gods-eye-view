import { dispatchProvider } from '../server/vercel/dispatch.js';
import { militaryInstallationsProxy } from '../server/providers/military-installations.js';
export default (req,res) => dispatchProvider(req,res,militaryInstallationsProxy);
