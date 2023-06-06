require('dotenv').config()   //mengimpor dan mengkonfigurasi environment variabel yang ada dalam file .env.

const env = (key, defaultValue = null) => {   //env didefinisikan dengan dua parameter: key dan defaultValue.
  let value = process.env[key];               //menggunakan key sebagai kunci untuk mengakses properti yang sesuai dalam objek process.env.

  if (defaultValue !== null) {     
    value = defaultValue;
  }

  return value;   //mengembalikan nilai.
};

module.exports = env;   //export env.