const db = require('../config/dbconnect');   //import objek db dari module dbconnect.
const bcrypt = require ('bcryptjs');         //import bcryptjs dan menginisialisasinya dalam variabel lokal bernama bcrypt.
const jwt = require ('jsonwebtoken');        //import jsonwebtoken dan menginisialisasinya dalam variabel lokal bernama jwt.
const fs = require('fs');

//function register
const register = async (req, res) => {                      //deklarasi register dengan operasi bersifat asinkron, menerima 2 parameter untuk mengelola permintaan dan respons HTTP.
  const { email, password, username } = req.body            //mengambil properti username, email, dan password dari objek req.body.
  const salt = await bcrypt.genSalt();                      //untuk menghasilkan salt yang digunakan untuk mengenkripsi kata sandi, await digunakan untuk menunggu hasil dari operasi asinkron sebelum melanjutkan eksekusi kode berikutnya.
  const hashPassword = await bcrypt.hash(password, salt);   //mengenkripsi kata sandi menggunakan salt yang telah dihasilkan sebelumnya.

  console.log(hashPassword);                                //cetak hashPassword
  
  const values = [email, hashPassword, username];                                                                       //deklarasi array values yang berisi nilai-nilai yang akan dimasukkan ke dalam query SQL.
  db.query('insert into users (email, password, username) values (?,?,?)', values, function(error, rows, fields) {      //pemanggilan db.query() yang digunakan untuk menjalankan query SQL untuk menyisipkan data pengguna baru ke dalam tabel users pada database.
    
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

//function cekdata
const cekData = async (req, res) => {                         
  const query = 'SELECT id, username, password, images, email FROM users';    //Query SQL SELECT ditentukan dengan mengambil kolom id, username, password, images, dan email dari tabel users. Query disimpan dalam variabel query                              
  
  db.query(query, (error, results) => {                                       //Eksekusi query menggunakan db.query() dengan callback function yang menerima error dan results.
    if (error) {  //jika error 
      console.error('Kesalahan menjalankan kueri:', error);
      res.status(500).json({ error: 'Kesalahan Server Internal' });
    } else {      //jika berhasil
      res.status(200).json({                                   
        result: ({
          data: rows
        })                                  
      });  
    }
  });
};

//function news
const news = async (req, res) => {
  const query = 'SELECT id, images, title, description, link FROM news';    //Query SQL SELECT ditentukan dengan mengambil kolom id, images, title, description, dan link dari tabel news. Query disimpan dalam variabel query.

  db.query(query, (error, results) => {                                     //Eksekusi query menggunakan db.query().
    if (error) {    //jika error
      console.error('Kesalahan menjalankan kueri:', error);
      res.status(500).json({ error: 'Kesalahan Server Internal' });
    } else {        //jika berhasil
      res.status(200).json(results);
    }
  });
};

//function quiz
const quiz = async (req, res) => {    
  const query = 'SELECT id, nomor, question, option_a, option_b, option_c, option_d FROM quiz';       //Query SQL SELECT ditentukan dengan mengambil kolom id, images, title, description, dan link dari tabel news. Query disimpan dalam variabel query.

  db.query(query, (error, results) => {                                                               //Eksekusi query menggunakan db.query()
    if (error) {    //jika error
      console.error('Kesalahan menjalankan kueri:', error);
      res.status(500).json({ error: 'Kesalahan Server Internal' });
    } else {        //jika berhasil
      res.status(200).json(results);
    }
  });
};

//Function profil
const profil = async (req, res) => {      
  const query = 'SELECT id, username, email FROM users';              //Query SQL SELECT ditentukan dengan mengambil kolom id, images, title, description, dan link dari tabel news. Query disimpan dalam variabel query.

  db.query(query, (error, results) => {                               //Eksekusi query menggunakan db.query()
    if (error) {    //jika error
      console.error('Kesalahan menjalankan kueri:', error);
      res.status(500).json({ error: 'Kesalahan Server Internal' });
    } else {        //jika berhasil
      res.status(200).json(results);
    }
  });
};

//function update Photo Profil
const userImage = async (req, res) => {
  try{                                                    //memeriksa apakah req.file tersedia atau tidak.
    if (!req.file){
      return res.status(401).json({
          message: "gagal upload image"
      });
    }
    //Jika req.file tersedia, dapatkan id pengguna dari req.userID dan imageUrl dari req.file.cloudStoragePublicUrl.
    const id = req.userID;
    const imageUrl = req.file.cloudStoragePublicUrl;

    console.log(imageUrl);
    console.log(id);
    const query = 'UPDATE users SET images = ? WHERE id = ?';                   //Tentukan query SQL UPDATE yang akan mengupdate kolom images pada tabel users dengan nilai imageUrl berdasarkan id pengguna.

    db.query(query, [imageUrl.toString(), id], function(error, results) {       //Eksekusi query menggunakan db.query() dengan menggunakan placeholder ? untuk parameter pada query
      if(error) {     //jika error
        console.log('Kesalahan mengupdate data:', error);
        res.status(500).json({ success: false, message: 'Gagal mengupdate image URL' });
      } else {        //jika berhasil
        console.log('Data berhasil diupdate');
        res.status(200).json({ success: true, message: 'Image URL berhasil diupdate' });
      }
    });
  } catch (error) {                //Jika terjadi kesalahan pada blok try, tangkap kesalahan dengan blok catch
      return res.send(error);
    }
};

module.exports = {    //mengekspor objek register, login, cekData, news, quiz, profil, dan userImage
  register,
  login,
  cekData,
  news,
  quiz,
  profil,
  userImage
}