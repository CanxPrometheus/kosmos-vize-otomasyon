-- --------------------------------------------------------
-- Sunucu:                       127.0.0.1
-- Sunucu sürümü:                11.4.2-MariaDB - mariadb.org binary distribution
-- Sunucu İşletim Sistemi:       Win64
-- HeidiSQL Sürüm:               12.6.0.6765
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- kosmos_vize_otomasyon_new için veritabanı yapısı dökülüyor
CREATE DATABASE IF NOT EXISTS `kosmos_vize_otomasyon_new` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */;
USE `kosmos_vize_otomasyon_new`;

-- tablo yapısı dökülüyor kosmos_vize_otomasyon_new.credit_card
CREATE TABLE IF NOT EXISTS `credit_card` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `surname` varchar(255) NOT NULL,
  `number` varchar(19) NOT NULL,
  `month` char(2) NOT NULL,
  `year` char(4) NOT NULL,
  `cvc` char(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- kosmos_vize_otomasyon_new.credit_card: ~0 rows (yaklaşık) tablosu için veriler indiriliyor
INSERT IGNORE INTO `credit_card` (`id`, `name`, `surname`, `number`, `month`, `year`, `cvc`) VALUES
	(9, 'Tugce', 'Biter', '5218074079000164', '05', '2029', '936');

-- tablo yapısı dökülüyor kosmos_vize_otomasyon_new.queue
CREATE TABLE IF NOT EXISTS `queue` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `basvuru_il` varchar(255) DEFAULT NULL,
  `basvuru_sekli` varchar(255) DEFAULT NULL,
  `basvuru_tipi` varchar(255) DEFAULT NULL,
  `tckn` text DEFAULT NULL,
  `cardnumber` varchar(255) DEFAULT NULL,
  `card_name` varchar(255) DEFAULT NULL,
  `card_surname` varchar(255) DEFAULT NULL,
  `card_month` varchar(255) DEFAULT NULL,
  `card_year` varchar(255) DEFAULT NULL,
  `card_cvv` varchar(255) DEFAULT NULL,
  `sira` int(11) NOT NULL,
  `basvurumerkez` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `sira` (`sira`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- kosmos_vize_otomasyon_new.queue: ~1 rows (yaklaşık) tablosu için veriler indiriliyor
INSERT IGNORE INTO `queue` (`id`, `name`, `basvuru_il`, `basvuru_sekli`, `basvuru_tipi`, `tckn`, `cardnumber`, `card_name`, `card_surname`, `card_month`, `card_year`, `card_cvv`, `sira`, `basvurumerkez`) VALUES
	('80', 'kasdkfad', 'Edirne', 'Standart', 'Bireysel', '["56659326596"]', '5218074079000164', 'Tugce', 'Biter', '05', '2029', '936', 1, 'Çorlu');

-- tablo yapısı dökülüyor kosmos_vize_otomasyon_new.users
CREATE TABLE IF NOT EXISTS `users` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `basvuru_il` varchar(255) DEFAULT NULL,
  `basvuru_sekli` varchar(255) DEFAULT NULL,
  `basvuru_tipi` varchar(255) DEFAULT NULL,
  `tckn` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `basvurumerkez` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=81 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- kosmos_vize_otomasyon_new.users: ~5 rows (yaklaşık) tablosu için veriler indiriliyor
INSERT IGNORE INTO `users` (`id`, `name`, `basvuru_il`, `basvuru_sekli`, `basvuru_tipi`, `tckn`, `basvurumerkez`) VALUES
	(76, 'is1', 'Istanbul', 'Standart', 'Bireysel', '["26642114950"]', 'default'),
	(77, 'fatih', 'Ankara', 'Standart', 'Bireysel', '["56659326596"]', 'default'),
	(78, 'ahsdjfad', 'Ankara', 'Standart', 'Bireysel', '["56659326596"]', 'default'),
	(79, 'emre2', 'Edirne', 'Standart', 'Bireysel', '["38227180236"]', 'Edirne'),
	(80, 'kasdkfad', 'Edirne', 'Standart', 'Bireysel', '["56659326596"]', 'Çorlu');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
