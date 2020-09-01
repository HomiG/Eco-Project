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
    `timestampMs` varchar(20) NOT NULL,
    `userId` varchar(100),
    PRIMARY KEY (`entryId`),
    FOREIGN KEY (`userId`) REFERENCES `user`(`userId`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8;

  DROP TABLE IF EXISTS `activity`;
  CREATE TABLE `activity1`(
    `aa1` int(11) NOT NULL AUTO_INCREMENT,
    `timestampMs` varchar(20) NOT NULL,
    `type` varchar(100) NOT NULL,
    PRIMARY KEY(`aa1`)
  )  ENGINE=InnoDB DEFAULT CHARSET=utf8;



  DROP TABLE IF EXISTS `LocationConnectActivity`;
  CREATE TABLE `LocationConnectActivity` (
    `a1` int(11)  ,
    `entryId` int(11) ,
    FOREIGN KEY (`a1`) REFERENCES `activity1`(`aa1`) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (`entryId`) REFERENCES `entry`(`entryId`)  ON DELETE RESTRICT ON UPDATE CASCADE,
    PRIMARY KEY(`a1`, `entryId`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8;

  DROP TABLE IF EXISTS `userLastUpload`;
  CREATE TABLE `userLastUpload`(
    `aa` int(11) NOT NULL AUTO_INCREMENT,
    `date` varchar(100) NOT NULL,
    `userId` varchar(100),
    PRIMARY KEY(`aa`),
    FOREIGN KEY (`userId`) REFERENCES `user`(`userId`)  ON DELETE RESTRICT ON UPDATE CASCADE

  )  ENGINE=InnoDB DEFAULT CHARSET=utf8;


  DROP TABLE IF EXISTS `lastMonth`;
  CREATE TABLE `lastMonth` (
    `startingDate` varchar(100) NOT NULL,
    PRIMARY KEY(`startingDate`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8;


  DROP TABLE IF EXISTS `userEcoscore`;
  CREATE TABLE `userEcoscore`(
    `aa` int(11) NOT NULL AUTO_INCREMENT,
    `ecoscore` varchar(100) NOT NULL,
    `userId` varchar(100),
    PRIMARY KEY(`aa`),
    FOREIGN KEY (`userId`) REFERENCES `user`(`userId`)  ON DELETE RESTRICT ON UPDATE CASCADE

  )  ENGINE=InnoDB DEFAULT CHARSET=utf8;


  DROP TABLE IF EXISTS `userWalkingScore`;
  CREATE TABLE `userWalkingScore`(
    `aa` int(11) NOT NULL AUTO_INCREMENT,
    `walking` INT(15),
    `startingDate` varchar(15),
    `userId` varchar(100),
    PRIMARY KEY(`aa`),
    FOREIGN KEY (`userId`) REFERENCES `user`(`userId`)  ON DELETE RESTRICT ON UPDATE CASCADE

  )  ENGINE=InnoDB DEFAULT CHARSET=utf8;


  DROP TABLE IF EXISTS `userVehicleScore`;
  CREATE TABLE `userVehicleScore`(
    `aa` int(11) NOT NULL AUTO_INCREMENT,
    `vehicle` INT(15),
    `startingDate` varchar(20),
    `userId` varchar(100),
    PRIMARY KEY(`aa`),
    FOREIGN KEY (`userId`) REFERENCES `user`(`userId`)  ON DELETE RESTRICT ON UPDATE CASCADE

  )  ENGINE=InnoDB DEFAULT CHARSET=utf8;


  -- INSERT INTO lastMonth(startingDate) VALUES (1543668339001)
  -- UPDATE lastMonth set startingDate = 1513551020885


-- STORED PROCEDURES --
delimiter $$
CREATE PROCEDURE deleteData()
BEGIN
SET FOREIGN_KEY_CHECKS=0;
truncate table userVehicleScore;
truncate table userWalkingScore;
truncate table userecoscore;

truncate table `user`;
truncate table activity1;

truncate table entry;
truncate table lastmonth;
truncate table locationconnectactivity;
truncate table userLastUpload;
truncate table userWalkingScore;
truncate table userecoscore;
END $$

DELIMITER ;


  -- TRIGGERS --
  delimiter #

  DROP TRIGGER IF EXISTS afterMonthInsertUpdate;
  CREATE TRIGGER afterMonthInsertUpdate
    AFTER UPDATE ON `lastMonth` for each row
    -- 2592000000
    BEGIN
      INSERT INTO userWalkingScore(userId, walking, startingDate) 
      SELECT user.userId, count(activity1.type) as walking, new.startingDate FROM user 
      INNER JOIN entry on user.userId = entry.userId 
      INNER JOIN locationconnectactivity on entry.entryId=locationconnectactivity.entryId 
      INNER JOIN activity1 on activity1.aa1=locationconnectactivity.a1 

      WHERE (entry.timestampMs  > new.startingDate AND entry.timestampMs  <  (new.startingDate + 2592000000)) AND (type= 'ON_FOOT' OR type='ON_BICYCLE') GROUP BY user.userId;
      
      
      INSERT INTO userVehicleScore(userId, vehicle, startingDate) 
      SELECT user.userId, count(activity1.type) as vehicle, new.startingDate FROM user 
      INNER JOIN entry on user.userId = entry.userId 
      INNER JOIN locationconnectactivity on entry.entryId=locationconnectactivity.entryId 
      INNER JOIN activity1 on activity1.aa1=locationconnectactivity.a1 

      WHERE (entry.timestampMs  > new.startingDate AND entry.timestampMs  <  (new.startingDate + 2592000000))  AND type= 'IN_VEHICLE' GROUP BY user.userId; 
    
    
      INSERT INTO userEcoscore(ecoscore, userId) 
      SELECT userwalkingscore.walking / (userwalkingscore.walking + uservehiclescore.vehicle)as ecoscore, userwalkingscore.userId from userwalkingscore 
      INNER JOIN uservehiclescore on userwalkingscore.userId=uservehiclescore.userId 
      INNER JOIN lastmonth on lastmonth.startingDate = userwalkingscore.startingDate 
      WHERE userwalkingscore.startingDate = uservehiclescore.startingDate AND userwalkingscore.startingDate = lastmonth.startingDate;
    
    END#

     delimiter ;




  INSERT INTO `user` (`username`, `password`, `userId`, `email`, `admin`) VALUES
  ('Doug Dodgers', '$2b$10$juynMvHqNY8CT23t2ERsAuw/nlpu4JM4rhCNrSJbIRdLL6LD4IUZK', '07b04ece12bb92f3ccd70e07d0c0741ded0eeee605db11171f20d85d40ab9461', 'dougdaffy@spacex.com', 0),
  ('Paris London', '$2b$10$kYYz4rc7eplMhzxIM98vZedqLBAcP7a5RgbMT7YTYfu5URsq7hIeO', '0a67a1689bfd43a6d940e9a5ff12cda762b3ef30c952fd097ca39deb6216e93f', 'paris@london.com', 0),
  ('Admin Admin', '$2b$10$OxdS/.bDkjrwgjzaoJrEuO0mJBhi.qNcIHjpvc67ZM8IdY5FIaRc2', '775cf8b219efd621481a17e6a6396f2d89754ebe4ce08c768e6055660384b731', 'admin@admin.admin', 1),
  ('Lee Fleeting', '$2b$10$D310Hbm7F2Z4iwN3IonQBelUWOC23a/SNFEQSKwny6M0v4bTLu9Am', '915aa500f53a47939496877e265227ad743222b4b5176856bd4a315f9c030fd2', 'lee@coloryouth.gr', 0),
  ('Miz Mimi Brown', '$2b$10$iJYVwzfwVQbXLYnzdeayuOF2jR3PDKTbAQFjjDn./MD7Q8L2zyLz6', 'd24aa26db1bcb7b2b10e9fcc0d59025f9f892c34d89775d1f88cc7ffdb563826', 'mimiiamfirst@gmail.com', 0),
  ('Tamila Zamolodchikova', '$2b$10$ysNutn96fRIABbHfh/oine3EUyqrdMVNedM4nBTHigKZk6iADfP5C', 'fe1f5a595fa60f4218ca5f9b05c806c57e5f419837b153bc641edd53e505997b', 'callmetammie@tsanaka.gr', 0);



-- 1

 SELECT latitudeE7m, longitudeE7 FROM entry;

-- 2
  SELECT latitudeE7m, longitudeE7, activity1.timestampMs FROM entry
  INNER JOIN locationconnectactivity on entry.entryId=locationconnectactivity.entryId 
  INNER JOIN activity1 on activity1.aa1=locationconnectactivity.a1;

-- 3
SELECT entry.latitudeE7, entry.longitudeE7, activity2.type from entry 
INNER JOIN locationconnectactivity on entry.entryId=locationconnectactivity.entryId 
INNER JOIN activity1 on activity1.aa1=locationconnectactivity.a1 
INNER JOIN activity1connectactivity2 on activity1.aa1=activity1connectactivity2.a1 
INNER JOIN activity2 on activity2.aa2=activity1connectactivity2.a2 WHERE activity2.c







-- 1a  Την κατανομή των δραστηριοτήτων των χρηστών (ποσοστό εγγραφών ανά τύπο δραστηριότητας
SELECT entry.latitudeE7, entry.longitudeE7, activity2.type, COUNT(activity2.confidence) from entry 
INNER JOIN locationconnectactivity on entry.entryId=locationconnectactivity.entryId 
INNER JOIN activity1 on activity1.aa1=locationconnectactivity.a1 
INNER JOIN activity1connectactivity2 on activity1.aa1=activity1connectactivity2.a1 
INNER JOIN activity2 on activity2.aa2=activity1connectactivity2.a2 GROUP BY activity2.type 
