const {Router} = require('express');
const { check } = require('express-validator');
const checkAuth = require('../middleware/check-auth');
const placesControllers = require('../controllers/places-controllers');
const fileUpload = require('../middleware/file-upload');

const router = Router();

router.get('/:pid', placesControllers.getPlaceById);

router.get('/user/:uid', placesControllers.getPlacesByUserId);

router.use(checkAuth);

router.post(
  '/',
  fileUpload.single('image'),
  [
    check('title').not().isEmpty(),
    check('description').isLength({ min: 5 })
  ],
  placesControllers.createPlace
);

router.patch(
  '/:pid',
  [
    check('title').not().isEmpty(),
    check('description').isLength({ min: 5 })
  ],
  placesControllers.updatePlace
);

router.delete('/:pid', placesControllers.deletePlace);
router.post('/:pid/details/list', placesControllers.addPlaceList);
router.patch('/:pid/details/list', placesControllers.updatePlaceList);
router.delete('/:pid/details/list', placesControllers.deletePlaceList);
router.post('/:pid/details/card', placesControllers.addPlaceCard);
router.patch('/:pid/details/card', placesControllers.updatePlaceCard);
router.delete('/:pid/details/card', placesControllers.deletePlaceCard);
router.patch('/:pid/details/list/order', placesControllers.updatePlaceListOrder);
router.patch('/:pid/details/card/order', placesControllers.updatePlaceCardOrder);
module.exports = router;
