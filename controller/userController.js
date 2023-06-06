const db = require('../config/dbconnect');   //import objek db dari module dbconnect.
const bcrypt = require ('bcryptjs');         //import bcryptjs dan menginisialisasinya dalam variabel lokal bernama bcrypt.
const jwt = require ('jsonwebtoken');        //import jsonwebtoken dan menginisialisasinya dalam variabel lokal bernama jwt.
const fs = require('fs');
const {
  ImgUpload,
  multer
} = require ('../config/uploadImage');

//function register
const register = async (req, res) => {                      //deklarasi register dengan operasi bersifat asinkron, menerima 2 parameter untuk mengelola permintaan dan respons HTTP.
  const { email, password, username } = req.body              //mengambil properti username, email, dan password dari objek req.body.
  const salt = await bcrypt.genSalt();                      //untuk menghasilkan salt yang digunakan untuk mengenkripsi kata sandi, await digunakan untuk menunggu hasil dari operasi asinkron sebelum melanjutkan eksekusi kode berikutnya.
  const hashPassword = await bcrypt.hash(password, salt);   //mengenkripsi kata sandi menggunakan salt yang telah dihasilkan sebelumnya.

  console.log(hashPassword);
  
  const values = [email, hashPassword, username];                                                                       //deklarasi array values yang berisi nilai-nilai yang akan dimasukkan ke dalam query SQL.
  db.query('insert into users (email, password, username) values (?,?,?)', values, function(error, rows, fields) {    //pemanggilan db.query() yang digunakan untuk menjalankan query SQL untuk menyisipkan data pengguna baru ke dalam tabel users pada database.
    
    //fungsi callback
    console.log(rows, fields)
    
    //jika error
    if (error) {  
      return res.status(500).send({
        status: 500,
        success: false,
        message: error.message 
      })
    } else { //jika berhasil
        return res.status(200).send({
          status: 200,
          success: true,
          message: 'user created'
        })
      }
  });
};

//function login
const login = async (req, res) => {         //deklarasi login.
  const { email, password } = req.body;     //untuk mengambil property dari objek req.body.

  const values = [email];                                                                   //deklarasi array value yang berisi nilai yang akan dimasukkan ke query mysql.
  db.query('SELECT * FROM users WHERE email = ?', values, async function (error, rows) {    //memanggil db.query untuk menjalankan query mysql.

    console.log(rows)
    if (error) {
      //Menangani kesalahan query database.
      return res.status(500).json({ error: "user belum terdaftar" });
    }

    //ketika salah isi password
    if (rows.length === 1) {
      const match = await bcrypt.compare(password, rows[0].password);                     //mencocokkan data password di database.
      if (!match) {                                                                       //jika tidak sama maka akan error dengan pesan "silahkan mengisi password yang benar".
        return res.status(400).json({ msg: "silahkan mengisi password yang benar" });
      }

      //saat users sudah berhasil login maka user akan dapat token.
      const token = jwt.sign({ userID: rows[0].id, email: rows[0].email }, process.env.TOKEN_SECRET);

      //user berhasil login
      return res.status(200).json({
        status: 200,
        error: true,
        message: 'Login success',
        result: {
          token: token,
          userID: rows[0].id,
          email: rows[0].email,
          username: rows[0].username
        }
      });
    }
    
    //ika tidak ada data pengguna yang sesuai ditemukan dalam tabel users, maka akan dikirimkan respons HTTP dengan pesan "pastikan mengisi semuanya".
    return res.send("User tidak ditemukan, pastikan mengisi semuanya dengan benar.");
  });
};

//fungction cekdata
const cekData = async (req, res) => {                         //deklarasi cekData.
  console.log (req.userID)                                    //untuk mencetak req.userID.
  db.query('SELECT * FROM users', function(error, rows) {     //menjalankan query SQL untuk mengambil semua data dari tabel users.
    res.status(200).send({                                    //jika berhasil akan mengirimkan respons HTTP dengan status 200 dan data JSON yang berisi hasil dari query.
      result: ({
        data: rows[0].username
      })
    });
  });
};

//function news
const news = async (req, res) => {  
  const query = 'SELECT id, images, title, description, link FROM news';

  db.query(query, (error, results) => {
    if (error) {
      console.error('Kesalahan menjalankan kueri:', error);
      res.status(500).json({ error: 'Kesalahan Server Internal' });
    } else {
      res.status(200).json(results);                                   //jika berhasil akan mengirimkan respons HTTP dengan status 200 dan data JSON yang berisi hasil dari query.
    }
  });
};

//function quiz
const quiz = async (req, res) => {    
  const query = 'SELECT id, nomor, question, option_a, option_b, option_c, option_d FROM quiz';

  db.query(query, (error, results) => {
    if (error) {
      console.error('Kesalahan menjalankan kueri:', error);
      res.status(500).json({ error: 'Kesalahan Server Internal' });
    } else {
      res.status(200).json(results);
    }
  });
};

//Function profil
const profil = async (req, res) => {      
  const query = 'SELECT id, username, email, password FROM users';

  db.query(query, (error, results) => {
    if (error) {
      console.error('Kesalahan menjalankan kueri:', error);
      res.status(500).json({ error: 'Kesalahan Server Internal' });
    } else {
      res.status(200).json(results);
    }
  });
};

//function update Photo Profil
const userImage = async  (req, res) =>{
  try {
    if (!req.file){
      return res.status(401).json({
        message : "gagal upload image"
      })
    }
    const id = req.userID
    const imageUrl = req.file.cloudStoragePublicUrl;

    console.log(imageUrl)
    const query = `UPDATE users SET images = ? WHERE id = ?`;
    db.query(query, [imageUrl, id], function(error, result) {
      if (error) {
        console.log('Tidak dapat mengupdate data:', error);
        // Handle error
        res.status(500).json({ success: false, message: 'gagal mengupdate image URL' });
      } else {
        console.log('Data berhasil diupdate');
        // Handle success
        res.status(200).json({ success: true, message: 'Image URL berhasil diupdate' });
      }
    });
  } catch (error) {
    return res.send(error)
  }
};

module.exports = {    //mengekspor objek register, login, dan cekData.
  register,
  login,
  cekData,
  news,
  quiz,
  profil,
  userImage
}