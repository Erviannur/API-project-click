const { validationResult } = require('express-validator');    //import fungsi validationResult untuk mendapatkan hasil validasi dari objek req setelah proses validasi selesai dilakukan.

const valResultUtils = (req, res, next) => {   //fungsi middle ware yang akan melakukan pengecekan terhadap hasil validasi yang terdapat dalam objek req.
  const errors = validationResult(req);        //untuk mendapatkan hasil validasi dari objek req.
  if (!errors.isEmpty()) {                     //Hasil validasi ini berisi daftar error jika terjadi kesalahan dalam validasi.
    return res.status(422).json({
      error: true,
      errors: errors.mapped(),
    });
  }
  next();
};

module.exports = valResultUtils;  //export valResultUtils.