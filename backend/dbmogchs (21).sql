-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 25, 2025 at 05:05 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `dbmogchs`
--

-- --------------------------------------------------------

--
-- Table structure for table `sms_logs`
--

CREATE TABLE `sms_logs` (
  `id` int(11) NOT NULL,
  `to_number` varchar(20) NOT NULL,
  `message` text NOT NULL,
  `sent_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` varchar(50) DEFAULT 'sent'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sms_logs`
--

INSERT INTO `sms_logs` (`id`, `to_number`, `message`, `sent_at`, `status`) VALUES
(1, '+639056548089', 'asd', '2025-08-12 04:46:15', 'failed');

-- --------------------------------------------------------

--
-- Table structure for table `tbldocument`
--

CREATE TABLE `tbldocument` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `userId` varchar(50) NOT NULL,
  `createdAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbldocument`
--

INSERT INTO `tbldocument` (`id`, `name`, `userId`, `createdAt`) VALUES
(5, 'SF10', '02-1819-01509', '2025-07-24 14:01:00'),
(6, 'Diploma', '02-1819-01509', '2025-07-24 14:01:00'),
(7, 'CAV', '02-1819-01509', '2025-07-24 14:01:00'),
(8, 'Certificate of Enrollments', '02-1819-01509', '2025-07-24 14:01:00');

-- --------------------------------------------------------

--
-- Table structure for table `tbldocumentrequirement`
--

CREATE TABLE `tbldocumentrequirement` (
  `id` int(11) NOT NULL,
  `documentId` int(11) NOT NULL,
  `requirementTId` int(11) NOT NULL,
  `userId` varchar(50) NOT NULL,
  `createdAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbldocumentrequirement`
--

INSERT INTO `tbldocumentrequirement` (`id`, `documentId`, `requirementTId`, `userId`, `createdAt`) VALUES
(1, 7, 1, '02-1819-01509', '2025-08-20 11:19:15'),
(2, 6, 2, '02-1819-01509', '2025-08-20 11:19:15'),
(7, 5, 3, '02-1819-01509', '2025-08-26 21:40:09');

-- --------------------------------------------------------

--
-- Table structure for table `tblexpecteddays`
--

CREATE TABLE `tblexpecteddays` (
  `id` int(11) NOT NULL,
  `days` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tblexpecteddays`
--

INSERT INTO `tblexpecteddays` (`id`, `days`) VALUES
(1, 7);

-- --------------------------------------------------------

--
-- Table structure for table `tblforgotlrn`
--

CREATE TABLE `tblforgotlrn` (
  `id` int(11) NOT NULL,
  `firstname` varchar(50) NOT NULL,
  `lastname` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `is_processed` tinyint(1) NOT NULL DEFAULT 0,
  `processed_by` varchar(50) DEFAULT NULL,
  `processed_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tblforgotlrn`
--

INSERT INTO `tblforgotlrn` (`id`, `firstname`, `lastname`, `email`, `is_processed`, `processed_by`, `processed_at`, `created_at`) VALUES
(1, 'Ralph', 'Gallegos', 'ralp.pelino11@gmail.com', 0, NULL, NULL, '2025-09-01 11:02:31');

-- --------------------------------------------------------

--
-- Table structure for table `tblgradelevel`
--

CREATE TABLE `tblgradelevel` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `userId` varchar(50) DEFAULT NULL,
  `createdAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tblgradelevel`
--

INSERT INTO `tblgradelevel` (`id`, `name`, `userId`, `createdAt`) VALUES
(1, 'Grade 11', NULL, '2025-07-29 04:14:38'),
(2, 'Grade 12', NULL, '2025-07-29 04:14:38');

-- --------------------------------------------------------

--
-- Table structure for table `tblpurpose`
--

CREATE TABLE `tblpurpose` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `documentId` int(11) NOT NULL,
  `userId` varchar(50) NOT NULL,
  `createdAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tblpurpose`
--

INSERT INTO `tblpurpose` (`id`, `name`, `documentId`, `userId`, `createdAt`) VALUES
(1, 'EMPLOYMENT ABROAD', 7, '02-1819-01500', '2025-08-31 04:24:58'),
(2, 'FIANCE VISA', 7, '02-1819-01500', '2025-08-31 04:24:58'),
(3, 'STUDENT VISA', 7, '02-1819-01500', '2025-08-31 04:24:58'),
(4, 'SEAMAN’S BOOK/SRC', 7, '02-1819-01509', '2025-08-31 04:24:58'),
(5, 'TOURIST VISA', 7, '02-1819-01500', '2025-08-31 04:24:58'),
(6, 'DESCENDANT’S VISA', 7, '02-1819-01500', '2025-08-31 04:24:58'),
(7, 'MIGRATION ABROAD', 7, '02-1819-01500', '2025-08-31 04:24:58'),
(8, 'REIMBURSEMENT OF EDUCATIONAL ALLOWANCE / TUITION FEES OF CHILDREN OF OFWs			        \r\n', 7, '02-1819-01500', '2025-08-31 04:24:58'),
(9, 'SUCH OTHER PURPOSE AS MAYBE REQUIRED BY THE DFA', 7, '02-1819-01500', '2025-08-31 04:24:58');

-- --------------------------------------------------------

--
-- Table structure for table `tblreleaseschedule`
--

CREATE TABLE `tblreleaseschedule` (
  `id` int(11) NOT NULL,
  `requestId` int(11) NOT NULL,
  `userId` varchar(50) NOT NULL,
  `dateSchedule` date NOT NULL,
  `createdAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tblreleaseschedule`
--

INSERT INTO `tblreleaseschedule` (`id`, `requestId`, `userId`, `dateSchedule`, `createdAt`) VALUES
(1, 1, '02-1819-01500', '2025-10-01', '2025-09-25 09:48:34');

-- --------------------------------------------------------

--
-- Table structure for table `tblrequest`
--

CREATE TABLE `tblrequest` (
  `id` int(11) NOT NULL,
  `studentId` varchar(50) NOT NULL,
  `documentId` int(11) NOT NULL,
  `purpose` varchar(100) DEFAULT NULL,
  `createdAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tblrequest`
--

INSERT INTO `tblrequest` (`id`, `studentId`, `documentId`, `purpose`, `createdAt`) VALUES
(1, '33333333', 5, 'enrollment college', '2025-09-14 03:09:20'),
(2, '33333333', 6, 'working', '2025-09-25 10:30:09');

-- --------------------------------------------------------

--
-- Table structure for table `tblrequestpurpose`
--

CREATE TABLE `tblrequestpurpose` (
  `id` int(11) NOT NULL,
  `requestId` int(11) NOT NULL,
  `purposeId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tblrequeststatus`
--

CREATE TABLE `tblrequeststatus` (
  `id` int(11) NOT NULL,
  `requestId` int(11) NOT NULL,
  `statusId` int(11) NOT NULL,
  `userId` varchar(50) DEFAULT NULL,
  `createdAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tblrequeststatus`
--

INSERT INTO `tblrequeststatus` (`id`, `requestId`, `statusId`, `userId`, `createdAt`) VALUES
(1, 1, 1, NULL, '2025-09-14 03:09:20'),
(2, 1, 2, NULL, '2025-09-25 09:48:24'),
(3, 1, 3, NULL, '2025-09-25 09:48:25'),
(4, 1, 4, NULL, '2025-09-25 09:48:38'),
(5, 1, 5, NULL, '2025-09-25 09:48:40'),
(6, 2, 1, NULL, '2025-09-25 10:30:09'),
(10, 2, 2, '02-1819-01500', '2025-09-25 10:56:59'),
(11, 2, 3, '02-1819-01500', '2025-09-25 11:05:10');

-- --------------------------------------------------------

--
-- Table structure for table `tblrequirementcomments`
--

CREATE TABLE `tblrequirementcomments` (
  `id` int(11) NOT NULL,
  `requirementId` int(11) NOT NULL,
  `requestId` int(11) NOT NULL,
  `registrarId` varchar(50) NOT NULL,
  `comment` text NOT NULL,
  `status` enum('pending','resolved') NOT NULL DEFAULT 'pending',
  `isNotified` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `isMarkAsRead` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tblrequirements`
--

CREATE TABLE `tblrequirements` (
  `id` int(11) NOT NULL,
  `requestId` int(11) NOT NULL,
  `filepath` varchar(250) NOT NULL,
  `typeId` int(11) NOT NULL,
  `createdAt` datetime NOT NULL,
  `isAdditional` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tblrequirements`
--

INSERT INTO `tblrequirements` (`id`, `requestId`, `filepath`, `typeId`, `createdAt`, `isAdditional`) VALUES
(1, 2, '494687654_692122813767152_4225768431343115829_n.jpg', 2, '2025-09-25 10:30:09', 0);

-- --------------------------------------------------------

--
-- Table structure for table `tblrequirementstype`
--

CREATE TABLE `tblrequirementstype` (
  `id` int(11) NOT NULL,
  `nameType` varchar(50) NOT NULL,
  `userId` varchar(50) DEFAULT NULL,
  `createdAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tblrequirementstype`
--

INSERT INTO `tblrequirementstype` (`id`, `nameType`, `userId`, `createdAt`) VALUES
(1, 'Diploma', NULL, '2025-07-25 07:04:12'),
(2, 'Affidavit of Loss', NULL, '2025-07-25 07:04:12'),
(3, 'Request Letter', '02-1819-01509', '2025-08-20 11:20:10');

-- --------------------------------------------------------

--
-- Table structure for table `tblschoolyear`
--

CREATE TABLE `tblschoolyear` (
  `id` int(11) NOT NULL,
  `year` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tblschoolyear`
--

INSERT INTO `tblschoolyear` (`id`, `year`) VALUES
(1, '2022-2023'),
(2, '2023-2024'),
(3, '2024-2025'),
(4, '2025-2026');

-- --------------------------------------------------------

--
-- Table structure for table `tblsection`
--

CREATE TABLE `tblsection` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `userId` varchar(50) DEFAULT NULL,
  `gradeLevelId` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tblsection`
--

INSERT INTO `tblsection` (`id`, `name`, `userId`, `gradeLevelId`, `createdAt`) VALUES
(1, 'Efficient', NULL, 1, '2025-07-30 15:42:15'),
(2, 'Elegant', NULL, 1, '2025-07-30 15:42:15'),
(3, 'Eligible', NULL, 1, '2025-07-30 15:42:15'),
(4, 'Eloquent', NULL, 1, '2025-07-30 15:42:15'),
(5, 'Empowered', NULL, 1, '2025-07-30 15:42:15'),
(6, 'Enduring', NULL, 1, '2025-07-30 15:42:15'),
(7, 'Enthusiasm', NULL, 1, '2025-07-30 15:42:15'),
(8, 'Evident', NULL, 1, '2025-07-30 15:42:15'),
(9, 'Raindrops', '02-1819-01500', 2, '2025-08-05 03:03:31'),
(10, 'Rooftop', '02-1819-01500', 2, '2025-08-05 03:03:31');

-- --------------------------------------------------------

--
-- Table structure for table `tblsfrecord`
--

CREATE TABLE `tblsfrecord` (
  `id` int(11) NOT NULL,
  `fileName` varchar(100) DEFAULT NULL,
  `studentId` varchar(50) NOT NULL,
  `gradeLevelId` int(11) NOT NULL,
  `userId` varchar(50) DEFAULT NULL,
  `createdAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tblsfrecord`
--

INSERT INTO `tblsfrecord` (`id`, `fileName`, `studentId`, `gradeLevelId`, `userId`, `createdAt`) VALUES
(119, 'SF10 - Patty (2).xlsx', '33333333', 1, '47718333', '2025-08-20 16:06:01'),
(120, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '128164140135', 1, '4771830', '2025-08-20 22:21:31'),
(121, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127964120138', 1, '4771830', '2025-08-20 22:21:31'),
(122, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127940140437', 1, '4771830', '2025-08-20 22:21:31'),
(123, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127940120016', 1, '4771830', '2025-08-20 22:21:31'),
(124, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127940140219', 1, '4771830', '2025-08-20 22:21:31'),
(125, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '133218140022', 1, '4771830', '2025-08-20 22:21:31'),
(126, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '136913130093', 1, '4771830', '2025-08-20 22:21:31'),
(127, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127993150140', 1, '4771830', '2025-08-20 22:21:31'),
(128, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127995140395', 1, '4771830', '2025-08-20 22:21:31'),
(129, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127955160159', 1, '4771830', '2025-08-20 22:21:31'),
(130, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127967140004', 1, '4771830', '2025-08-20 22:21:31'),
(131, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127992130267', 1, '4771830', '2025-08-20 22:21:31'),
(132, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '126917140008', 1, '4771830', '2025-08-20 22:21:32'),
(133, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '117851130016', 1, '4771830', '2025-08-20 22:21:32'),
(134, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127739130002', 1, '4771830', '2025-08-20 22:21:32'),
(135, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127940140193', 1, '4771830', '2025-08-20 22:21:32'),
(136, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127940140983', 1, '4771830', '2025-08-20 22:21:32'),
(137, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '510062400004', 1, '4771830', '2025-08-20 22:21:32'),
(138, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127955130399', 1, '4771830', '2025-08-20 22:21:32'),
(139, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127940141023', 1, '4771830', '2025-08-20 22:21:32'),
(140, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '201511140006', 1, '4771830', '2025-08-20 22:21:32'),
(141, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '405241150066', 1, '4771830', '2025-08-20 22:21:32'),
(142, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127955130057', 1, '4771830', '2025-08-20 22:21:32'),
(143, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127995140316', 1, '4771830', '2025-08-20 22:21:32'),
(144, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127993140162', 1, '4771830', '2025-08-20 22:21:32'),
(145, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127967140604', 1, '4771830', '2025-08-20 22:21:32'),
(146, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127956120328', 1, '4771830', '2025-08-20 22:21:32'),
(147, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127940120831', 1, '4771830', '2025-08-20 22:21:32'),
(148, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '132287150182', 1, '4771830', '2025-08-20 22:21:33'),
(149, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127942140607', 1, '4771830', '2025-08-20 22:21:33'),
(150, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '126577140110', 1, '4771830', '2025-08-20 22:21:33'),
(151, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127955080148', 1, '4771830', '2025-08-20 22:21:33'),
(152, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '405155150193', 1, '4771830', '2025-08-20 22:21:33'),
(153, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127940140743', 1, '4771830', '2025-08-20 22:21:33'),
(154, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127941140398', 1, '4771830', '2025-08-20 22:21:33'),
(155, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127995140980', 1, '4771830', '2025-08-20 22:21:33'),
(156, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '131632140039', 1, '4771830', '2025-08-20 22:21:33'),
(157, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127941130349', 1, '4771830', '2025-08-20 22:21:33'),
(158, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127867140141', 1, '4771830', '2025-08-20 22:21:33'),
(159, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127956140332', 1, '4771830', '2025-08-20 22:21:33'),
(160, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127995141346', 1, '4771830', '2025-08-20 22:21:33'),
(161, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127941140331', 1, '4771830', '2025-08-20 22:21:33'),
(162, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127966120298', 1, '4771830', '2025-08-20 22:21:33'),
(163, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127941140475', 1, '4771830', '2025-08-20 22:21:33'),
(165, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127995130887', 1, '02-1819-01500', '2025-08-20 22:34:50'),
(166, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127942140395', 1, '02-1819-01500', '2025-08-20 22:34:50'),
(167, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127955130297', 1, '02-1819-01500', '2025-08-20 22:34:50'),
(168, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127940140258', 1, '02-1819-01500', '2025-08-20 22:34:50'),
(169, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127957140185', 1, '02-1819-01500', '2025-08-20 22:34:50'),
(170, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127940141288', 1, '02-1819-01500', '2025-08-20 22:34:50'),
(171, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '131662140006', 1, '02-1819-01500', '2025-08-20 22:34:50'),
(172, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127944140614', 1, '02-1819-01500', '2025-08-20 22:34:50'),
(173, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '132601150002', 1, '02-1819-01500', '2025-08-20 22:34:50'),
(174, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127940140510', 1, '02-1819-01500', '2025-08-20 22:34:50'),
(175, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '119453140027', 1, '02-1819-01500', '2025-08-20 22:34:50'),
(176, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127944140444', 1, '02-1819-01500', '2025-08-20 22:34:50'),
(177, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '131260120551', 1, '02-1819-01500', '2025-08-20 22:34:50'),
(178, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127958140077', 1, '02-1819-01500', '2025-08-20 22:34:50'),
(179, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127842140143', 1, '02-1819-01500', '2025-08-20 22:34:50'),
(180, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '405176150009', 1, '02-1819-01500', '2025-08-20 22:34:50'),
(181, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127620110113', 1, '02-1819-01500', '2025-08-20 22:34:50'),
(182, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '133527150140', 1, '02-1819-01500', '2025-08-20 22:34:51'),
(183, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '18', 1, '02-1819-01500', '2025-08-20 22:34:51'),
(184, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127963130086', 1, '02-1819-01500', '2025-08-20 22:34:51'),
(185, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127940150223', 1, '02-1819-01500', '2025-08-20 22:34:51'),
(186, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '126277140066', 1, '02-1819-01500', '2025-08-20 22:34:51'),
(187, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '126462140017', 1, '02-1819-01500', '2025-08-20 22:34:51'),
(188, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127962140118', 1, '02-1819-01500', '2025-08-20 22:34:51'),
(189, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127962140294', 1, '02-1819-01500', '2025-08-20 22:34:51'),
(190, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127955140138', 1, '02-1819-01500', '2025-08-20 22:34:51'),
(191, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127940140528', 1, '02-1819-01500', '2025-08-20 22:34:51'),
(192, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127995141261', 1, '02-1819-01500', '2025-08-20 22:34:51'),
(193, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127591140053', 1, '02-1819-01500', '2025-08-20 22:34:51'),
(194, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127941140436', 1, '02-1819-01500', '2025-08-20 22:34:51'),
(195, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127958140100', 1, '02-1819-01500', '2025-08-20 22:34:51'),
(196, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127940140472', 1, '02-1819-01500', '2025-08-20 22:34:51'),
(197, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127940140683', 1, '02-1819-01500', '2025-08-20 22:34:51'),
(198, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '126340130018', 1, '02-1819-01500', '2025-08-20 22:34:52'),
(199, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127940150614', 1, '02-1819-01500', '2025-08-20 22:34:52'),
(200, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127955140083', 1, '02-1819-01500', '2025-08-20 22:34:52'),
(201, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127995141402', 1, '02-1819-01500', '2025-08-20 22:34:52'),
(202, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127958140020', 1, '02-1819-01500', '2025-08-20 22:34:52'),
(203, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '126905140061', 1, '02-1819-01500', '2025-08-20 22:34:52'),
(204, 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx', '127954140318', 1, '02-1819-01500', '2025-08-20 22:34:52'),
(207, 'SF10 - Patty (2).xlsx', '99999', 1, '47718333', '2025-08-31 16:00:42'),
(209, 'SF10 - Patty - grade 12 (1).xlsx', '33333333', 2, '4771833', '2025-09-23 21:22:46');

-- --------------------------------------------------------

--
-- Table structure for table `tblstatus`
--

CREATE TABLE `tblstatus` (
  `id` int(11) NOT NULL,
  `name` varchar(20) NOT NULL,
  `userId` varchar(50) DEFAULT NULL,
  `createdAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tblstatus`
--

INSERT INTO `tblstatus` (`id`, `name`, `userId`, `createdAt`) VALUES
(1, 'Pending', NULL, '2025-07-24 13:52:56'),
(2, 'Processed', NULL, '2025-07-24 13:52:56'),
(3, 'Signatory', NULL, '2025-07-24 13:52:56'),
(4, 'Release', NULL, '2025-07-24 13:52:56'),
(5, 'Completed', NULL, '2025-07-24 13:52:56'),
(7, 'Cancelled', NULL, '2025-08-31 14:09:48');

-- --------------------------------------------------------

--
-- Table structure for table `tblstrand`
--

CREATE TABLE `tblstrand` (
  `id` int(11) NOT NULL,
  `trackId` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `createdAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tblstrand`
--

INSERT INTO `tblstrand` (`id`, `trackId`, `name`, `createdAt`) VALUES
(1, 1, 'STEM', '2025-08-06 10:58:22'),
(2, 1, 'TVL', '2025-08-06 10:58:22'),
(3, 1, 'ABM', '2025-08-06 10:58:22'),
(4, 1, 'HUMSS', '2025-08-06 10:58:22');

-- --------------------------------------------------------

--
-- Table structure for table `tblstudent`
--

CREATE TABLE `tblstudent` (
  `id` varchar(50) NOT NULL,
  `firstname` varchar(50) NOT NULL,
  `middlename` varchar(50) NOT NULL,
  `lastname` varchar(50) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `contactNo` varchar(100) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `userLevel` int(11) NOT NULL,
  `lrn` varchar(50) DEFAULT NULL,
  `strandId` int(11) DEFAULT NULL,
  `birthDate` date DEFAULT NULL,
  `birthPlace` varchar(250) NOT NULL,
  `age` int(11) DEFAULT NULL,
  `religion` varchar(100) DEFAULT NULL,
  `completeAddress` text DEFAULT NULL,
  `fatherName` varchar(255) DEFAULT NULL,
  `motherName` varchar(255) DEFAULT NULL,
  `guardianName` varchar(255) DEFAULT NULL,
  `guardianRelationship` varchar(100) DEFAULT NULL,
  `sectionId` int(11) DEFAULT NULL,
  `schoolyearId` int(11) NOT NULL,
  `gradeLevelId` int(11) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tblstudent`
--

INSERT INTO `tblstudent` (`id`, `firstname`, `middlename`, `lastname`, `email`, `contactNo`, `password`, `userLevel`, `lrn`, `strandId`, `birthDate`, `birthPlace`, `age`, `religion`, `completeAddress`, `fatherName`, `motherName`, `guardianName`, `guardianRelationship`, `sectionId`, `schoolyearId`, `gradeLevelId`, `createdAt`, `updatedAt`) VALUES
('117851130016', 'STEPHEN', 'CABALLERO', 'JOHNSON', NULL, NULL, '$2y$10$XxnfSYDm7EYTCrIi5qgH7eB.fu4BcBX16yjn0r3nxB4WMmvx0f7WW', 4, '117851130016', 2, '0000-00-00', '', 16, 'Christianity', '', '', '', '', '', 3, 4, 1, '2025-08-20 14:21:32', '2025-08-20 14:21:32'),
('119453140027', 'MARTIN', 'NICOLE TAYO', 'HABONITA', NULL, NULL, '$2y$10$TQ.LhjaTOTie8kXpd/1NguGaEIoobnnqlcNUAruZ/f77LbLDi9NCq', 4, '119453140027', 3, '0000-00-00', '', 16, 'Christianity', '', '', '', '', '', 4, 4, 1, '2025-08-20 14:34:50', '2025-08-20 14:34:50'),
('126277140066', 'CHELLIE', 'ASHLY AMANTE', 'BADBAD', NULL, NULL, '$2y$10$aDnaqsKTFz3LF7MZ10iui.kRIlTL2Jl1jh29mnLHZ5ujvqrcdwm5.', 4, '126277140066', 3, '0000-00-00', '', 16, 'Christianity', '', '', '', '', '', 4, 4, 1, '2025-08-20 14:34:51', '2025-08-20 14:34:51'),
('126340130018', 'KIRBY', 'KATE NEPOMUCINO', 'REPUELA', NULL, NULL, '$2y$10$mhJdQmUIFFiFd6KRjf8Zjuy0zP/jpE9Oju8lmQP41R/2n9KvOQHnS', 4, '126340130018', 3, '0000-00-00', '', 17, 'Christianity', '', '', '', '', '', 4, 4, 1, '2025-08-20 14:34:52', '2025-08-20 14:34:52'),
('126462140017', 'DONNA', 'FATE PAÑA', 'BAGUHIN', NULL, NULL, '$2y$10$nw3XUsHb3K0PXF8ODj2geu7SEgroRe9HtsFDv.rp1V0.VA.yNDjJS', 4, '126462140017', 3, '0000-00-00', '', 16, 'Christianity', '', '', '', '', '', 4, 4, 1, '2025-08-20 14:34:51', '2025-08-20 14:34:51'),
('126577140110', 'JELYN', 'ORONG', 'GUINLAMON', NULL, NULL, '$2y$10$qgLI4pxI8feSWPdnhL3fx.VQCPqy0REYU6LolQOvl0gEoeuiOhu2y', 4, '126577140110', 2, '0000-00-00', '', 15, 'Christianity', '', '', '', '', '', 3, 4, 1, '2025-08-20 14:21:33', '2025-08-20 14:21:33'),
('126905140061', 'RICHYLEN', 'FABIAÑA', 'TARDE', NULL, NULL, '$2y$10$3SMo/q3IiwsJ3KTJgHVF.uFZRuc3HlRi8QwI9BFJLrmHV6wzOvjhK', 4, '126905140061', 3, '0000-00-00', '', 16, 'Christianity', '', '', '', '', '', 4, 4, 1, '2025-08-20 14:34:52', '2025-08-20 14:34:52'),
('126917140008', 'JHANSSEN', 'DEMETERIO', 'GONZALES', NULL, NULL, '$2y$10$yUV/sgRSy82qNXvt8ay4ie6i2U5hTnNl7JNuEWy2GYiqW97UXoCa.', 4, '126917140008', 2, '0000-00-00', '', 16, 'Christianity', '', '', '', '', '', 3, 4, 1, '2025-08-20 14:21:32', '2025-08-20 14:21:32'),
('127591140053', 'JASSEL', 'QUITOS', 'HINDOY', NULL, NULL, '$2y$10$a4FO47xsWAi7Vw.pgrD63.pBjWSFQeNjoK1tGa7R4O7kUPwlff14i', 4, '127591140053', 3, '0000-00-00', '', 15, 'Christianity', '', '', '', '', '', 4, 4, 1, '2025-08-20 14:34:51', '2025-08-20 14:34:51'),
('127620110113', 'JADE', 'ETOR', 'PETALCORIN', NULL, NULL, '$2y$10$oYPWBOGOz62MPZtlEoaVqePLWkxr4l6pABL4ydikzq1oV5kG.Qpte', 4, '127620110113', 3, '0000-00-00', '', 18, 'Christianity', '', '', '', '', '', 4, 4, 1, '2025-08-20 14:34:50', '2025-08-20 14:34:50'),
('127739130002', 'ZACHARY', 'JOFER MONTEJO', 'JUELE', NULL, NULL, '$2y$10$L4tOSF8H534cVHqOCwmbXuAUZYvW0Q7fEqeBZgIFTy/DkT32EK9Ke', 4, '127739130002', 2, '0000-00-00', '', 17, 'Christianity', '', '', '', '', '', 3, 4, 1, '2025-08-20 14:21:32', '2025-08-20 14:21:32'),
('127842140143', 'LEXTER', 'ANDO', 'OYAO', NULL, NULL, '$2y$10$fyy8.8G213j5mZbQEVbUtuYCgHHn7LmKHa791I/JtzYD2Il4bXNgS', 4, '127842140143', 3, '0000-00-00', '', 16, 'Christianity', '', '', '', '', '', 4, 4, 1, '2025-08-20 14:34:50', '2025-08-20 14:34:50'),
('127867140141', 'PRINCESS', 'NICOLE UNABIA', 'SARANGA', NULL, NULL, '$2y$10$32cJ4.vd5tVAqSyYbpm0w.d.3TLvtGfDchkos9AvpOHq4yATSEbNW', 4, '127867140141', 2, '0000-00-00', '', 16, 'Christianity', '', '', '', '', '', 3, 4, 1, '2025-08-20 14:21:33', '2025-08-20 14:21:33'),
('127940120016', 'JHON', 'ELMER CAILING', 'BALDONADE', NULL, NULL, '$2y$10$J.2ux.gQOJObk16EFjpRiO1jB8O26MMdRbN3re9SQO2tHdI8vv2hC', 4, '127940120016', 2, '0000-00-00', '', 18, 'Christianity', '', '', '', '', '', 3, 4, 1, '2025-08-20 14:21:31', '2025-08-20 14:21:31'),
('127940120831', 'AVA', 'KRISTA MARCELINO', 'CABAYACRUZ', NULL, NULL, '$2y$10$2kz9MbfvY3NHGyOEInKbXev.AIMptHyxMG3n/cOfaBJHqnI9PDgQK', 4, '127940120831', 2, '0000-00-00', '', 19, 'Christianity', '', '', '', '', '', 3, 4, 1, '2025-08-20 14:21:32', '2025-08-20 14:21:32'),
('127940140193', 'LOUISE', 'MIGUEL SUMAMPONG', 'KUIZON', NULL, NULL, '$2y$10$gYCNU6Tp289jHkSXr6KfU.fwEGhqaeu6uyblCZlX0/i7Hl4sQaaTa', 4, '127940140193', 2, '0000-00-00', '', 15, 'Christianity', '', '', '', '', '', 3, 4, 1, '2025-08-20 14:21:32', '2025-08-20 14:21:32'),
('127940140219', 'ALJADE', 'METODA', 'CABAÑEROS', NULL, NULL, '$2y$10$FIT9CYhhsMSk00ppLwkiU.5aiCjYjo.XGApJwxn.VCbCqZBE8xn3C', 4, '127940140219', 2, '0000-00-00', '', 15, 'Christianity', '', '', '', '', '', 3, 4, 1, '2025-08-20 14:21:31', '2025-08-20 14:21:31'),
('127940140258', 'DIONESIO', 'JR EMBALZADO', 'BALIGA', NULL, NULL, '$2y$10$cvxnMv0cEkZ0iOjt/q63xeCFVO/o37ZEuuB7.PS2zIss8h1yYlLiW', 4, '127940140258', 3, '0000-00-00', '', 16, 'Christianity', '', '', '', '', '', 4, 4, 1, '2025-08-20 14:34:50', '2025-08-20 14:34:50'),
('127940140437', 'JOEL', 'CUTANDA', 'AMPER', NULL, NULL, '$2y$10$Uzk5.MmPZOHsb50AnrTMNeYLBRQQmKwcnx4jTIlnZ0YLlgAoRkzQC', 4, '127940140437', 2, '0000-00-00', '', 15, 'Christianity', '', '', '', '', '', 3, 4, 1, '2025-08-20 14:21:31', '2025-08-20 14:21:31'),
('127940140472', 'SOPHIA', 'YVONNE BARON', 'MINISTER', NULL, NULL, '$2y$10$N/B/HEFejSmsPv081QpV4OzvZ0W3ny4xTcP/j/xtyE3HBODZ1L8vK', 4, '127940140472', 3, '0000-00-00', '', 16, 'Christianity', '', '', '', '', '', 4, 4, 1, '2025-08-20 14:34:51', '2025-08-20 14:34:51'),
('127940140510', 'JOHN', 'LOYD PEPITO', 'GUZMANA', NULL, NULL, '$2y$10$OofTxq71eBDn87/Oi.JjAu3TO3RXxCifL0Rp7kYr80knO3N6xYdVe', 4, '127940140510', 3, '0000-00-00', '', 16, 'Christianity', '', '', '', '', '', 4, 4, 1, '2025-08-20 14:34:50', '2025-08-20 14:34:50'),
('127940140528', 'ZANDRA', 'ROLLON', 'DIZON', NULL, NULL, '$2y$10$/0oIy0iklAJKEeTd0qZHmOVcdiF4Xy9ONR/qhEId4QcWfbvj7Zu52', 4, '127940140528', 3, '0000-00-00', '', 16, 'Christianity', '', '', '', '', '', 4, 4, 1, '2025-08-20 14:34:51', '2025-08-20 14:34:51'),
('127940140683', 'ELLAJOY', 'LOPEZ', 'NAPONE', NULL, NULL, '$2y$10$NxGW8qdf8LGQioJ1S9tpT..j/S5rG0RCWRKJgdx0.G7JJ77tWcKTi', 4, '127940140683', 3, '0000-00-00', '', 16, 'Christianity', '', '', '', '', '', 4, 4, 1, '2025-08-20 14:34:51', '2025-08-20 14:34:51'),
('127940140743', 'JENNIFER', 'GONZAGA', 'OCLARIT', NULL, NULL, '$2y$10$v5yh6DZHlCl5J0csSvMYZu6YM7Jvmov8EzQZpgDP8X2xB9YhRKeH.', 4, '127940140743', 2, '0000-00-00', '', 16, 'Christianity', '', '', '', '', '', 3, 4, 1, '2025-08-20 14:21:33', '2025-08-20 14:21:33'),
('127940140983', 'SANTINO', 'RHYNE CAW-IT', 'LONGGAKIT', NULL, NULL, '$2y$10$MpG11BuDtwoQ0XyQX5WGBer/tEBu/kAlnyqZ38cTi8P0SRsxaUubq', 4, '127940140983', 2, '0000-00-00', '', 15, 'Christianity', '', '', '', '', '', 3, 4, 1, '2025-08-20 14:21:32', '2025-08-20 14:21:32'),
('127940141023', 'HUNLEY', 'GEMILLA', 'PADIÑO', NULL, NULL, '$2y$10$YPsubVWNstJGoikU7.eI2eYaPuExsafy/pqjEPUhvZtQRP6C4CTHi', 4, '127940141023', 2, '0000-00-00', '', 16, 'Christianity', '', '', '', '', '', 3, 4, 1, '2025-08-20 14:21:32', '2025-08-20 14:21:32'),
('127940141288', 'ARVIN', 'JHON RECIPIDA', 'CASTILLO', NULL, NULL, '$2y$10$jhOogNa.lXxP/Sv9Beq8i.tkUfL4E9AO5Sj0QHhIUzeFd9eYW/gkW', 4, '127940141288', 3, '0000-00-00', '', 16, 'Christianity', '', '', '', '', '', 4, 4, 1, '2025-08-20 14:34:50', '2025-08-20 14:34:50'),
('127940150223', 'PRINCESS', 'APPLE AMANTE', 'ABRAGAN', NULL, NULL, '$2y$10$lN9POzi2tJJrvzKhuEl9letRqrWRngJ7uSecLLyPlEqYzHD8n.htm', 4, '127940150223', 3, '0000-00-00', '', 16, 'Christianity', '', '', '', '', '', 4, 4, 1, '2025-08-20 14:34:51', '2025-08-20 14:34:51'),
('127940150614', 'LEAH', 'GARCIA', 'SALINGAY', NULL, NULL, '$2y$10$zvf1aioo/3VQB3vCAnaPUOfkmfO0kJhs7quHzVaSfxAXP.4Asud26', 4, '127940150614', 3, '0000-00-00', '', 16, 'Christianity', '', '', '', '', '', 4, 4, 1, '2025-08-20 14:34:52', '2025-08-20 14:34:52'),
('127941130349', 'RAYSHELLE', 'SALARDA', 'REALISTA', NULL, NULL, '$2y$10$57l/o6fciwuyQHxa68.vCumo8gb5lYorgl.BFydGbF/x/qEqXErVG', 4, '127941130349', 2, '0000-00-00', '', 17, 'Christianity', '', '', '', '', '', 3, 4, 1, '2025-08-20 14:21:33', '2025-08-20 14:21:33'),
('127941140331', 'JUSTINE', 'MAE MENDOZA', 'YANO', NULL, NULL, '$2y$10$J4jlia235zADiYczGneTEu.zOmuXgRJoFFZnNwYJZUpKyIAOIClfS', 4, '127941140331', 2, '0000-00-00', '', 16, 'Christianity', '', '', '', '', '', 3, 4, 1, '2025-08-20 14:21:33', '2025-08-20 14:21:33'),
('127941140398', 'LEXXY', 'REALISTA', 'PAHUNANG', NULL, NULL, '$2y$10$MBpKhT7tXaxPh089Y5QCnu5Diw9VWrA3SgIM56jHGJXDQm6G226tG', 4, '127941140398', 2, '0000-00-00', '', 15, 'Christianity', '', '', '', '', '', 3, 4, 1, '2025-08-20 14:21:33', '2025-08-20 14:21:33'),
('127941140436', 'XYPRESS', 'ANGELA ESPITAL', 'JABINIAO', NULL, NULL, '$2y$10$toeCtwSCC.nxfikI6jCE2.4Ua949NueJSD1jpb9uCA/a.TL0hTzV6', 4, '127941140436', 3, '0000-00-00', '', 16, 'Christianity', '', '', '', '', '', 4, 4, 1, '2025-08-20 14:34:51', '2025-08-20 14:34:51'),
('127941140475', 'SHERRY', 'DELA CRUZ', 'YOUNG', NULL, NULL, '$2y$10$1dc5rAzaWKkgpQAboOSC/OCOEQeOuCzy84ffXi9u.oZbiibW5pitC', 4, '127941140475', 2, '0000-00-00', '', 17, 'Christianity', '', '', '', '', '', 3, 4, 1, '2025-08-20 14:21:33', '2025-08-20 14:21:33'),
('127942140395', 'ANDY', 'MIKE BONGCARON', 'ALGA', NULL, NULL, '$2y$10$Eg1gWcWnPqQ4BRhMeGOaKuhfG2bpNdoiDbhTipvU0iCnrNdVCWheu', 4, '127942140395', 3, '0000-00-00', '', 16, 'Christianity', '', '', '', '', '', 4, 4, 1, '2025-08-20 14:34:50', '2025-08-20 14:34:50'),
('127942140607', 'JESSA', 'LASTIMOSO', 'GENTAPA', NULL, NULL, '$2y$10$4VLr3ZeO4U8jeFN8WRZpjuOCNRiaEGm5Ue8VqvpBJ5/QKcdy8x7RS', 4, '127942140607', 2, '0000-00-00', '', 16, 'Christianity', '', '', '', '', '', 3, 4, 1, '2025-08-20 14:21:33', '2025-08-20 14:21:33'),
('127944140444', 'CLEVIN', 'MAR TABACO', 'JENISAN', NULL, NULL, '$2y$10$qhLar2mUxPi0XLzPlxJnvu2VR/OkeI.D7ND6VmISaoaQwrO4dkvLe', 4, '127944140444', 3, '0000-00-00', '', 17, 'Christianity', '', '', '', '', '', 4, 4, 1, '2025-08-20 14:34:50', '2025-08-20 14:34:50'),
('127944140614', 'JED', 'KURVEN TIPDAS', 'GERMANO', NULL, NULL, '$2y$10$krhs1g9BV1SywaZdEAdnLefRt8PUzOb.We0U.l2M4a5bMzi2bqZua', 4, '127944140614', 3, '0000-00-00', '', 15, 'Christianity', '', '', '', '', '', 4, 4, 1, '2025-08-20 14:34:50', '2025-08-20 14:34:50'),
('127954140318', 'LYN', 'SAGISABAL', 'TORRES', NULL, NULL, '$2y$10$svWRkXsUbVqyNd2WVh1G6OJviQG3DP8s3gxGFIw7uyEMHlSzwhCS6', 4, '127954140318', 3, '0000-00-00', '', 19, 'Christianity', '', '', '', '', '', 4, 4, 1, '2025-08-20 14:34:52', '2025-08-20 14:34:52'),
('127955080148', 'NASIFAH', 'BATUA', 'H SAID', NULL, NULL, '$2y$10$uCu1SjkeLsIwptKiXr/QQuTeZ4lIqs/fDLfv60AXOWo3a1B4PBKTe', 4, '127955080148', 2, '0000-00-00', '', 25, 'Islam', '', '', '', '', '', 3, 4, 1, '2025-08-20 14:21:33', '2025-08-20 14:21:33'),
('127955130057', 'KRAM', 'EMPIALES', 'SALAS', NULL, NULL, '$2y$10$pL6eoc5ivgfKyRUJAXhm3O963e2H0yz2wyAl0VGkuNGx0cRO9LL22', 4, '127955130057', 2, '0000-00-00', '', 17, 'Christianity', '', '', '', '', '', 3, 4, 1, '2025-08-20 14:21:32', '2025-08-20 14:21:32'),
('127955130297', 'ASLANIE', 'ABANTAS', 'ANSARY', NULL, NULL, '$2y$10$sIJiD2JVC7RnXsQ2xsIXlOfviIMSVnxlHkl20VQTflmlrGLkCcQja', 4, '127955130297', 3, '0000-00-00', '', 17, 'Islam', '', '', '', '', '', 4, 4, 1, '2025-08-20 14:34:50', '2025-08-20 14:34:50'),
('127955130399', 'RICKMERS', 'BASLI-AN', 'MINISTER', NULL, NULL, '$2y$10$TPC/KxxSOUv5G3BN/MyKnu6gikcOeNNtIy9ybdusCfs/6BR6HFP7u', 4, '127955130399', 2, '0000-00-00', '', 18, 'Christianity', '', '', '', '', '', 3, 4, 1, '2025-08-20 14:21:32', '2025-08-20 14:21:32'),
('127955140083', 'SHIELA', 'MAE BALABA', 'SALONOY', NULL, NULL, '$2y$10$dvPHCTnGCkWzmrCqgsmVa.Mimu.h8t8lktsw0JfemyNTqoPMxpmxq', 4, '127955140083', 3, '0000-00-00', '', 15, 'Christianity', '', '', '', '', '', 4, 4, 1, '2025-08-20 14:34:52', '2025-08-20 14:34:52'),
('127955140138', 'STEPHANIE', 'TUA', 'DIZON', NULL, NULL, '$2y$10$Esb6xWaIiQkfstCXlUKkDuOypTcTEOVigIfjCxqqABi79RLuYnpdK', 4, '127955140138', 3, '0000-00-00', '', 16, 'Christianity', '', '', '', '', '', 4, 4, 1, '2025-08-20 14:34:51', '2025-08-20 14:34:51'),
('127955160159', 'JEAMWHELL', 'DINOPOL', 'GENERALAO', NULL, NULL, '$2y$10$H8mJq9PXnpgzRkSwMABH9erj9lUQ9AZQ/u19WoLlV8gfBdcfvCMQW', 4, '127955160159', 2, '0000-00-00', '', 18, 'Christianity', '', '', '', '', '', 3, 4, 1, '2025-08-20 14:21:31', '2025-08-20 14:21:31'),
('127956120328', 'MARICEL', '-', 'CABACTULAN', NULL, NULL, '$2y$10$tWP3w1GPQyiqRb/wD30nseEqeZDCR7wZwriRd4ovAZYrAGmJmhidW', 4, '127956120328', 2, '0000-00-00', '', 18, 'Christianity', '', '', '', '', '', 3, 4, 1, '2025-08-20 14:21:32', '2025-08-20 14:21:32'),
('127956140332', 'SAMANTHA', 'ABECIA', 'TIBURON', NULL, NULL, '$2y$10$SXr3WcCMdI/.tOLgGi0iCeVFDo0ZAfJCszp0GLRgoqBxibgcxCzb2', 4, '127956140332', 2, '0000-00-00', '', 16, 'Christianity', '', '', '', '', '', 3, 4, 1, '2025-08-20 14:21:33', '2025-08-20 14:21:33'),
('127957140185', 'RONALD', 'CELIS', 'CAIÑA', NULL, NULL, '$2y$10$H2TpuB.J7PSBlja2EWFKv.1sOjCaeQlSg66Mkq3uRPtpia/fOT4AO', 4, '127957140185', 3, '0000-00-00', '', 15, 'Christianity', '', '', '', '', '', 4, 4, 1, '2025-08-20 14:34:50', '2025-08-20 14:34:50'),
('127958140020', 'MABELL', 'NAVARRO', 'TANO', NULL, NULL, '$2y$10$I8b9JFe.BQBZ4Q8VCt8g/eJraTei7fpjB0L69qNLRTxVgv4ynBfYu', 4, '127958140020', 3, '0000-00-00', '', 17, 'Christianity', '', '', '', '', '', 4, 4, 1, '2025-08-20 14:34:52', '2025-08-20 14:34:52'),
('127958140077', 'DAN', 'JOVEN ESPAÑA', 'MINDORO', NULL, NULL, '$2y$10$iW.bQCxn0XFCGrsdHa759Od.lkFpoU5wO5aFPY4B0CCq9HkwDko7O', 4, '127958140077', 3, '0000-00-00', '', 17, 'Christianity', '', '', '', '', '', 4, 4, 1, '2025-08-20 14:34:50', '2025-08-20 14:34:50'),
('127958140100', 'DIVINE', 'LANTAO', 'LABADOR', NULL, NULL, '$2y$10$WVUyKJNygpMvt8LGsHPAROUOMyLPZiaF8Z5kNBZO/hBA3kJeBHYGW', 4, '127958140100', 3, '0000-00-00', '', 16, 'Christianity', '', '', '', '', '', 4, 4, 1, '2025-08-20 14:34:51', '2025-08-20 14:34:51'),
('127962140118', 'JELLANAH', 'CABUGASON', 'DAAMO', NULL, NULL, '$2y$10$f3bGc03ZgW0dtF9ABooviOdC9vyn5MNWs1LDLw.A9YL4mzwj2Kidi', 4, '127962140118', 3, '0000-00-00', '', 15, 'Christianity', '', '', '', '', '', 4, 4, 1, '2025-08-20 14:34:51', '2025-08-20 14:34:51'),
('127962140294', 'ROCHELLE', 'ALUNGAY', 'DATAHAN', NULL, NULL, '$2y$10$Gg5DcRArVdLkAFpWZihnrefvF.hsRzv1nCIj50ZPfaBtD0j1z9y8G', 4, '127962140294', 3, '0000-00-00', '', 17, 'Christianity', '', '', '', '', '', 4, 4, 1, '2025-08-20 14:34:51', '2025-08-20 14:34:51'),
('127963130086', 'LORIE', 'MAE AMAHOY', 'ABAN', NULL, NULL, '$2y$10$nU0HRJmx8pRxpt2YMlj6TeAXRFLgLMUUEoGJ5Ir1kLR2BqW/wVywC', 4, '127963130086', 3, '0000-00-00', '', 17, 'Islam', '', '', '', '', '', 4, 4, 1, '2025-08-20 14:34:51', '2025-08-20 14:34:51'),
('127964120138', 'ULYAR', 'DAIRO', 'ALFANTE', NULL, NULL, '$2y$10$uCngOSfmphr5bmT1Tm.dGOdkBIiPW3qdWYeee2/.tBdKfMWxeJoge', 4, '127964120138', 2, '0000-00-00', '', 19, 'Christianity', '', '', '', '', '', 3, 4, 1, '2025-08-20 14:21:31', '2025-08-20 14:21:31'),
('127966120298', 'RAMELLA', 'BONCALES', 'YORDAN', NULL, NULL, '$2y$10$LhT5l1qR2QxJ2SfjAPUZ8u3.GnuKk99/3aLrQY4AdP49qM39cgise', 4, '127966120298', 2, '0000-00-00', '', 18, 'Christianity', '', '', '', '', '', 3, 4, 1, '2025-08-20 14:21:33', '2025-08-20 14:21:33'),
('127967140004', 'KING', 'CHANDLER MENDEZ', 'GENTILES', NULL, NULL, '$2y$10$MH.8hnXmWbApgIk13otDF.fsZq4XVJq3a01CQhao/cWb3HD3.RN/O', 4, '127967140004', 2, '0000-00-00', '', 17, 'Christianity', '', '', '', '', '', 3, 4, 1, '2025-08-20 14:21:31', '2025-08-20 14:21:31'),
('127967140604', 'ALFRED', 'ANTIPAS', 'YAP', NULL, NULL, '$2y$10$IbrNbajxuVuhEo.zL0oedeeC8uMx4ykvpW8PcEdd0GoKmA3G68D5C', 4, '127967140604', 2, '0000-00-00', '', 16, 'Christianity', '', '', '', '', '', 3, 4, 1, '2025-08-20 14:21:32', '2025-08-20 14:21:32'),
('127992130267', 'WIN', 'RAPIRAP', 'GO', NULL, NULL, '$2y$10$jtv7M2vMQW19aurQIf45n.gGCAVbMt9fC1ZZWHS1VuCu9xNNQDWuK', 4, '127992130267', 2, '0000-00-00', '', 15, 'Christianity', '', '', '', '', '', 3, 4, 1, '2025-08-20 14:21:31', '2025-08-20 14:21:31'),
('127993140162', 'JETRRY', 'GABUT', 'SIBOC', NULL, NULL, '$2y$10$culjEL0tvTRAVFa8C9Vuy.G8MzsP8kbN/sNvwsSRGgpBojbDGjwQa', 4, '127993140162', 2, '0000-00-00', '', 16, 'Christianity', '', '', '', '', '', 3, 4, 1, '2025-08-20 14:21:32', '2025-08-20 14:21:32'),
('127993150140', 'JOHN', 'VINCENT -', 'ESPADILLA', NULL, NULL, '$2y$10$M7Cqr5.ccQSpFUq2CU3d7OhPwM8pS2LRlFrqWGSwVQmsGxVyILAe.', 4, '127993150140', 2, '0000-00-00', '', 16, 'Christianity', '', '', '', '', '', 3, 4, 1, '2025-08-20 14:21:31', '2025-08-20 14:21:31'),
('127995130887', 'JOHN', 'VINCENT JAGUNAP', 'ABARRIENTOS', NULL, NULL, '$2y$10$bh8.EY.jbQG4MpU/miDCROcfeDJguFVuYn60XOvjmxCiXWQvCe.sW', 4, '127995130887', 3, '0000-00-00', '', 18, 'Christianity', '', '', '', '', '', 4, 4, 1, '2025-08-20 14:34:49', '2025-08-20 14:34:49'),
('127995140316', 'RANDY', 'JR CUICO', 'SALVADOR', NULL, NULL, '$2y$10$kevTGwOlHENWLBkSYoIbsuuAgSnJ6tHy.8yRLlmtkR.URnrQlqy2e', 4, '127995140316', 2, '0000-00-00', '', 17, 'Christianity', '', '', '', '', '', 3, 4, 1, '2025-08-20 14:21:32', '2025-08-20 14:21:32'),
('127995140395', 'MARK', 'SEBASTIAN GALOPE', 'FABRIA', NULL, NULL, '$2y$10$2PC9zpzZp8S6HvmZd6LwxOzEvpScnQ4jPJnzCpIfMJS1tjW5rTZC.', 4, '127995140395', 2, '0000-00-00', '', 19, 'Christianity', '', '', '', '', '', 3, 4, 1, '2025-08-20 14:21:31', '2025-08-20 14:21:31'),
('127995140980', 'ELLYZA', 'YASOL', 'PILO', NULL, NULL, '$2y$10$6zCkPkPcdClnFhQCOpIMQeiI/AxKYXHMxeFS3Rwwy7QLhQNsC4GPW', 4, '127995140980', 2, '0000-00-00', '', 16, 'Christianity', '', '', '', '', '', 3, 4, 1, '2025-08-20 14:21:33', '2025-08-20 14:21:33'),
('127995141261', 'DANICA', 'HAZEL JAIN GALOPE', 'FABRIA', NULL, NULL, '$2y$10$1cfepQb2GdgS/.4BSh225.8OTMT2b461HveRtSSn3jbzZEW30.Nn2', 4, '127995141261', 3, '0000-00-00', '', 16, 'Christianity', '', '', '', '', '', 4, 4, 1, '2025-08-20 14:34:51', '2025-08-20 14:34:51'),
('127995141346', 'PRINCESS', 'ALTHEA NADELA', 'YAMUT', NULL, NULL, '$2y$10$NOmxZPcoZfAvLt4DO7qaqexc7NKV6Mkzh3OPNZUZSJqJlaiW3znam', 4, '127995141346', 2, '0000-00-00', '', 17, 'Christianity', '', '', '', '', '', 3, 4, 1, '2025-08-20 14:21:33', '2025-08-20 14:21:33'),
('127995141402', 'ZILDJIAN', 'SASUMAN', 'SOLOMON', NULL, NULL, '$2y$10$r2J23s3Z1AB/8FXnBT5ID.NWQ7NJAT3ceTv1Uj/hbvJFqvc8G1yHK', 4, '127995141402', 3, '0000-00-00', '', 16, 'Christianity', '', '', '', '', '', 4, 4, 1, '2025-08-20 14:34:52', '2025-08-20 14:34:52'),
('128164140135', 'JABEZ', 'YORONG', 'ACAPULCO', NULL, NULL, '$2y$10$lRvufcltdF.DsfqD4AtWPen4G0VQcVTzySeza5ePpFn6Foqyc1L8G', 4, '128164140135', 2, '0000-00-00', '', 16, 'Christianity', '', '', '', '', '', 3, 4, 1, '2025-08-20 14:21:31', '2025-08-20 14:21:31'),
('131260120551', 'RICHARD', 'JR ENTONG', 'MEDIANA', NULL, NULL, '$2y$10$kqLAnnT7gwAvElQJiMvfmOs0a2H71icf1LJLkX0FTpY2oSK3F7ZVm', 4, '131260120551', 3, '0000-00-00', '', 17, 'Islam', '', '', '', '', '', 4, 4, 1, '2025-08-20 14:34:50', '2025-08-20 14:34:50'),
('131632140039', 'JOELIE', 'MARIE MARIQUIT', 'RABAGO', NULL, NULL, '$2y$10$j/8snsDOQ9UU/SGCrunE8.avr8RJ47Bpju9k.JFo1POFVWqB39s02', 4, '131632140039', 2, '0000-00-00', '', 16, 'Christianity', '', '', '', '', '', 3, 4, 1, '2025-08-20 14:21:33', '2025-08-20 14:21:33'),
('131662140006', 'SIM', 'GEB HEART ADLAON', 'CEDEÑO', NULL, NULL, '$2y$10$aSTR4oB3CXw7AK.TUrSDk.DDpEySheQT7mhTb/rfaY3BqbaeAmhFK', 4, '131662140006', 3, '0000-00-00', '', 16, 'Christianity', '', '', '', '', '', 4, 4, 1, '2025-08-20 14:34:50', '2025-08-20 14:34:50'),
('132287150182', 'DANICE', 'ROSS XENIA ESTRELLA', 'GALVAN', NULL, NULL, '$2y$10$8Q1L//dMeo8Lj8u6VCaF/.SE/eN2ftjvQIThRSYnE/L3ur15bWmK2', 4, '132287150182', 2, '0000-00-00', '', 16, 'Christianity', '', '', '', '', '', 3, 4, 1, '2025-08-20 14:21:33', '2025-08-20 14:21:33'),
('132601150002', 'VON', 'CRIZTOFF CABUGA', 'GUINGGUING', NULL, NULL, '$2y$10$ek6CXMuLbj2tJA1l3Lxck.HJx.tBqrvdx8suSp4DxqMXXDH0iG.Wi', 4, '132601150002', 3, '0000-00-00', '', 15, 'Christianity', '', '', '', '', '', 4, 4, 1, '2025-08-20 14:34:50', '2025-08-20 14:34:50'),
('133218140022', 'JAPAR', 'DIBA', 'DAUD', NULL, NULL, '$2y$10$/Wp7GSUUTge0vaiXk2QpTeUqHBPZUOEUpvh2Zq1hxEfmD7twU36M.', 4, '133218140022', 2, '0000-00-00', '', 16, 'Islam', '', '', '', '', '', 3, 4, 1, '2025-08-20 14:21:31', '2025-08-20 14:21:31'),
('133527150140', 'RYLLE', 'KENT DIZON', 'ZABALA', NULL, NULL, '$2y$10$z8xGShg265v0yReo/f4vXO1UVnWDyVE7nC9I5g5LmZgpZyEbwKYyS', 4, '133527150140', 3, '0000-00-00', '', 17, 'Christianity', '', '', '', '', '', 4, 4, 1, '2025-08-20 14:34:51', '2025-08-20 14:34:51'),
('136913130093', 'HERMINE', 'GUMBAY', 'DIMASINSIL', NULL, NULL, '$2y$10$DXSODBC8XsmnHXLqvl77aeV2vIxNaEnl58ZD7Im7zWTe0MByn5pdK', 4, '136913130093', 2, '0000-00-00', '', 17, 'Islam', '', '', '', '', '', 3, 4, 1, '2025-08-20 14:21:31', '2025-08-20 14:21:31'),
('18', '<===', 'TOTAL', 'MALE', NULL, NULL, '$2y$10$Bc6Z.jRG26hUOgycmeQBfeB70rNnIO.XdFUTtAFbPExUFgZKOjL8S', 4, '18', 3, '0000-00-00', '', 0, '', '', '', '', '', '', 4, 4, 1, '2025-08-20 14:34:51', '2025-08-20 14:34:51'),
('201511140006', 'CARL', 'KESTER LIGUTOM', 'PELIGRO', NULL, NULL, '$2y$10$5jvHmOKXl1kiIiQjhzOq0.nMX6E3meAjEBynFwbj/ri5asp9MTBrS', 4, '201511140006', 2, '0000-00-00', '', 15, 'Christianity', '', '', '', '', '', 3, 4, 1, '2025-08-20 14:21:32', '2025-08-20 14:21:32'),
('33333333', 'Patricia', '', 'Aspirass', 'jabagat.jacklindenise@gmail.com', '09056548089', '$2y$10$bkhlAH8VfrdRfB9Kuu6HverJ2jFJ83a8wCrn9DIiJ0.SFlxvT5u.q', 4, '33333333', 4, '2003-02-21', 'Cagayan de Oro City', 20, 'Roman Catholic', 'Iponan', '', '', '', '', 10, 4, 2, '2025-08-06 12:42:47', '2025-09-23 13:00:39'),
('405155150193', 'MARICEL', 'SIBOLON', 'MANOS', NULL, NULL, '$2y$10$9eET.qQUrtDwOqlf2YnX4Os1lOS8XZUMGUJGUnOouoO8.eu7OArby', 4, '405155150193', 2, '0000-00-00', '', 15, 'Christianity', '', '', '', '', '', 3, 4, 1, '2025-08-20 14:21:33', '2025-08-20 14:21:33'),
('405176150009', 'BRAD', 'LUNA', 'PADERANGA', NULL, NULL, '$2y$10$IKa07rDnOnyyDRgU9Pld8.ax4NvtqJlrJOAZf2fu455/SfagePJei', 4, '405176150009', 3, '0000-00-00', '', 16, 'Christianity', '', '', '', '', '', 4, 4, 1, '2025-08-20 14:34:50', '2025-08-20 14:34:50'),
('405241150066', 'ARJAY', 'PALMARES', 'REYES', NULL, NULL, '$2y$10$BTcS0XTgogiC8zaYkwIi7uquX/Vjq/LKBlZa5.NHzS/tWjh5ZWvOe', 4, '405241150066', 2, '0000-00-00', '', 17, 'Christianity', '', '', '', '', '', 3, 4, 1, '2025-08-20 14:21:32', '2025-08-20 14:21:32'),
('510062400004', 'JOHAYVER', 'CALIPAPA', 'MAKI', NULL, NULL, '$2y$10$GsuBHsmmAM5M8uZkjrzrCuxhzuK5FE4ppVUDu1t5D/BGMmh2qsfnu', 4, '510062400004', 2, '0000-00-00', '', 18, 'Islam', '', '', '', '', '', 3, 4, 1, '2025-08-20 14:21:32', '2025-08-20 14:21:32'),
('99999', 'Edmarlen', '', 'Catid', 'pattyaspiras@gmail.com', NULL, '$2y$10$Uaa8DoxJGgwn5nXusRp1LuS0MpAfqNWVj2kOc978/bl093Vf85tz2', 4, '99999', 1, '0000-00-00', '', 0, '', '', '', '', '', '', 2, 4, 1, '2025-08-31 14:00:03', '2025-08-31 14:00:03');

-- --------------------------------------------------------

--
-- Table structure for table `tblstudentdocument`
--

CREATE TABLE `tblstudentdocument` (
  `id` int(11) NOT NULL,
  `studentId` varchar(50) NOT NULL,
  `fileName` varchar(100) NOT NULL,
  `documentId` int(11) NOT NULL,
  `gradeLevelId` int(11) NOT NULL,
  `userId` varchar(50) DEFAULT NULL,
  `createdAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tblstudentdocument`
--

INSERT INTO `tblstudentdocument` (`id`, `studentId`, `fileName`, `documentId`, `gradeLevelId`, `userId`, `createdAt`) VALUES
(25, '99999', 'SF10 - Patty (2).pdf', 5, 1, '47718333', '2025-09-23 21:18:05'),
(26, '33333333', 'SF10 - Patty - grade 12 (1).pdf', 5, 2, '4771833', '2025-09-23 21:22:46');

-- --------------------------------------------------------

--
-- Table structure for table `tbltrack`
--

CREATE TABLE `tbltrack` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `createdAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbltrack`
--

INSERT INTO `tbltrack` (`id`, `name`, `createdAt`) VALUES
(1, 'Academic ', '2025-08-06 10:57:59'),
(2, 'Sports', '2025-08-06 10:57:59');

-- --------------------------------------------------------

--
-- Table structure for table `tbluser`
--

CREATE TABLE `tbluser` (
  `id` varchar(50) NOT NULL,
  `firstname` varchar(50) NOT NULL,
  `lastname` varchar(50) NOT NULL,
  `middlename` varchar(50) NOT NULL,
  `email` varchar(50) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `userLevel` int(11) NOT NULL,
  `pinCode` varchar(255) NOT NULL,
  `gradeLevelId` int(11) DEFAULT NULL,
  `sectionId` int(11) DEFAULT NULL,
  `strandId` int(11) DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbluser`
--

INSERT INTO `tbluser` (`id`, `firstname`, `lastname`, `middlename`, `email`, `password`, `userLevel`, `pinCode`, `gradeLevelId`, `sectionId`, `strandId`, `createdAt`) VALUES
('02-1819-01500', 'Patty', 'Aspiras', '', 'patty@gmail.com', '$2y$10$obaOkyOtY84By2tRkIv8Oue9xzy95ixpm9pyTjITO.dKk6O1zxi9K', 1, '$2y$10$qpVJSUZ3A.AS90mLWxZH0OdG8y76g1EdAkzcq1Z.tKnrvv/Ztn8R.', NULL, NULL, NULL, NULL),
('02-1819-01509', 'Patty', 'Aspiras', '', 'patty@gmail.com', '$2y$10$obaOkyOtY84By2tRkIv8Oue9xzy95ixpm9pyTjITO.dKk6O1zxi9K', 2, '$2y$10$qpVJSUZ3A.AS90mLWxZH0OdG8y76g1EdAkzcq1Z.tKnrvv/Ztn8R.', NULL, NULL, NULL, NULL),
('111111', 'hehe', 'huhu', '', 'rape.gallegos.coc@phinmaed.com', '$2y$10$U3qGRbWkOxksDvA07JdbKO7OmHikVRH1aZHWRWjyT3IE7S9IfUX8m', 1, '$2y$10$hIvaUDm9IuIZpIVEPGoUvulXzIj46DC/4CHh7GnxXcYSRDmSY5m4e', NULL, NULL, NULL, NULL),
('4771830', 'Maribelle', 'Acas', '', 'aspiraspat13@gmail.com', '$2y$10$obaOkyOtY84By2tRkIv8Oue9xzy95ixpm9pyTjITO.dKk6O1zxi9K', 3, '$2y$10$1fd3vmuyD0e6fp.nqOAa8uacpjAuWnlfAKd70uh1wwnawoQeSHAUW', 1, 3, NULL, NULL),
('4771833', 'Alexis', 'Gonzaga', '', 'alex@gmail.com', '$2y$10$JooVcuK3ntZQdiPGcAhvle9y1Q9z0vKeeDJWui0ybvjLgXYcZboNq', 3, '$2y$10$1fd3vmuyD0e6fp.nqOAa8uacpjAuWnlfAKd70uh1wwnawoQeSHAUW', 2, 10, 2, NULL),
('47718333', 'Mary', 'Aspiras', '', 'rape.gallegos.coc@phinmaed.com', '$2y$10$JooVcuK3ntZQdiPGcAhvle9y1Q9z0vKeeDJWui0ybvjLgXYcZboNq', 3, '$2y$10$hJexLGVB8PmW0khOWYKkA..pBOSB9dYyp34862M8zTk381Zf1vD32', 1, 2, 3, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `tbluserlevel`
--

CREATE TABLE `tbluserlevel` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `createdAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tbluserlevel`
--

INSERT INTO `tbluserlevel` (`id`, `name`, `createdAt`) VALUES
(1, 'Registrar', '2025-07-23 08:43:05'),
(2, 'Admin', '2025-07-23 08:43:05'),
(3, 'Teacher', '2025-07-23 08:43:05'),
(4, 'Student', '2025-07-24 13:11:40');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `sms_logs`
--
ALTER TABLE `sms_logs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tbldocument`
--
ALTER TABLE `tbldocument`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userId` (`userId`);

--
-- Indexes for table `tbldocumentrequirement`
--
ALTER TABLE `tbldocumentrequirement`
  ADD PRIMARY KEY (`id`),
  ADD KEY `documentId` (`documentId`),
  ADD KEY `requirementTId` (`requirementTId`),
  ADD KEY `userId` (`userId`);

--
-- Indexes for table `tblexpecteddays`
--
ALTER TABLE `tblexpecteddays`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tblforgotlrn`
--
ALTER TABLE `tblforgotlrn`
  ADD PRIMARY KEY (`id`),
  ADD KEY `processed_by` (`processed_by`);

--
-- Indexes for table `tblgradelevel`
--
ALTER TABLE `tblgradelevel`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userId` (`userId`);

--
-- Indexes for table `tblpurpose`
--
ALTER TABLE `tblpurpose`
  ADD PRIMARY KEY (`id`),
  ADD KEY `documentId` (`documentId`),
  ADD KEY `userId` (`userId`);

--
-- Indexes for table `tblreleaseschedule`
--
ALTER TABLE `tblreleaseschedule`
  ADD PRIMARY KEY (`id`),
  ADD KEY `requestId` (`requestId`),
  ADD KEY `userId` (`userId`);

--
-- Indexes for table `tblrequest`
--
ALTER TABLE `tblrequest`
  ADD PRIMARY KEY (`id`),
  ADD KEY `documentId` (`documentId`),
  ADD KEY `studentId` (`studentId`);

--
-- Indexes for table `tblrequestpurpose`
--
ALTER TABLE `tblrequestpurpose`
  ADD PRIMARY KEY (`id`),
  ADD KEY `purposeId` (`purposeId`),
  ADD KEY `requestId` (`requestId`);

--
-- Indexes for table `tblrequeststatus`
--
ALTER TABLE `tblrequeststatus`
  ADD PRIMARY KEY (`id`),
  ADD KEY `requestId` (`requestId`),
  ADD KEY `statusId` (`statusId`),
  ADD KEY `userId` (`userId`);

--
-- Indexes for table `tblrequirementcomments`
--
ALTER TABLE `tblrequirementcomments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `requirementId` (`requirementId`),
  ADD KEY `requestId` (`requestId`),
  ADD KEY `registrarId` (`registrarId`),
  ADD KEY `status` (`status`);

--
-- Indexes for table `tblrequirements`
--
ALTER TABLE `tblrequirements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `requestId` (`requestId`),
  ADD KEY `typeId` (`typeId`);

--
-- Indexes for table `tblrequirementstype`
--
ALTER TABLE `tblrequirementstype`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userId` (`userId`);

--
-- Indexes for table `tblschoolyear`
--
ALTER TABLE `tblschoolyear`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tblsection`
--
ALTER TABLE `tblsection`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userId` (`userId`),
  ADD KEY `gradeLevelId` (`gradeLevelId`);

--
-- Indexes for table `tblsfrecord`
--
ALTER TABLE `tblsfrecord`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sfTypeId` (`gradeLevelId`),
  ADD KEY `studentId` (`studentId`),
  ADD KEY `userId` (`userId`);

--
-- Indexes for table `tblstatus`
--
ALTER TABLE `tblstatus`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`userId`);

--
-- Indexes for table `tblstrand`
--
ALTER TABLE `tblstrand`
  ADD PRIMARY KEY (`id`),
  ADD KEY `trackId` (`trackId`);

--
-- Indexes for table `tblstudent`
--
ALTER TABLE `tblstudent`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userLevel` (`userLevel`),
  ADD KEY `idx_student_lrn` (`lrn`),
  ADD KEY `idx_student_email` (`email`),
  ADD KEY `sectionId` (`sectionId`),
  ADD KEY `schoolyearId` (`schoolyearId`),
  ADD KEY `strandId` (`strandId`),
  ADD KEY `gradeLevelId` (`gradeLevelId`);

--
-- Indexes for table `tblstudentdocument`
--
ALTER TABLE `tblstudentdocument`
  ADD PRIMARY KEY (`id`),
  ADD KEY `studentId` (`studentId`),
  ADD KEY `documentId` (`documentId`),
  ADD KEY `userId` (`userId`),
  ADD KEY `gradeLevelId` (`gradeLevelId`);

--
-- Indexes for table `tbltrack`
--
ALTER TABLE `tbltrack`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tbluser`
--
ALTER TABLE `tbluser`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_level` (`userLevel`),
  ADD KEY `gradeLevelId` (`gradeLevelId`),
  ADD KEY `fk_sectionId` (`sectionId`),
  ADD KEY `strandId` (`strandId`);

--
-- Indexes for table `tbluserlevel`
--
ALTER TABLE `tbluserlevel`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `sms_logs`
--
ALTER TABLE `sms_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `tbldocument`
--
ALTER TABLE `tbldocument`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `tbldocumentrequirement`
--
ALTER TABLE `tbldocumentrequirement`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `tblexpecteddays`
--
ALTER TABLE `tblexpecteddays`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `tblforgotlrn`
--
ALTER TABLE `tblforgotlrn`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `tblgradelevel`
--
ALTER TABLE `tblgradelevel`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `tblpurpose`
--
ALTER TABLE `tblpurpose`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `tblreleaseschedule`
--
ALTER TABLE `tblreleaseschedule`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `tblrequest`
--
ALTER TABLE `tblrequest`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `tblrequestpurpose`
--
ALTER TABLE `tblrequestpurpose`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tblrequeststatus`
--
ALTER TABLE `tblrequeststatus`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `tblrequirementcomments`
--
ALTER TABLE `tblrequirementcomments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tblrequirements`
--
ALTER TABLE `tblrequirements`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `tblrequirementstype`
--
ALTER TABLE `tblrequirementstype`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `tblschoolyear`
--
ALTER TABLE `tblschoolyear`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `tblsection`
--
ALTER TABLE `tblsection`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `tblsfrecord`
--
ALTER TABLE `tblsfrecord`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=210;

--
-- AUTO_INCREMENT for table `tblstatus`
--
ALTER TABLE `tblstatus`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `tblstrand`
--
ALTER TABLE `tblstrand`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `tblstudentdocument`
--
ALTER TABLE `tblstudentdocument`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `tbltrack`
--
ALTER TABLE `tbltrack`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `tbluserlevel`
--
ALTER TABLE `tbluserlevel`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `tbldocument`
--
ALTER TABLE `tbldocument`
  ADD CONSTRAINT `tbldocument_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `tbluser` (`id`);

--
-- Constraints for table `tbldocumentrequirement`
--
ALTER TABLE `tbldocumentrequirement`
  ADD CONSTRAINT `tbldocumentrequirement_ibfk_1` FOREIGN KEY (`documentId`) REFERENCES `tbldocument` (`id`),
  ADD CONSTRAINT `tbldocumentrequirement_ibfk_2` FOREIGN KEY (`requirementTId`) REFERENCES `tblrequirementstype` (`id`),
  ADD CONSTRAINT `tbldocumentrequirement_ibfk_3` FOREIGN KEY (`userId`) REFERENCES `tbluser` (`id`);

--
-- Constraints for table `tblforgotlrn`
--
ALTER TABLE `tblforgotlrn`
  ADD CONSTRAINT `tblforgotlrn_ibfk_1` FOREIGN KEY (`processed_by`) REFERENCES `tbluser` (`id`);

--
-- Constraints for table `tblgradelevel`
--
ALTER TABLE `tblgradelevel`
  ADD CONSTRAINT `tblgradelevel_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `tbluser` (`id`);

--
-- Constraints for table `tblpurpose`
--
ALTER TABLE `tblpurpose`
  ADD CONSTRAINT `tblpurpose_ibfk_1` FOREIGN KEY (`documentId`) REFERENCES `tbldocument` (`id`),
  ADD CONSTRAINT `tblpurpose_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `tbluser` (`id`);

--
-- Constraints for table `tblreleaseschedule`
--
ALTER TABLE `tblreleaseschedule`
  ADD CONSTRAINT `tblreleaseschedule_ibfk_1` FOREIGN KEY (`requestId`) REFERENCES `tblrequest` (`id`),
  ADD CONSTRAINT `tblreleaseschedule_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `tbluser` (`id`);

--
-- Constraints for table `tblrequest`
--
ALTER TABLE `tblrequest`
  ADD CONSTRAINT `tblrequest_ibfk_1` FOREIGN KEY (`documentId`) REFERENCES `tbldocument` (`id`),
  ADD CONSTRAINT `tblrequest_ibfk_2` FOREIGN KEY (`studentId`) REFERENCES `tblstudent` (`id`);

--
-- Constraints for table `tblrequestpurpose`
--
ALTER TABLE `tblrequestpurpose`
  ADD CONSTRAINT `tblrequestpurpose_ibfk_1` FOREIGN KEY (`purposeId`) REFERENCES `tblpurpose` (`id`),
  ADD CONSTRAINT `tblrequestpurpose_ibfk_2` FOREIGN KEY (`requestId`) REFERENCES `tblrequest` (`id`);

--
-- Constraints for table `tblrequeststatus`
--
ALTER TABLE `tblrequeststatus`
  ADD CONSTRAINT `tblrequeststatus_ibfk_1` FOREIGN KEY (`requestId`) REFERENCES `tblrequest` (`id`),
  ADD CONSTRAINT `tblrequeststatus_ibfk_2` FOREIGN KEY (`statusId`) REFERENCES `tblstatus` (`id`),
  ADD CONSTRAINT `tblrequeststatus_ibfk_3` FOREIGN KEY (`userId`) REFERENCES `tbluser` (`id`);

--
-- Constraints for table `tblrequirementcomments`
--
ALTER TABLE `tblrequirementcomments`
  ADD CONSTRAINT `tblrequirementcomments_ibfk_1` FOREIGN KEY (`requirementId`) REFERENCES `tblrequirements` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `tblrequirementcomments_ibfk_2` FOREIGN KEY (`requestId`) REFERENCES `tblrequest` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `tblrequirementcomments_ibfk_3` FOREIGN KEY (`registrarId`) REFERENCES `tbluser` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `tblrequirements`
--
ALTER TABLE `tblrequirements`
  ADD CONSTRAINT `tblrequirements_ibfk_1` FOREIGN KEY (`requestId`) REFERENCES `tblrequest` (`id`),
  ADD CONSTRAINT `tblrequirements_ibfk_2` FOREIGN KEY (`typeId`) REFERENCES `tblrequirementstype` (`id`);

--
-- Constraints for table `tblrequirementstype`
--
ALTER TABLE `tblrequirementstype`
  ADD CONSTRAINT `tblrequirementstype_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `tbluser` (`id`);

--
-- Constraints for table `tblsection`
--
ALTER TABLE `tblsection`
  ADD CONSTRAINT `tblsection_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `tbluser` (`id`),
  ADD CONSTRAINT `tblsection_ibfk_2` FOREIGN KEY (`gradeLevelId`) REFERENCES `tblgradelevel` (`id`);

--
-- Constraints for table `tblsfrecord`
--
ALTER TABLE `tblsfrecord`
  ADD CONSTRAINT `tblsfrecord_ibfk_1` FOREIGN KEY (`gradeLevelId`) REFERENCES `tblgradelevel` (`id`),
  ADD CONSTRAINT `tblsfrecord_ibfk_2` FOREIGN KEY (`studentId`) REFERENCES `tblstudent` (`id`),
  ADD CONSTRAINT `tblsfrecord_ibfk_3` FOREIGN KEY (`userId`) REFERENCES `tbluser` (`id`);

--
-- Constraints for table `tblstatus`
--
ALTER TABLE `tblstatus`
  ADD CONSTRAINT `tblstatus_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `tbluser` (`id`);

--
-- Constraints for table `tblstrand`
--
ALTER TABLE `tblstrand`
  ADD CONSTRAINT `tblstrand_ibfk_1` FOREIGN KEY (`trackId`) REFERENCES `tbltrack` (`id`);

--
-- Constraints for table `tblstudent`
--
ALTER TABLE `tblstudent`
  ADD CONSTRAINT `tblstudent_ibfk_1` FOREIGN KEY (`userLevel`) REFERENCES `tbluserlevel` (`id`),
  ADD CONSTRAINT `tblstudent_ibfk_2` FOREIGN KEY (`sectionId`) REFERENCES `tblsection` (`id`),
  ADD CONSTRAINT `tblstudent_ibfk_3` FOREIGN KEY (`schoolyearId`) REFERENCES `tblschoolyear` (`id`),
  ADD CONSTRAINT `tblstudent_ibfk_4` FOREIGN KEY (`strandId`) REFERENCES `tblstrand` (`id`),
  ADD CONSTRAINT `tblstudent_ibfk_5` FOREIGN KEY (`gradeLevelId`) REFERENCES `tblgradelevel` (`id`);

--
-- Constraints for table `tblstudentdocument`
--
ALTER TABLE `tblstudentdocument`
  ADD CONSTRAINT `tblstudentdocument_ibfk_1` FOREIGN KEY (`studentId`) REFERENCES `tblstudent` (`id`),
  ADD CONSTRAINT `tblstudentdocument_ibfk_2` FOREIGN KEY (`documentId`) REFERENCES `tbldocument` (`id`),
  ADD CONSTRAINT `tblstudentdocument_ibfk_3` FOREIGN KEY (`userId`) REFERENCES `tbluser` (`id`),
  ADD CONSTRAINT `tblstudentdocument_ibfk_4` FOREIGN KEY (`gradeLevelId`) REFERENCES `tblgradelevel` (`id`);

--
-- Constraints for table `tbluser`
--
ALTER TABLE `tbluser`
  ADD CONSTRAINT `fk_sectionId` FOREIGN KEY (`sectionId`) REFERENCES `tblsection` (`id`),
  ADD CONSTRAINT `tbluser_ibfk_1` FOREIGN KEY (`userLevel`) REFERENCES `tbluserlevel` (`id`),
  ADD CONSTRAINT `tbluser_ibfk_2` FOREIGN KEY (`gradeLevelId`) REFERENCES `tblgradelevel` (`id`),
  ADD CONSTRAINT `tbluser_ibfk_3` FOREIGN KEY (`strandId`) REFERENCES `tblstrand` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
