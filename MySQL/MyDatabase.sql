  DROP DATABASE IF EXISTS ecoproject;
  CREATE DATABASE ECOPROJECT;
  USE ECOPROJECT;


  DROP TABLE IF EXISTS `user`;
  CREATE TABLE IF NOT EXISTS `user` (
    `username` varchar(100) NOT NULL,
    `password` varchar(100) NOT NULL,
    `userId` varchar(100) NOT NULL,
    `email` varchar(100) NOT NULL,
    `admin` TINYINT(1) NOT NULL,
    PRIMARY KEY (`userId`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8;

  DROP TABLE IF EXISTS `entry`;
  CREATE TABLE IF NOT EXISTS `entry` (
    `heading` int(11),
    `entryId` int(11) NOT NULL AUTO_INCREMENT,
    `verticalAccuracy` int(11),
    `velocity` int(11),
    `accuracy` int(11) NOT NULL,
    `longitudeE7` int(11) NOT NULL,
    `latitudeE7` int(11) NOT NULL,
    `altitude` int(11),
    `timestampMs` varchar(100) NOT NULL,
    `userId` varchar(100),
    PRIMARY KEY (`entryId`),
    FOREIGN KEY (`userId`) REFERENCES `user`(`userId`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8;

  DROP TABLE IF EXISTS `activity`;
  CREATE TABLE `activity1`(
    `aa1` int(11) NOT NULL AUTO_INCREMENT,
    `timestampMs` varchar(100) NOT NULL,
    PRIMARY KEY(`aa1`)
  )  ENGINE=InnoDB DEFAULT CHARSET=utf8;

  DROP TABLE IF EXISTS `userLastUpload`;
  CREATE TABLE `userLastUpload`(
    `aa` int(11) NOT NULL AUTO_INCREMENT,
    `date` varchar(100) NOT NULL,
    `userId` varchar(100),
    PRIMARY KEY(`aa`),
    FOREIGN KEY (`userId`) REFERENCES `user`(`userId`)  ON DELETE RESTRICT ON UPDATE CASCADE

  )  ENGINE=InnoDB DEFAULT CHARSET=utf8;


  DROP TABLE IF EXISTS `activity2`;
  CREATE TABLE `activity2`(
    `aa2` int(11) NOT NULL AUTO_INCREMENT,
    -- type enum('ON_FOOT','RUNNING','TILTING','IN_VEHICLE','UNKNOWN','ON_BICYCLE', 'STILL', 'WALKING', 'IN_ROAD_VEHICLE', 'IN_RAIL_VEHICLE') NOT NULL,
    `type` varchar(100) NOT NULL,
    `confidence` int(11) NOT NULL,
      PRIMARY KEY(`aa2`)
  )  ENGINE=InnoDB DEFAULT CHARSET=utf8;

  DROP TABLE IF EXISTS `Activity1ConnectActivity2`;
  CREATE TABLE `Activity1ConnectActivity2` (
    `a1` int(11)  ,
    `a2` int(11)  ,
    FOREIGN KEY (`a1`) REFERENCES `activity1`(`aa1`)  ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (`a2`) REFERENCES `activity2`(`aa2`)  ON DELETE RESTRICT ON UPDATE CASCADE,
    PRIMARY KEY(`a1`, `a2`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8;

  DROP TABLE IF EXISTS `LocationConnectActivity`;
  CREATE TABLE `LocationConnectActivity` (
    `a1` int(11)  ,
    `entryId` int(11) ,
    FOREIGN KEY (`a1`) REFERENCES `activity1`(`aa1`) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (`entryId`) REFERENCES `entry`(`entryId`)  ON DELETE RESTRICT ON UPDATE CASCADE,
    PRIMARY KEY(`a1`, `entryId`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8;


  INSERT INTO `user` (`username`, `password`, `userId`, `email`, `admin`) VALUES
  ('Doug Dodgers', '$2b$10$juynMvHqNY8CT23t2ERsAuw/nlpu4JM4rhCNrSJbIRdLL6LD4IUZK', '07b04ece12bb92f3ccd70e07d0c0741ded0eeee605db11171f20d85d40ab9461', 'dougdaffy@spacex.com', 0),
  ('Paris London', '$2b$10$kYYz4rc7eplMhzxIM98vZedqLBAcP7a5RgbMT7YTYfu5URsq7hIeO', '0a67a1689bfd43a6d940e9a5ff12cda762b3ef30c952fd097ca39deb6216e93f', 'paris@london.com', 0),
  ('Admin Admin', '$2b$10$OxdS/.bDkjrwgjzaoJrEuO0mJBhi.qNcIHjpvc67ZM8IdY5FIaRc2', '775cf8b219efd621481a17e6a6396f2d89754ebe4ce08c768e6055660384b731', 'admin@admin.admin', 1),
  ('Lee Fleeting', '$2b$10$D310Hbm7F2Z4iwN3IonQBelUWOC23a/SNFEQSKwny6M0v4bTLu9Am', '915aa500f53a47939496877e265227ad743222b4b5176856bd4a315f9c030fd2', 'lee@coloryouth.gr', 0),
  ('Miz Mimi Brown', '$2b$10$iJYVwzfwVQbXLYnzdeayuOF2jR3PDKTbAQFjjDn./MD7Q8L2zyLz6', 'd24aa26db1bcb7b2b10e9fcc0d59025f9f892c34d89775d1f88cc7ffdb563826', 'mimiiamfirst@gmail.com', 0),
  ('Tamila Zamolodchikova', '$2b$10$ysNutn96fRIABbHfh/oine3EUyqrdMVNedM4nBTHigKZk6iADfP5C', 'fe1f5a595fa60f4218ca5f9b05c806c57e5f419837b153bc641edd53e505997b', 'callmetammie@tsanaka.gr', 0);