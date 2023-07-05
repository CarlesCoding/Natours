import express from 'express';
import {
    getOverview,
    getTour,
    getLoginForm,
} from '../controllers/viewsController.js';
import catchAsyncErrors from '../utils/catchAsyncErrors.js';

const router = express.Router();

/**
 *  SP-Content Security Policy that prevents browsers from loading content (images, scripts, videos etc) from unsupported sources
 *  You can solve this problem by adding api.mapbox.com as a supported source in your project. (SetHeaders on every request)
 */

const CSP = 'Content-Security-Policy';
const POLICY =
    "default-src 'self' https://*.mapbox.com ;" +
    "base-uri 'self';block-all-mixed-content;" +
    "font-src 'self' https: data:;" +
    "frame-ancestors 'self';" +
    "img-src http://localhost:8000 'self' blob: data:;" +
    "object-src 'none';" +
    "script-src https: cdn.jsdelivr.net cdnjs.cloudflare.com api.mapbox.com 'self' blob: ;" +
    "script-src-attr 'none';" +
    "style-src 'self' https: 'unsafe-inline';" +
    'upgrade-insecure-requests;';

router.use((req, res, next) => {
    res.setHeader(CSP, POLICY);
    next();
});

// Don't need 'router.route().get()'. Because, Almost always use .get() to render the html to the page.
router.get('/', catchAsyncErrors(getOverview));
router.get('/tour/:slug', catchAsyncErrors(getTour));
router.get('/login', catchAsyncErrors(getLoginForm));

export default router;
