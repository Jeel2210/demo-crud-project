const router = require(`express`).Router();
const authCtrl = require(`../api/controllers/auth`);
router.post('/login', authCtrl.login)



module.exports = router;

