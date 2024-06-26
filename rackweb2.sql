-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: rack_web
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `bin`
--

DROP TABLE IF EXISTS `bin`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `bin` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `weight` int(11) NOT NULL,
  `IdWaste` int(11) NOT NULL,
  `name_hostname` varchar(100) NOT NULL,
  `line` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `type_waste` (`IdWaste`),
  CONSTRAINT `bin_ibfk_1` FOREIGN KEY (`IdWaste`) REFERENCES `waste` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bin`
--

LOCK TABLES `bin` WRITE;
/*!40000 ALTER TABLE `bin` DISABLE KEYS */;
INSERT INTO `bin` VALUES (1,'1-PCS-SR-5-1',0,1,'',5),(2,'1-PCS-SR-11-1',0,2,'',11),(3,'1-PCS-SR-3-2',0,3,'',3),(4,'1-PCL-7-6-1',0,1,'',0),(5,'1-PCL-SR-5-1',0,1,'2-PCL.local',5);
/*!40000 ALTER TABLE `bin` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `container`
--

DROP TABLE IF EXISTS `container`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `container` (
  `containerid` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `station` varchar(50) NOT NULL,
  `weightbin` decimal(11,0) NOT NULL,
  `idWaste` int(11) DEFAULT 1,
  `line` int(11) NOT NULL,
  `type` varchar(100) NOT NULL,
  PRIMARY KEY (`containerid`),
  KEY `idWaste` (`idWaste`),
  CONSTRAINT `container_ibfk_1` FOREIGN KEY (`idWaste`) REFERENCES `waste` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `container`
--

LOCK TABLES `container` WRITE;
/*!40000 ALTER TABLE `container` DISABLE KEYS */;
INSERT INTO `container` VALUES (1,'1-PCS-SP-SR-B1','Solder Paste',20,1,5,''),(2,'1-PCS-SD-SR-2','Solder Dust',5,2,11,''),(3,'1-PCS-CR-SR-3','Cutting Residu',5,3,3,''),(4,'1-PCL-CR-2-GR','Cutting',5,2,14,''),(5,'1-PCL-SP-2-GR','Solder Paste',5,2,15,''),(6,'1-PCL-SP-3-GR','Solder Paste',5,2,18,''),(7,'1-PCL-SP-SR-B1','1-PCL-SP',5,1,5,'');
/*!40000 ALTER TABLE `container` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employee`
--

DROP TABLE IF EXISTS `employee`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `employee` (
  `badgeId` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(100) NOT NULL,
  `active` int(11) NOT NULL,
  PRIMARY KEY (`badgeId`)
) ENGINE=InnoDB AUTO_INCREMENT=940266 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employee`
--

LOCK TABLES `employee` WRITE;
/*!40000 ALTER TABLE `employee` DISABLE KEYS */;
INSERT INTO `employee` VALUES (123,'Jaya Sirait',1),(940265,'Rennu',1);
/*!40000 ALTER TABLE `employee` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transaction`
--

DROP TABLE IF EXISTS `transaction`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `transaction` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `badgeId` int(11) NOT NULL,
  `idContainer` int(11) NOT NULL,
  `idWaste` int(11) NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `neto` decimal(11,0) NOT NULL,
  `status` varchar(100) NOT NULL,
  `bin_qr` varchar(100) NOT NULL,
  `idscraplog` varchar(128) NOT NULL,
  `bin` varchar(100) NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `badgeId` (`badgeId`),
  KEY `idContainer` (`idContainer`),
  KEY `idWaste` (`idWaste`),
  CONSTRAINT `transaction_ibfk_1` FOREIGN KEY (`badgeId`) REFERENCES `employee` (`badgeId`),
  CONSTRAINT `transaction_ibfk_2` FOREIGN KEY (`idContainer`) REFERENCES `container` (`containerid`),
  CONSTRAINT `transaction_ibfk_3` FOREIGN KEY (`idWaste`) REFERENCES `waste` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=159 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transaction`
--

LOCK TABLES `transaction` WRITE;
/*!40000 ALTER TABLE `transaction` DISABLE KEYS */;
INSERT INTO `transaction` VALUES (149,123,1,1,'2024-06-18 11:25:40',0,'Done','1-PCS-SP-SR-5-1','BE8724A9EE31492CBA7824915FBF5B18','1-PCS-SP-SR-5-1'),(150,123,1,1,'2024-06-18 12:20:08',0,'Done','1-PCS-SP-SR-5-1','205596AAC0F74FFFA7043E880E918FD3','1-PCS-SP-SR-5-1'),(151,123,1,1,'2024-06-19 08:41:50',0,'Done','1-PCS-SP-SR-5-1','CA429CD5F09347A1946B576031CDEDFE','1-PCS-SP-SR-5-1'),(152,123,1,1,'2024-06-19 09:01:03',0,'Done','1-PCS-SP-SR-5-1','4EE774CC4A1448C7B56BD92F80839FBB','1-PCS-SP-SR-5-1'),(153,940265,1,1,'2024-06-25 02:37:05',0,'Done',' 1-PCS-SP-SR-5-1','00057E22DC7C4C95BD2D69EA603B7A8E','1-PCS-SP-SR-5-1'),(154,940265,1,1,'2024-06-25 03:42:09',0,'Waiting Dispose To Step 2',' 1-PCS-SP-SR-5-1','00057E22DC7C4C95BD2D69EA603B7A8E','1-PCS-SP-SR-5-1'),(155,940265,1,1,'2024-06-25 03:42:24',0,'Waiting Dispose To Step 2',' 1-PCS-SP-SR-5-1','00057E22DC7C4C95BD2D69EA603B7A8E','1-PCS-SP-SR-5-1'),(156,123,1,1,'2024-06-25 09:10:02',0,'Waiting Dispose To Step 2','1-PCS-SP-SR-5-1','4F198E1E863343C8898007E781AF0BF8','1-PCS-SP-SR-5-1'),(157,123,1,1,'2024-06-25 09:10:03',0,'Waiting Dispose To Step 2','1-PCS-SP-SR-5-1','D8729896C24A4803BD33FB9D891FAED2','1-PCS-SP-SR-5-1'),(158,123,7,1,'2024-06-25 09:32:38',0,'Waiting Dispose To Step 2','1-PCL-SP-SR-5-1','DC596B0FD2E04A2A979E7774C094F449','1-PCL-SP-SR-5-1');
/*!40000 ALTER TABLE `transaction` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `waste`
--

DROP TABLE IF EXISTS `waste`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `waste` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `scales` varchar(10) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `waste`
--

LOCK TABLES `waste` WRITE;
/*!40000 ALTER TABLE `waste` DISABLE KEYS */;
INSERT INTO `waste` VALUES (1,'Solder Paste',''),(2,'Solder Dust',''),(3,'Cutting Residu','');
/*!40000 ALTER TABLE `waste` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-06-25 17:23:32
