-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 20, 2024 at 05:13 AM
-- Server version: 10.4.27-MariaDB
-- PHP Version: 8.0.25

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `new-sealable`
--

-- --------------------------------------------------------

--
-- Table structure for table `bin`
--

CREATE TABLE `bin` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `weight` int(11) NOT NULL,
  `max_weight` decimal(10,0) NOT NULL,
  `IdWaste` int(11) NOT NULL,
  `name_hostname` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `bin`
--

INSERT INTO `bin` (`id`, `name`, `weight`, `max_weight`, `IdWaste`, `name_hostname`) VALUES
(1, '2B-000-01', 80, '100', 1, 'PCS-01'),
(2, '2B-000-02', 81, '100', 1, 'PCS-02');

-- --------------------------------------------------------

--
-- Table structure for table `collection`
--

CREATE TABLE `collection` (
  `id` int(11) NOT NULL,
  `Idbadge` int(11) NOT NULL,
  `Idcontainer` int(11) NOT NULL,
  `Idwaste` int(11) NOT NULL,
  `CreatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `container`
--

CREATE TABLE `container` (
  `containerId` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `station` varchar(100) NOT NULL,
  `IdWaste` int(11) NOT NULL,
  `weightbin` int(11) NOT NULL,
  `status` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `container`
--

INSERT INTO `container` (`containerId`, `name`, `station`, `IdWaste`, `weightbin`, `status`) VALUES
(1, 'PCS-17', 'Coil', 1, 0, 0);

-- --------------------------------------------------------

--
-- Table structure for table `disposewaste`
--

CREATE TABLE `disposewaste` (
  `id` int(11) NOT NULL,
  `Idbadge` int(11) NOT NULL,
  `Idcontainer` int(11) NOT NULL,
  `Idwaste` int(11) NOT NULL,
  `CreatedAt` int(11) NOT NULL,
  `neto` decimal(10,0) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `employee`
--

CREATE TABLE `employee` (
  `id` int(11) NOT NULL,
  `username` varchar(100) NOT NULL,
  `isactive` int(11) NOT NULL,
  `badgeId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `employee`
--

INSERT INTO `employee` (`id`, `username`, `isactive`, `badgeId`) VALUES
(1, 'Admin', 1, 123);

-- --------------------------------------------------------

--
-- Table structure for table `transaction`
--

CREATE TABLE `transaction` (
  `id` int(11) NOT NULL,
  `badgeId` int(11) NOT NULL,
  `idContainer` int(11) NOT NULL,
  `idWaste` int(11) NOT NULL,
  `recordDate` datetime NOT NULL DEFAULT current_timestamp(),
  `neto` decimal(10,0) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `transaction`
--

INSERT INTO `transaction` (`id`, `badgeId`, `idContainer`, `idWaste`, `recordDate`, `neto`) VALUES
(5, 123, 1, 1, '2024-05-19 19:53:22', '0'),
(16, 123, 1, 1, '2024-05-19 20:36:08', '0'),
(17, 123, 1, 1, '2024-05-19 20:37:03', '0'),
(18, 123, 1, 1, '2024-05-19 20:37:09', '0'),
(19, 123, 1, 1, '2024-05-19 21:17:04', '0'),
(20, 123, 1, 1, '2024-05-19 21:20:12', '0'),
(21, 123, 1, 1, '2024-05-19 21:20:54', '0'),
(22, 123, 1, 1, '2024-05-19 21:24:34', '0'),
(23, 123, 1, 1, '2024-05-19 21:26:29', '0'),
(24, 123, 1, 1, '2024-05-19 21:28:45', '0'),
(25, 123, 1, 1, '2024-05-19 21:31:31', '0'),
(26, 123, 1, 1, '2024-05-19 21:35:38', '0'),
(27, 123, 1, 1, '2024-05-19 21:35:52', '0'),
(28, 123, 1, 1, '2024-05-19 21:37:35', '0'),
(29, 123, 1, 1, '2024-05-19 21:39:28', '0'),
(30, 123, 1, 1, '2024-05-19 21:43:43', '0'),
(31, 123, 1, 1, '2024-05-19 21:47:23', '0'),
(32, 123, 1, 1, '2024-05-19 21:47:54', '0'),
(33, 123, 1, 1, '2024-05-19 21:49:40', '0'),
(34, 123, 1, 1, '2024-05-20 09:53:04', '0'),
(35, 123, 1, 1, '2024-05-20 10:02:55', '0');

-- --------------------------------------------------------

--
-- Table structure for table `waste`
--

CREATE TABLE `waste` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `waste`
--

INSERT INTO `waste` (`id`, `name`, `createdAt`, `updatedAt`) VALUES
(1, 'Iron', '2024-05-17 15:28:08', '2024-05-17 15:28:08');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `bin`
--
ALTER TABLE `bin`
  ADD PRIMARY KEY (`id`),
  ADD KEY `bin_ibfk_1` (`IdWaste`);

--
-- Indexes for table `container`
--
ALTER TABLE `container`
  ADD PRIMARY KEY (`containerId`),
  ADD KEY `container_ibfk_1` (`IdWaste`);

--
-- Indexes for table `disposewaste`
--
ALTER TABLE `disposewaste`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `employee`
--
ALTER TABLE `employee`
  ADD PRIMARY KEY (`id`),
  ADD KEY `badgeId` (`badgeId`);

--
-- Indexes for table `transaction`
--
ALTER TABLE `transaction`
  ADD PRIMARY KEY (`id`),
  ADD KEY `badgeId` (`badgeId`),
  ADD KEY `idContainer` (`idContainer`),
  ADD KEY `idWaste` (`idWaste`);

--
-- Indexes for table `waste`
--
ALTER TABLE `waste`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `bin`
--
ALTER TABLE `bin`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `container`
--
ALTER TABLE `container`
  MODIFY `containerId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `disposewaste`
--
ALTER TABLE `disposewaste`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `employee`
--
ALTER TABLE `employee`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `transaction`
--
ALTER TABLE `transaction`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- AUTO_INCREMENT for table `waste`
--
ALTER TABLE `waste`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `bin`
--
ALTER TABLE `bin`
  ADD CONSTRAINT `bin_ibfk_1` FOREIGN KEY (`IdWaste`) REFERENCES `waste` (`id`);

--
-- Constraints for table `container`
--
ALTER TABLE `container`
  ADD CONSTRAINT `container_ibfk_1` FOREIGN KEY (`IdWaste`) REFERENCES `waste` (`id`);

--
-- Constraints for table `transaction`
--
ALTER TABLE `transaction`
  ADD CONSTRAINT `transaction_ibfk_1` FOREIGN KEY (`badgeId`) REFERENCES `employee` (`badgeId`),
  ADD CONSTRAINT `transaction_ibfk_2` FOREIGN KEY (`idContainer`) REFERENCES `container` (`containerId`),
  ADD CONSTRAINT `transaction_ibfk_3` FOREIGN KEY (`idWaste`) REFERENCES `waste` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
