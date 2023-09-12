const {Router} = require('express');
const { check } = require('express-validator');
const checkAuth = require('../middleware/check-auth');
const charactersControllers = require('../controllers/characters-controllers');
const fileUpload = require('../middleware/file-upload');

const router = Router();

router.get('/:cid', charactersControllers.getCharacterById);

router.get('/user/:uid', charactersControllers.getCharactersByUserId);

router.use(checkAuth);

router.post(
  '/',
  fileUpload.single('image'),
  [
    check('title').not().isEmpty(),
    check('description').isLength({ min: 5 })
  ],
  charactersControllers.createCharacter
);

router.patch(
  '/:cid',
  [
    check('title').not().isEmpty(),
    check('description').isLength({ min: 5 })
  ],
  charactersControllers.updateCharacter
);

router.delete('/:cid', charactersControllers.deleteCharacter);
router.post('/:cid/details/list', charactersControllers.addCharacterList);
router.patch('/:cid/details/list', charactersControllers.updateCharacterList);
router.delete('/:cid/details/list', charactersControllers.deleteCharacterList);
router.post('/:cid/details/card', charactersControllers.addCharacterCard);
router.patch('/:cid/details/card', charactersControllers.updateCharacterCard);
router.delete('/:cid/details/card', charactersControllers.deleteCharacterCard);
router.patch('/:cid/details/list/order', charactersControllers.updateCharacterListOrder);
router.patch('/:cid/details/card/order', charactersControllers.updateCharacterCardOrder);
module.exports = router;
