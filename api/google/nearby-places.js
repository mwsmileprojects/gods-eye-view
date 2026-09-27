import { dispatchProvider } from '../../server/vercel/dispatch.js';
import { googlePlacesContextProxy } from '../../server/providers/places.js';
export default (req,res) => dispatchProvider(req,res,googlePlacesContextProxy);
