const { createPool } = require('mysql');  //mengambil properti createPool dari modul "mysql" dan menginisialisasinya dalam variabel lokal dengan nama yang sama, yaitu createPool. 

const db = createPool({                   //menginisialisasi variabel db dengan pool koneksi yang dibuat oleh fungsi createPool(). Pool koneksi ini dapat digunakan untuk menjalankan query dan operasi lainnya terhadap database MySQL yang terhubung.
  // port: 8080, 
  host:process.env.DB_HOSTNAME,           //mengambil nilai host yang telah ditentukan sebelumnya dari environment variabel DB_HOSTNAME dan menggunakan nilainya dalam konfigurasi pool koneksi MySQL.  
  user:process.env.DB_USERNAME,
  password:process.env.DB_PASSWORD,
  database:process.env.DB_NAME,
  connectionLimit:10
});

//mendapatkan koneksi dari pool dan mengecek apakah koneksi berhasil atau gagal.
db.getConnection((error, connection) => {
  if (error) {
    console.error("Koneksi gagal: ", error);    //Jika terjadi kesalahan, pesan kesalahan akan dicetak ke konsol.
  } else {
    console.log("db terhubung!");               //Jika berhasil, pesan keberhasilan akan dicetak dan koneksi akan dilepaskan untuk digunakan kembali.
    connection.release();
  }
});


module.exports = db;  //mengekspor objek db agar dapat diakses dari modul atau file JavaScript lain.