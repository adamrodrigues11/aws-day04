const mysql = require('mysql2')
const dotenv = require('dotenv')

dotenv.config()

const pool = mysql
  .createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  })
  .promise()

async function getImages() {
  let query = `
  SELECT * 
  FROM images
  ORDER BY created DESC
  `

  const [rows] = await pool.query(query);
  return rows
}


async function getImage(id) {
  let query = `
  SELECT * 
  FROM images
  WHERE id = ?
  `

  const [rows] = await pool.query(query, [id]);
  const result = rows[0];
  return result
}

async function addImage(fileName, description) {
  let query = `
  INSERT INTO images (file_name, description)
  VALUES(?, ?)
  `

  const [result] = await pool.query(query, [fileName, description]);
  const id = result.insertId
  
  return await getImage(id)
}

module.exports = {getImage, getImages, addImage}