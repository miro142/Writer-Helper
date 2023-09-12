const {Router} = require('express');
const { check } = require('express-validator');
const checkAuth = require('../middleware/check-auth');
const objectsControllers = require('../controllers/objects-controllers');
const fileUpload = require('../middleware/file-upload');

const router = Router();

router.get('/:objid', objectsControllers.getObjectById);

router.get('/user/:uid', objectsControllers.getObjectsByUserId);

router.use(checkAuth);

router.post(
  '/',
  fileUpload.single('image'),
  [
    check('title').not().isEmpty(),
    check('description').isLength({ min: 5 })
  ],
  objectsControllers.createObject
);

router.patch(
  '/:objid',
  [
    check('title').not().isEmpty(),
    check('description').isLength({ min: 5 })
  ],
  objectsControllers.updateObject
);

router.delete('/:objid', objectsControllers.deleteObject);
router.post('/:objid/details/list', objectsControllers.addObjectList);
router.patch('/:objid/details/list', objectsControllers.updateObjectList);
router.delete('/:objid/details/list', objectsControllers.deleteObjectList);
router.post('/:objid/details/card', objectsControllers.addObjectCard);
router.patch('/:objid/details/card', objectsControllers.updateObjectCard);
router.delete('/:objid/details/card', objectsControllers.deleteObjectCard);
router.patch('/:objid/details/list/order', objectsControllers.updateObjectListOrder);
router.patch('/:objid/details/card/order', objectsControllers.updateObjectCardOrder);
module.exports = router;
