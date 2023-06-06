const jwt = require ('jsonwebtoken');   //import jsonwebtoken.

//fungsion verifyToken
const verifyToken = (req, res, next) => {               //deklarasi.
    const authHeader = req.headers['authorization'];    //mengambil nilai header 'Authorization' dari objek req.headers dan menyimpannya dalam variabel authHeader.
    const token = authHeader                            //Variabel token akan berisi nilai dari authHeader, yang merupakan token otentikasi yang dikirimkan dalam header 'Authorization'.
    if (!token) {                                       //memeriksa token, jika token tidak ada maka akan di kirimkan status dan pesan.
        return res.status(403).send({
            error: true,
            message: 'No token provided!',     
        });
    }
    
    //digunakan untuk memverifikasi keaslian token.
    jwt.verify(token,process.env.TOKEN_SECRET , (err, decoded) => {   //token,process.env.TOKEN_SECRET callback untuk menangani hasil verifikasi.
        if (err) {
            return res.status(401).send({
                error: true,
                message: 'Unauthorized!',
            });
        }
        req.userID = decoded.userID;
        next();     //untuk melanjutkan pemrosesan permintaan ke middleware atau handler selanjutnya.
    });
};
    
module.exports = verifyToken;   //mengekspor objek verifyToken.