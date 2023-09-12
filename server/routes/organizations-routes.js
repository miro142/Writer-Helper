const {Router} = require('express');
const { check } = require('express-validator');
const checkAuth = require('../middleware/check-auth');
const organizationsControllers = require('../controllers/organizations-controllers');
const fileUpload = require('../middleware/file-upload');

const router = Router();

router.get('/:orgid', organizationsControllers.getOrganizationById);

router.get('/user/:uid', organizationsControllers.getOrganizationsByUserId);

router.use(checkAuth);

router.post(
  '/',
  fileUpload.single('image'),
  [
    check('title').not().isEmpty(),
    check('description').isLength({ min: 5 })
  ],
  organizationsControllers.createOrganization
);

router.patch(
  '/:orgid',
  [
    check('title').not().isEmpty(),
    check('description').isLength({ min: 5 })
  ],
  organizationsControllers.updateOrganization
);

router.delete('/:orgid', organizationsControllers.deleteOrganization);
router.post('/:orgid/details/list', organizationsControllers.addOrganizationList);
router.patch('/:orgid/details/list', organizationsControllers.updateOrganizationList);
router.delete('/:orgid/details/list', organizationsControllers.deleteOrganizationList);
router.post('/:orgid/details/card', organizationsControllers.addOrganizationCard);
router.patch('/:orgid/details/card', organizationsControllers.updateOrganizationCard);
router.delete('/:orgid/details/card', organizationsControllers.deleteOrganizationCard);
router.patch('/:orgid/details/list/order', organizationsControllers.updateOrganizationListOrder);
router.patch('/:orgid/details/card/order', organizationsControllers.updateOrganizationCardOrder);
module.exports = router;
