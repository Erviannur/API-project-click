const router = require("express").Router();         //modul express diimpor dan objek Router dari modul tersebut diambil untuk membuat router baru.
const { uploadToGcs , multerUpload } = require("../config/uploadImage");
const { 
    register,  
    login,
    cekData,
    news,
    quiz,
    profil,
    userImage
} = require ('../controller/userController');       //impor fungsi dari controller.

const verifyToken = require ('../controller/verifyToken');      //import verifyToken untuk melakukan verifikasi token JWT.
const authValidator = require("../validator/authValidator");    //import authValidator untuk memvalidasi data.

//endpoint
router.post("/register", authValidator.register, register);
router.post("/login", authValidator.login, login);
router.get("/privat-data", verifyToken, cekData);
router.get("/news", news);
router.get("/quiz", quiz);
router.get("/profil", profil);
router.post('/profil/images', multerUpload.single('image'), uploadToGcs, userImage);

module.exports = router;    //export router.
