const {Router} = require('express');
const checkAuth = require('../middleware/check-auth');
const relationshipWebControllers = require('../controllers/relationship-web-controllers');

const router = Router();

router.use(checkAuth);
router.post('/',relationshipWebControllers.createWeb);
router.patch('/user/:uid',relationshipWebControllers.updateWeb);
router.get('/user/:uid', relationshipWebControllers.getWebByCreator);



module.exports = router;
