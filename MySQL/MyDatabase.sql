DROP DATABASE IF EXISTS ecoproject;
CREATE DATABASE ECOPROJECT;
USE ECOPROJECT;


DROP TABLE IF EXISTS `user`;
CREATE TABLE IF NOT EXISTS `user` (
  `username` varchar(100) NOT NULL,
  `password` varchar(100) NOT NULL,
  `userId` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
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

-- DROP TABLE IF EXISTS `activity`;
-- CREATE TABLE IF NOT EXISTS `activity` (
--   `confidence` int(11) NOT NULL,
--   `type` enum('"ON_FOOT"','"RUNNING"','"TILTING"','"IN_VEHICLE"','"UNKNOWN"','"ON_BICYCLE", "STILL"') NOT NULL,
--   `timestamp` int(11) NOT NULL,
--   `entryId` int(11) NOT NULL,
--   `activityId` int(11) NOT NULL AUTO_INCREMENT,
--   PRIMARY KEY (`activityId`),
--   FOREIGN KEY (`entryId`) REFERENCES `entry`(`entryId`) 
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8;


CREATE TABLE `activity1`(
  `aa1` int(11) NOT NULL AUTO_INCREMENT,
  `timestampMs` varchar(100) NOT NULL,
  PRIMARY KEY(`aa1`)
)  ENGINE=InnoDB DEFAULT CHARSET=utf8;



CREATE TABLE `activity2`(
  `aa2` int(11) NOT NULL AUTO_INCREMENT,
  `type` enum('"ON_FOOT"','"RUNNING"','"TILTING"','"IN_VEHICLE"','"UNKNOWN"','"ON_BICYCLE", "STILL"') NOT NULL,
  `confidence` int(11) NOT NULL,
    PRIMARY KEY(`aa2`)
)  ENGINE=InnoDB DEFAULT CHARSET=utf8;


CREATE TABLE `Activity1ConnectActivity2` (
  `a1` int(11)  ,
  `a2` int(11)  ,
  FOREIGN KEY (`a1`) REFERENCES `activity1`(`aa1`)  ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (`a2`) REFERENCES `activity2`(`aa2`)  ON DELETE RESTRICT ON UPDATE CASCADE,
  PRIMARY KEY(`a1`, `a2`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


CREATE TABLE `LocationConnectActivity` (
  `a1` int(11)  ,
  `entryId` int(11) ,
  FOREIGN KEY (`a1`) REFERENCES `activity1`(`aa1`) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (`entryId`) REFERENCES `entry`(`entryId`)  ON DELETE RESTRICT ON UPDATE CASCADE,
  PRIMARY KEY(`a1`, `entryId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


