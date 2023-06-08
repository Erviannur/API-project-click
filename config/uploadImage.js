const { Storage } = require('@google-cloud/storage');     //import @google-cloud/storage.
const fs = require('fs');                                 //import fs.
const dateFormat = require('dateformat');                 //import dateformat.
const path = require('path');                             //import path. 
const multer = require('multer');                         //import multer.

const pathKey = path.resolve('./serviceaccount.json');    //Tentukan path ke file serviceaccount.json menggunakan path.resolve() dan simpan di variabel pathKey.

const gcs = new Storage({                      //Buat instance dari Storage dengan menggunakan @google-cloud/storage dan konfigurasikan dengan projectId dan keyFilename.
    projectId: 'capstone-project-click',
    keyFilename: pathKey
})

const bucketName = 'capstone-click'                                       //Simpan di variabel bucketName.
const bucket = gcs.bucket(bucketName)                                     //Buat instance bucket menggunakan gcs.bucket(bucketName).

function getPublicUrl(filename) {                                         //fungsi getPublicUrl yang menerima filename dan mengembalikan URL publik untuk mengakses file di bucket Google Cloud Storage.
  return `https://storage.googleapis.com/${bucketName}/${filename}`;
}

const multerUpload = multer({              //Konfigurasi multer untuk mengunggah file dengan menggunakan multer.memoryStorage() sebagai penyimpanan sementara. 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB       //Batasan ukuran file 5MB.
  }
});

const uploadToGcs = (req, res, next) => {         //fungsi uploadToGcs yang akan menjadi middleware untuk mengunggah file ke Google Cloud Storage.
  const file = req.file;                          //Dalam fungsi uploadToGcs, dapatkan file yang diunggah dari req.file.

  if (!file) {
    return next();                                //Jika tidak ada file yang diunggah, lewati middleware dengan memanggil next().
  }
  const originalFilename = file.originalname;
  const sanitizedFilename = originalFilename.replace(/\s+/g, "-");                                //Jika ada file yang diunggah, dapatkan nama file asli dari file.originalname dan hilangkan spasi dengan mengganti spasi dengan tanda - menggunakan regex.

  const gcsname = `users/${dateFormat(new Date(), 'yyyymmdd-HHMMss')}-${sanitizedFilename}`;      //Buat nama unik untuk file yang akan disimpan di Google Cloud Storage dengan format users/yyyymmdd-HHMMss-originalFilename.
  const fileUpload = bucket.file(gcsname);                                                        //Buat objek fileUpload dengan menggunakan bucket.file(gcsname).

  const stream = fileUpload.createWriteStream({             //Buat stream untuk menulis file ke Google Cloud Storage menggunakan fileUpload.createWriteStream() dengan metadata berisi tipe konten file.
    metadata: {
      contentType: file.mimetype
    }
  });

  //Tambahkan event listener untuk menangani kesalahan saat menulis stream (stream.on('error')).
  stream.on('error', (error) => {
    file.cloudStorageError = error;                         //Jika terjadi kesalahan saat menulis stream, simpan error di file.cloudStorageError dan panggil next(error) untuk melanjutkan penanganan kesalahan.
    next(error);
  });

  //Ketika proses penulisan stream selesai (stream.on('finish')).
  stream.on('finish', () => {
    file.cloudStorageObject = gcsname;
    file.cloudStoragePublicUrl = getPublicUrl(gcsname);
    console.log(file.cloudStoragePublicUrl);                //Jika proses penulisan stream selesai, simpan nama file dan URL publik di file.cloudStorageObject dan file.cloudStoragePublicUrl, lalu log URL publik tersebut.
    next();                                                 //Panggil next() untuk melanjutkan ke middleware atau route selanjutnya.  
  });

  stream.end(file.buffer);
};

module.exports = {      //Ekspor multerUpload dan uploadToGcs
  multerUpload, 
  uploadToGcs 
};


//Modul ini mengekspos dua fungsi yaitu multerUpload dan uploadToGcs yang dapat digunakan oleh modul lain dengan menggunakan module.exports. 
//multerUpload digunakan untuk mengonfigurasi multer dan uploadToGcs digunakan sebagai middleware untuk mengunggah file ke Google Cloud Storage.