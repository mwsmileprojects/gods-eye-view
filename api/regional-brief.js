import { dispatchProvider } from '../server/vercel/dispatch.js';
import { regionalBriefProxy } from '../server/providers/regional/briefing.js';
export default (req,res) => dispatchProvider(req,res,regionalBriefProxy);
