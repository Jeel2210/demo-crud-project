const router = require(`express`).Router();
const userCtrl = require(`../api/controllers/user`);
const authorize = require('../middlewares/authorize');

router.post('/register', userCtrl.createUser);
router.get('/profile', authorize(), userCtrl.all);


module.exports = router;