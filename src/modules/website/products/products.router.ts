import { Router } from 'express';
import * as productsController from './products.controller';

const router = Router();

// HTTP QUERY method endpoint for smart product search (RFC 10008)
// Also handles GET and POST on /search for compatibility
router.route('/search')
  .all((req, res, next) => {
    res.setHeader('Accept-Query', 'application/json');
    if (req.method === 'QUERY' || req.method === 'POST' || req.method === 'GET') {
      return productsController.searchQuery(req, res, next);
    }
    next();
  });

if (typeof (router as any).query === 'function') {
  (router as any).query('/search', productsController.searchQuery);
}

router.get('/', productsController.getAll);
router.get('/:id', productsController.getById);
router.get('/:id/availability', productsController.getAvailability);

export default router;
