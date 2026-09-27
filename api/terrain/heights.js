import { dispatchProvider } from '../../server/vercel/dispatch.js';
import { terrainHeightsProxy } from '../../server/providers/terrain.js';
export default (req,res) => dispatchProvider(req,res,terrainHeightsProxy);
