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
  `longtitude` int(11) NOT NULL,
  `latitude` int(11) NOT NULL,
  `altitude` int(11),
  `timestapMs` varchar(100) NOT NULL,
  `userId` varchar(100),
  PRIMARY KEY (`entryId`),
  FOREIGN KEY (`userId`) REFERENCES `user`(`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `activity`;
CREATE TABLE IF NOT EXISTS `activity` (
  `confidence` int(11) NOT NULL,
  `type` enum('"ON_FOOT"','"RUNNING"','"TILTING"','"IN_VEHICLE"','"UNKNOWN"','"ON_BICYCLE", "STILL"') NOT NULL,
  `timestamp` int(11) NOT NULL,
  `entryId` int(11) NOT NULL,
  `activityId` int(11) NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`activityId`),
  FOREIGN KEY (`entryId`) REFERENCES `entry`(`entryId`) 
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
