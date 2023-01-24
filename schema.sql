DROP DATABASE IF EXISTS image_app;
CREATE DATABASE image_app;
USE image_app;

DROP USER IF EXISTS 'image_app_user'@'localhost';
CREATE USER 'image_app_user'@'localhost' IDENTIFIED WITH mysql_native_password BY 'MyPassword1!';
GRANT ALL PRIVILEGES ON image_app.* TO 'image_app_user'@'localhost';

DROP TABLE IF EXISTS images;

CREATE TABLE images (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  file_name VARCHAR(255) NOT NULL,
  description VARCHAR(255) NOT NULL,
  created TIMESTAMP NOT NULL DEFAULT NOW()
);