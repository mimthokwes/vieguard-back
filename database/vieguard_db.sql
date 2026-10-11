-- MySQL dump 10.13  Distrib 8.4.11, for Linux (x86_64)
--
-- Host: localhost    Database: vieguard_db
-- ------------------------------------------------------
-- Server version	8.4.11

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `vieguard_db`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `vieguard_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `vieguard_db`;

--
-- Table structure for table `_prisma_migrations`
--

DROP TABLE IF EXISTS `_prisma_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logs` text COLLATE utf8mb4_unicode_ci,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `applied_steps_count` int unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `_prisma_migrations`
--

LOCK TABLES `_prisma_migrations` WRITE;
/*!40000 ALTER TABLE `_prisma_migrations` DISABLE KEYS */;
INSERT INTO `_prisma_migrations` VALUES ('001b2d26-f94c-43e9-be5e-b7d6fd311e01','6ea35410230fc941d6f40e58b856dd40c6c383261f0b11da3f8a467daf8b50ad','2026-10-06 03:51:08.682','20261006035107_init_tables',NULL,NULL,'2026-10-06 03:51:07.062',1);
/*!40000 ALTER TABLE `_prisma_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `accessories`
--

DROP TABLE IF EXISTS `accessories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `accessories` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `price` decimal(12,2) NOT NULL,
  `stock` int NOT NULL,
  `image_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `deleted_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `accessories`
--

LOCK TABLES `accessories` WRITE;
/*!40000 ALTER TABLE `accessories` DISABLE KEYS */;
INSERT INTO `accessories` VALUES (1,'Topi Shako Bulu Putih',NULL,0.00,40,NULL,NULL),(2,'Tongkat Mayoret Emas',NULL,0.00,40,NULL,NULL),(3,'Epolet Emas',NULL,0.00,40,NULL,NULL),(4,'Mahkota Omprok Kuningan',NULL,0.00,40,NULL,NULL),(5,'Selendang Sampur Merah',NULL,0.00,40,NULL,NULL),(6,'Kipas Bambu Emas',NULL,0.00,40,NULL,NULL);
/*!40000 ALTER TABLE `accessories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `admins`
--

DROP TABLE IF EXISTS `admins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admins` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('owner','staff') COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_changed_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `admins_email_key` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admins`
--

LOCK TABLES `admins` WRITE;
/*!40000 ALTER TABLE `admins` DISABLE KEYS */;
INSERT INTO `admins` VALUES (1,'Super Owner Vieguard','owner@vieguard.com','081234567890','$2b$10$6kW3kGIbHLG42v22gqTpt.mv3Xc5aMz7dR5fw0WUMP1myNoTbJnhK','owner','2026-09-18 03:00:00.000','2026-10-06 03:51:46.551','2026-10-06 03:52:39.233');
/*!40000 ALTER TABLE `admins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'Kostum Drumband','Seragam dan kostum anggota drumband & marching band'),(2,'Kostum Pawai & Karnaval','Kostum kreasi seni untuk pawai, karnaval, dan acara daerah'),(3,'Aksesoris Drumband','Topi, bulu, selempang, dan hiasan tambahan');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `conversations`
--

DROP TABLE IF EXISTS `conversations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `conversations` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `admin_id` bigint DEFAULT NULL,
  `last_message_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `conversations_user_id_fkey` (`user_id`),
  KEY `conversations_admin_id_fkey` (`admin_id`),
  CONSTRAINT `conversations_admin_id_fkey` FOREIGN KEY (`admin_id`) REFERENCES `admins` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `conversations_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `conversations`
--

LOCK TABLES `conversations` WRITE;
/*!40000 ALTER TABLE `conversations` DISABLE KEYS */;
INSERT INTO `conversations` VALUES (1,9,1,'2026-10-06 03:34:39.176','2026-10-06 03:52:39.141'),(2,5,1,'2026-10-05 23:12:39.202','2026-10-06 03:52:39.190'),(3,2,1,'2026-10-05 04:32:39.224','2026-10-06 03:52:39.212');
/*!40000 ALTER TABLE `conversations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `custom_order_details`
--

DROP TABLE IF EXISTS `custom_order_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `custom_order_details` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `order_id` bigint NOT NULL,
  `design_reference` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `design_description` text COLLATE utf8mb4_unicode_ci,
  `jenis_jenjang` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `consultation_note` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  UNIQUE KEY `custom_order_details_order_id_key` (`order_id`),
  CONSTRAINT `custom_order_details_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `custom_order_details`
--

LOCK TABLES `custom_order_details` WRITE;
/*!40000 ALTER TABLE `custom_order_details` DISABLE KEYS */;
INSERT INTO `custom_order_details` VALUES (1,5,NULL,'Seragam drumband dengan tambahan bordir logo sekolah di dada kiri dan list warna kuning emas.','SMK','Klien ingin konsultasi bahan dan warna sebelum produksi dimulai.'),(2,8,NULL,'Jas mayoret & pasukan warna royal blue dengan lis emas dan epolet.','Seragam Drumband SMP',NULL),(3,12,NULL,'Jas mayoret marun dengan tali kur emas dan epolet berumbai.','Seragam Drumband SMA',NULL),(4,13,NULL,'Rompi hijau tua dengan logo sekolah bordir di punggung.','Seragam Pawai SD','Harga sudah termasuk bordir logo 2 sisi.'),(5,14,NULL,'Atasan satin biru elektrik, rok lipit, aksen payet perak.','Seragam Color Guard SMK',NULL),(6,15,NULL,'Kebaya modern merah dengan selendang emas dan hiasan kepala.','Kostum Tari Kreasi',NULL),(7,16,NULL,'Jas navy dengan kancing kuningan dan sabuk putih.','Seragam Marching Band SMA',NULL),(8,17,NULL,'Jas putih gading dengan mantel merah dan topi shako bulu.','Kostum Mayoret',NULL),(9,18,NULL,'PDU putih dengan tanda pundak merah putih.','Seragam Paskibra',NULL),(10,19,NULL,'Kostum Rama & Shinta dengan aksen emas.','Kostum Sendratari',NULL);
/*!40000 ALTER TABLE `custom_order_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `messages` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `conversation_id` bigint NOT NULL,
  `sender_type` enum('user','admin') COLLATE utf8mb4_unicode_ci NOT NULL,
  `sender_id` bigint NOT NULL,
  `message_text` text COLLATE utf8mb4_unicode_ci,
  `image_attachment` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `messages_conversation_id_fkey` (`conversation_id`),
  CONSTRAINT `messages_conversation_id_fkey` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages`
--

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
INSERT INTO `messages` VALUES (1,1,'user',9,'Selamat pagi admin, kami sudah mengirim data ukuran 36 siswa untuk seragam drumband.',NULL,1,'2026-10-06 02:17:39.148'),(2,1,'admin',1,'Selamat pagi Pak, terima kasih. Data ukuran sudah kami terima dan sedang dicek.',NULL,1,'2026-10-06 02:32:39.159'),(3,1,'user',9,'Baik. Kira-kira kapan penawaran harganya bisa kami terima?',NULL,0,'2026-10-06 03:32:39.167'),(4,1,'user',9,'Kami perlu mengajukan anggaran ke komite minggu ini.',NULL,0,'2026-10-06 03:34:39.176'),(5,2,'user',5,'Halo, progres bordir logonya sudah sampai mana ya?',NULL,1,'2026-10-05 22:52:39.194'),(6,2,'admin',1,'Sudah 50%, foto progres sudah kami unggah di halaman pesanan.',NULL,1,'2026-10-05 23:12:39.202'),(7,3,'admin',1,'Terima kasih Bu Made, inspeksi pengembalian kostum sudah kami catat.',NULL,1,'2026-10-05 02:52:39.216'),(8,3,'user',2,'Baik, deposit dikembalikan ke rekening BCA yang sama ya.',NULL,1,'2026-10-05 04:32:39.224');
/*!40000 ALTER TABLE `messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `recipient_type` enum('user','admin') COLLATE utf8mb4_unicode_ci NOT NULL,
  `recipient_id` bigint NOT NULL,
  `type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `related_order_id` bigint DEFAULT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `notifications_related_order_id_fkey` (`related_order_id`),
  CONSTRAINT `notifications_related_order_id_fkey` FOREIGN KEY (`related_order_id`) REFERENCES `orders` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,'admin',1,'NEW_ORDER','Pesanan Baru Masuk','Pesanan baru VG-20261006-9150 dari Budi Santoso menunggu konfirmasi.',1,0,'2026-10-06 03:51:58.202'),(2,'admin',1,'PAYMENT_SUBMITTED','Bukti Pembayaran Baru','Ni Made Sukmawati mengirim bukti transfer DP untuk pesanan VG-20261005-2404.',2,0,'2026-10-06 03:51:58.207'),(3,'admin',1,'ORDER_STATUS_UPDATE','Progres Produksi Diperbarui','Progres produksi VG-20260929-6819 mencapai 65%.',6,1,'2026-10-06 03:51:58.211');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `order_id` bigint NOT NULL,
  `item_type` enum('product','accessory') COLLATE utf8mb4_unicode_ci NOT NULL,
  `product_id` bigint DEFAULT NULL,
  `product_variant_id` bigint DEFAULT NULL,
  `accessory_id` bigint DEFAULT NULL,
  `quantity` int NOT NULL,
  `size` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `unit_price` decimal(12,2) NOT NULL,
  `subtotal` decimal(12,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `order_items_order_id_fkey` (`order_id`),
  KEY `order_items_product_id_fkey` (`product_id`),
  KEY `order_items_product_variant_id_fkey` (`product_variant_id`),
  KEY `order_items_accessory_id_fkey` (`accessory_id`),
  CONSTRAINT `order_items_accessory_id_fkey` FOREIGN KEY (`accessory_id`) REFERENCES `accessories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `order_items_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `order_items_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `order_items_product_variant_id_fkey` FOREIGN KEY (`product_variant_id`) REFERENCES `product_variants` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES (1,1,'product',1,2,NULL,2,'M',200000.00,400000.00),(2,2,'product',2,6,NULL,12,'M',180000.00,2160000.00),(3,3,'product',3,8,NULL,6,'All Size',250000.00,1500000.00),(4,4,'product',4,9,NULL,5,'All Size',75000.00,375000.00),(5,5,'product',1,3,NULL,24,'L',210000.00,5040000.00),(6,6,'product',1,2,NULL,20,'M',210000.00,4200000.00),(7,7,'product',2,5,NULL,4,'S',180000.00,720000.00),(8,8,'product',1,1,NULL,10,'S',0.00,0.00),(9,8,'product',1,2,NULL,18,'M',0.00,0.00),(10,8,'product',1,3,NULL,6,'L',0.00,0.00),(11,8,'product',1,4,NULL,2,'XL',0.00,0.00),(12,9,'product',4,9,NULL,30,'All Size',75000.00,2250000.00),(13,10,'product',2,6,NULL,6,'M',180000.00,1080000.00),(14,10,'product',2,7,NULL,4,'L',180000.00,720000.00),(15,11,'product',3,8,NULL,2,'All Size',250000.00,1500000.00),(16,12,'product',1,1,NULL,4,'S',0.00,0.00),(17,12,'product',1,2,NULL,6,'M',0.00,0.00),(18,12,'product',1,3,NULL,2,'L',0.00,0.00),(19,13,'product',1,1,NULL,12,'S',240000.00,2880000.00),(20,14,'product',1,2,NULL,10,'M',450000.00,4500000.00),(21,15,'product',1,1,NULL,6,'S',380000.00,2280000.00),(22,15,'product',1,2,NULL,8,'M',380000.00,3040000.00),(23,16,'product',1,3,NULL,16,'L',520000.00,8320000.00),(24,17,'product',1,2,NULL,5,'M',600000.00,3000000.00),(25,18,'product',1,3,NULL,20,'L',410000.00,8200000.00),(26,19,'product',1,2,NULL,8,'M',0.00,0.00),(27,20,'product',4,9,NULL,3,'All Size',75000.00,225000.00),(28,21,'product',1,1,NULL,4,'S',850000.00,3400000.00),(29,22,'product',4,9,NULL,10,'All Size',75000.00,750000.00),(30,23,'product',1,3,NULL,2,'L',850000.00,1700000.00),(31,23,'product',4,9,NULL,2,'All Size',75000.00,150000.00),(32,24,'product',1,4,NULL,1,'XL',850000.00,850000.00),(33,25,'product',4,9,NULL,5,'All Size',75000.00,375000.00),(34,26,'product',2,5,NULL,6,'S',180000.00,1080000.00),(35,26,'product',2,6,NULL,4,'M',180000.00,720000.00),(36,27,'product',3,8,NULL,3,'All Size',250000.00,750000.00),(37,28,'product',1,2,NULL,12,'M',200000.00,2400000.00);
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_photos`
--

DROP TABLE IF EXISTS `order_photos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_photos` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `order_id` bigint NOT NULL,
  `category` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image_url` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_public` tinyint(1) NOT NULL DEFAULT '1',
  `uploaded_by` bigint DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `order_photos_order_id_fkey` (`order_id`),
  CONSTRAINT `order_photos_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_photos`
--

LOCK TABLES `order_photos` WRITE;
/*!40000 ALTER TABLE `order_photos` DISABLE KEYS */;
INSERT INTO `order_photos` VALUES (1,5,'workshop','Pola & potongan kain','/uploads/orders/seed-workshop-1.png',1,1,'2026-10-06 03:52:39.078'),(2,5,'workshop','Jahitan kerah jas','/uploads/orders/seed-workshop-2.png',1,1,'2026-10-06 03:52:39.112'),(3,5,'workshop','Bordir logo sekolah','/uploads/orders/seed-workshop-3.png',1,1,'2026-10-06 03:52:39.122'),(4,5,'qc','Cek kancing & lubang','/uploads/orders/seed-qc-1.png',0,1,'2026-10-06 03:52:39.133');
/*!40000 ALTER TABLE `order_photos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_size_entries`
--

DROP TABLE IF EXISTS `order_size_entries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_size_entries` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `order_id` bigint NOT NULL,
  `student_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `gender` varchar(1) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `height_cm` int DEFAULT NULL,
  `size` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `order_size_entries_order_id_fkey` (`order_id`),
  CONSTRAINT `order_size_entries_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=63 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_size_entries`
--

LOCK TABLES `order_size_entries` WRITE;
/*!40000 ALTER TABLE `order_size_entries` DISABLE KEYS */;
INSERT INTO `order_size_entries` VALUES (1,8,'Ahmad Fadhil A.','L',152,'S','Pasukan','2026-10-06 03:52:38.824'),(2,8,'Bunga Citra B.','P',153,'S','Mayoret','2026-10-06 03:52:38.824'),(3,8,'Dimas Bagus C.','L',154,'S','Snare Drum','2026-10-06 03:52:38.824'),(4,8,'Eka Kurniawati D.','P',155,'S','Bellyra','2026-10-06 03:52:38.824'),(5,8,'Farhan Maulana E.','L',156,'S','Bass Drum','2026-10-06 03:52:38.824'),(6,8,'Gita Maharani F.','P',152,'S','Color Guard','2026-10-06 03:52:38.824'),(7,8,'Hendra Wicaksono G.','L',153,'S','Brass Section','2026-10-06 03:52:38.824'),(8,8,'Intan Permata H.','P',154,'S','Tenor Drum','2026-10-06 03:52:38.824'),(9,8,'Joko Susilo I.','L',155,'S','Cymbal','2026-10-06 03:52:38.824'),(10,8,'Kirana Dewi J.','P',156,'S','Pasukan','2026-10-06 03:52:38.824'),(11,8,'Lukman Hakim K.','L',160,'M','Mayoret','2026-10-06 03:52:38.824'),(12,8,'Maya Sari L.','P',161,'M','Snare Drum','2026-10-06 03:52:38.824'),(13,8,'Ahmad Fadhil M.','L',162,'M','Bellyra','2026-10-06 03:52:38.824'),(14,8,'Bunga Citra N.','P',163,'M','Bass Drum','2026-10-06 03:52:38.824'),(15,8,'Dimas Bagus O.','L',164,'M','Color Guard','2026-10-06 03:52:38.824'),(16,8,'Eka Kurniawati P.','P',160,'M','Brass Section','2026-10-06 03:52:38.824'),(17,8,'Farhan Maulana Q.','L',161,'M','Tenor Drum','2026-10-06 03:52:38.824'),(18,8,'Gita Maharani R.','P',162,'M','Cymbal','2026-10-06 03:52:38.824'),(19,8,'Hendra Wicaksono S.','L',163,'M','Pasukan','2026-10-06 03:52:38.824'),(20,8,'Intan Permata T.','P',164,'M','Mayoret','2026-10-06 03:52:38.824'),(21,8,'Joko Susilo U.','L',160,'M','Snare Drum','2026-10-06 03:52:38.824'),(22,8,'Kirana Dewi V.','P',161,'M','Bellyra','2026-10-06 03:52:38.824'),(23,8,'Lukman Hakim W.','L',162,'M','Bass Drum','2026-10-06 03:52:38.824'),(24,8,'Maya Sari X.','P',163,'M','Color Guard','2026-10-06 03:52:38.824'),(25,8,'Ahmad Fadhil Y.','L',164,'M','Brass Section','2026-10-06 03:52:38.824'),(26,8,'Bunga Citra Z.','P',160,'M','Tenor Drum','2026-10-06 03:52:38.824'),(27,8,'Dimas Bagus A.','L',161,'M','Cymbal','2026-10-06 03:52:38.824'),(28,8,'Eka Kurniawati B.','P',162,'M','Pasukan','2026-10-06 03:52:38.824'),(29,8,'Farhan Maulana C.','L',171,'L','Mayoret','2026-10-06 03:52:38.824'),(30,8,'Gita Maharani D.','P',172,'L','Snare Drum','2026-10-06 03:52:38.824'),(31,8,'Hendra Wicaksono E.','L',168,'L','Bellyra','2026-10-06 03:52:38.824'),(32,8,'Intan Permata F.','P',169,'L','Bass Drum','2026-10-06 03:52:38.824'),(33,8,'Joko Susilo G.','L',170,'L','Color Guard','2026-10-06 03:52:38.824'),(34,8,'Kirana Dewi H.','P',171,'L','Brass Section','2026-10-06 03:52:38.824'),(35,8,'Lukman Hakim I.','L',179,'XL','Tenor Drum','2026-10-06 03:52:38.824'),(36,8,'Maya Sari J.','P',175,'XL','Cymbal','2026-10-06 03:52:38.824'),(37,12,'Aditya A.','L',150,'S','Pasukan','2026-10-06 03:52:45.136'),(38,12,'Bella B.','P',151,'S','Mayoret','2026-10-06 03:52:45.136'),(39,12,'Cahyo C.','L',152,'S','Snare Drum','2026-10-06 03:52:45.136'),(40,12,'Dewi D.','P',153,'S','Bellyra','2026-10-06 03:52:45.136'),(41,12,'Erlangga E.','L',162,'M','Bass Drum','2026-10-06 03:52:45.136'),(42,12,'Fitri F.','P',158,'M','Color Guard','2026-10-06 03:52:45.136'),(43,12,'Galih G.','L',159,'M','Pasukan','2026-10-06 03:52:45.136'),(44,12,'Hana H.','P',160,'M','Mayoret','2026-10-06 03:52:45.136'),(45,12,'Ilham I.','L',161,'M','Snare Drum','2026-10-06 03:52:45.136'),(46,12,'Jasmine J.','P',162,'M','Bellyra','2026-10-06 03:52:45.136'),(47,12,'Kevin K.','L',166,'L','Bass Drum','2026-10-06 03:52:45.136'),(48,12,'Laras L.','P',167,'L','Color Guard','2026-10-06 03:52:45.136'),(49,15,'Aditya A.','L',150,'S','Pasukan','2026-10-06 03:52:45.173'),(50,15,'Bella B.','P',151,'S','Mayoret','2026-10-06 03:52:45.173'),(51,15,'Cahyo C.','L',152,'S','Snare Drum','2026-10-06 03:52:45.173'),(52,15,'Dewi D.','P',153,'S','Bellyra','2026-10-06 03:52:45.173'),(53,15,'Erlangga E.','L',154,'S','Bass Drum','2026-10-06 03:52:45.173'),(54,15,'Fitri F.','P',150,'S','Color Guard','2026-10-06 03:52:45.173'),(55,15,'Galih G.','L',159,'M','Pasukan','2026-10-06 03:52:45.173'),(56,15,'Hana H.','P',160,'M','Mayoret','2026-10-06 03:52:45.173'),(57,15,'Ilham I.','L',161,'M','Snare Drum','2026-10-06 03:52:45.173'),(58,15,'Jasmine J.','P',162,'M','Bellyra','2026-10-06 03:52:45.173'),(59,15,'Kevin K.','L',158,'M','Bass Drum','2026-10-06 03:52:45.173'),(60,15,'Laras L.','P',159,'M','Color Guard','2026-10-06 03:52:45.173'),(61,15,'Malik M.','L',160,'M','Pasukan','2026-10-06 03:52:45.173'),(62,15,'Nadia N.','P',161,'M','Mayoret','2026-10-06 03:52:45.173');
/*!40000 ALTER TABLE `order_size_entries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_status_history`
--

DROP TABLE IF EXISTS `order_status_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_status_history` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `order_id` bigint NOT NULL,
  `progress_percentage` int NOT NULL,
  `status_label` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `note` text COLLATE utf8mb4_unicode_ci,
  `updated_by` bigint NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `order_status_history_order_id_fkey` (`order_id`),
  KEY `order_status_history_updated_by_fkey` (`updated_by`),
  CONSTRAINT `order_status_history_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `order_status_history_updated_by_fkey` FOREIGN KEY (`updated_by`) REFERENCES `admins` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_status_history`
--

LOCK TABLES `order_status_history` WRITE;
/*!40000 ALTER TABLE `order_status_history` DISABLE KEYS */;
INSERT INTO `order_status_history` VALUES (1,6,30,'Pola & Pemotongan Kain (Cutting)','Pemotongan pola untuk 20 stel selesai.',1,'2026-10-02 03:51:58.177'),(2,6,65,'Proses Jahit & Assembling','Proses jahit sedang berjalan, 13 dari 20 stel selesai.',1,'2026-10-05 03:51:58.182'),(3,9,100,'Lolos QC & Dikemas','30 set selempang & topi sudah dikemas per 10 pcs.',1,'2026-10-05 08:00:00.000'),(4,13,0,'Penawaran Harga Dikirim','Harga sudah termasuk bordir logo 2 sisi.',1,'2026-10-04 03:00:00.000'),(5,14,0,'Penawaran Harga Dikirim','Bahan satin import, payet jahit tangan.',1,'2026-10-01 08:00:00.000'),(6,14,0,'Pesanan Dikonfirmasi Admin','Menunggu pembayaran DP.',1,'2026-10-02 02:00:00.000'),(7,15,0,'Pesanan Dikonfirmasi Admin','DP diterima.',1,'2026-09-27 05:00:00.000'),(8,15,30,'Pemotongan Kain','Pola sudah fix, kain dipotong untuk 14 stel.',1,'2026-10-02 08:00:00.000'),(9,16,30,'Pemotongan Kain','Kain navy dipotong.',1,'2026-09-18 08:00:00.000'),(10,16,65,'Proses Jahit','Badan jas selesai dijahit.',1,'2026-09-27 08:00:00.000'),(11,16,90,'Quality Control','Cek kancing dan jahitan, 2 stel perlu rapikan obras.',1,'2026-10-05 08:00:00.000'),(12,17,40,'Proses Jahit','Mantel dan jas dijahit.',1,'2026-09-21 08:00:00.000'),(13,17,100,'Siap Diambil Pelanggan','Sudah lolos QC dan dikemas.',1,'2026-10-05 08:00:00.000'),(14,18,100,'Siap Diambil Pelanggan','Lolos QC.',1,'2026-09-21 08:00:00.000'),(15,18,100,'Status diubah ke selesai','Sudah diambil pihak sekolah.',1,'2026-09-22 08:00:00.000'),(16,19,0,'Status diubah ke dibatalkan','Pelanggan membatalkan karena jadwal pentas diundur.',1,'2026-09-18 08:00:00.000'),(17,21,0,'Pesanan Dikonfirmasi Admin','Menunggu pembayaran DP.',1,'2026-10-05 02:00:00.000'),(18,23,100,'Dikirim','Dikirim via JNE REG, resi JNE0123456789.',1,'2026-10-05 07:00:00.000'),(19,24,100,'Status diubah ke selesai','Barang sudah diterima pelanggan.',1,'2026-09-25 08:00:00.000'),(20,25,0,'Status diubah ke dibatalkan','Tidak ada pembayaran hingga batas waktu.',1,'2026-09-28 08:00:00.000');
/*!40000 ALTER TABLE `order_status_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `order_number` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `order_type` enum('beli','sewa','custom') COLLATE utf8mb4_unicode_ci NOT NULL,
  `requires_production` tinyint(1) NOT NULL DEFAULT '0',
  `status` enum('pending','dikonfirmasi','diproses','siap_diambil','selesai','dibatalkan') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `total_price` decimal(12,2) NOT NULL,
  `dp_amount` decimal(12,2) DEFAULT NULL,
  `is_lunas` tinyint(1) NOT NULL DEFAULT '0',
  `deadline_date` date DEFAULT NULL,
  `expired_at` datetime(3) DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `courier` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tracking_number` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `shipping_cost` decimal(12,2) DEFAULT NULL,
  `shipped_at` datetime(3) DEFAULT NULL,
  `eta_date` date DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `orders_order_number_key` (`order_number`),
  KEY `orders_user_id_fkey` (`user_id`),
  CONSTRAINT `orders_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,1,'VG-20261006-9150','sewa',0,'pending',400000.00,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-06 03:51:58.080','2026-10-06 03:51:58.082'),(2,2,'VG-20261005-2404','sewa',0,'dikonfirmasi',2160000.00,500000.00,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-05 03:51:58.089','2026-10-06 03:51:58.090'),(3,3,'VG-20261003-9120','sewa',0,'diproses',1500000.00,750000.00,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-03 03:51:58.132','2026-10-06 03:51:58.134'),(4,4,'VG-20260926-4879','beli',0,'selesai',375000.00,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-09-26 03:51:58.147','2026-10-06 03:51:58.148'),(5,5,'VG-20261006-8088','custom',1,'pending',5040000.00,NULL,0,'2026-10-27',NULL,'Pesanan custom seragam drumband untuk lomba tingkat provinsi.',NULL,NULL,NULL,NULL,NULL,'2026-10-06 03:51:58.156','2026-10-06 03:51:58.157'),(6,1,'VG-20260929-6819','custom',1,'diproses',4200000.00,2100000.00,0,'2026-10-16',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-09-29 03:51:58.166','2026-10-06 03:51:58.167'),(7,3,'VG-20261004-8332','sewa',0,'siap_diambil',720000.00,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-04 03:51:58.187','2026-10-06 03:51:58.188'),(8,9,'VG-20261006-8101','custom',1,'pending',0.00,NULL,0,NULL,NULL,'Jahitan double tindas, kancing kuningan anti-karat, nama siswa dibordir di dada kiri.',NULL,NULL,NULL,NULL,NULL,'2026-10-06 02:30:00.000','2026-10-06 03:52:38.809'),(9,10,'VG-20260930-8102','beli',0,'siap_diambil',2250000.00,1125000.00,1,'2026-10-08',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-09-30 03:15:00.000','2026-10-06 03:52:38.837'),(10,11,'VG-20261003-8103','sewa',0,'siap_diambil',1800000.00,900000.00,1,NULL,NULL,'Parade HUT Kabupaten Malang',NULL,NULL,NULL,NULL,NULL,'2026-10-03 07:00:00.000','2026-10-06 03:52:38.876'),(11,1,'VG-20261002-8104','sewa',0,'siap_diambil',1500000.00,NULL,1,NULL,NULL,'Pentas Seni Dies Natalis',NULL,NULL,NULL,NULL,NULL,'2026-10-02 04:00:00.000','2026-10-06 03:52:38.900'),(12,6,'VG-20261005-8301','custom',1,'pending',0.00,NULL,0,NULL,NULL,'Warna merah marun, list emas di dada, topi pet hitam.',NULL,NULL,NULL,NULL,NULL,'2026-10-05 23:40:00.000','2026-10-06 03:52:45.110'),(13,7,'VG-20261005-8302','custom',1,'pending',2880000.00,1440000.00,0,'2026-10-27',NULL,'Untuk pawai Milad sekolah.',NULL,NULL,NULL,NULL,NULL,'2026-10-03 03:00:00.000','2026-10-06 03:52:45.145'),(14,8,'VG-20261005-8303','custom',1,'dikonfirmasi',4500000.00,2250000.00,0,'2026-10-31',NULL,'Seragam color guard, bahan satin.',NULL,NULL,NULL,NULL,NULL,'2026-09-30 02:00:00.000','2026-10-06 03:52:45.156'),(15,3,'VG-20261005-8304','custom',1,'diproses',5320000.00,2660000.00,0,'2026-10-18',NULL,'Kostum tari kreasi untuk festival budaya.',NULL,NULL,NULL,NULL,NULL,'2026-09-24 06:00:00.000','2026-10-06 03:52:45.165'),(16,10,'VG-20261005-8305','custom',1,'diproses',8320000.00,4160000.00,0,'2026-10-10',NULL,'Seragam pasukan inti marching band.',NULL,NULL,NULL,NULL,NULL,'2026-09-12 03:00:00.000','2026-10-06 03:52:45.181'),(17,1,'VG-20261005-8306','custom',1,'siap_diambil',3000000.00,1500000.00,1,'2026-10-07',NULL,'Kostum mayoret untuk lomba.',NULL,NULL,NULL,NULL,NULL,'2026-09-06 02:00:00.000','2026-10-06 03:52:45.194'),(18,11,'VG-20261005-8307','custom',1,'selesai',8200000.00,4100000.00,1,NULL,NULL,'Seragam paskibra sekolah.',NULL,NULL,NULL,NULL,NULL,'2026-08-22 03:00:00.000','2026-10-06 03:52:45.204'),(19,2,'VG-20261005-8308','custom',1,'dibatalkan',0.00,NULL,0,NULL,NULL,'Kostum sendratari Ramayana.',NULL,NULL,NULL,NULL,NULL,'2026-09-16 07:00:00.000','2026-10-06 03:52:45.215'),(20,4,'VG-20261005-8311','beli',0,'pending',225000.00,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-06 01:20:00.000','2026-10-06 03:52:45.223'),(21,7,'VG-20261005-8312','beli',0,'dikonfirmasi',3400000.00,1700000.00,0,'2026-10-13',NULL,'Untuk ekstrakurikuler drumband.',NULL,NULL,NULL,NULL,NULL,'2026-10-04 04:00:00.000','2026-10-06 03:52:45.231'),(22,3,'VG-20261005-8313','beli',0,'siap_diambil',750000.00,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-02 08:00:00.000','2026-10-06 03:52:45.240'),(23,8,'VG-20261005-8314','beli',0,'siap_diambil',1850000.00,NULL,1,NULL,NULL,NULL,'JNE REG','JNE0123456789',45000.00,'2026-10-05 07:00:00.000','2026-10-07','2026-09-29 03:00:00.000','2026-10-06 03:52:45.248'),(24,5,'VG-20261005-8315','beli',0,'selesai',850000.00,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-09-21 02:00:00.000','2026-10-06 03:52:45.258'),(25,1,'VG-20261005-8316','beli',0,'dibatalkan',375000.00,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-09-26 09:00:00.000','2026-10-06 03:52:45.266'),(26,6,'VG-20261005-8321','sewa',0,'siap_diambil',1800000.00,NULL,1,NULL,NULL,'Karnaval budaya kota.',NULL,NULL,NULL,NULL,NULL,'2026-10-03 02:00:00.000','2026-10-06 03:52:45.276'),(27,7,'VG-20261005-8322','sewa',0,'siap_diambil',750000.00,NULL,1,NULL,NULL,'Pentas seni akhir semester.',NULL,NULL,NULL,NULL,NULL,'2026-09-28 03:00:00.000','2026-10-06 03:52:45.285'),(28,4,'VG-20261005-8323','sewa',0,'selesai',2400000.00,NULL,1,NULL,NULL,'Lomba drumband antar sekolah.',NULL,NULL,NULL,NULL,NULL,'2026-09-18 02:00:00.000','2026-10-06 03:52:45.295');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_resets`
--

DROP TABLE IF EXISTS `password_resets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_resets` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `account_type` enum('user','admin') COLLATE utf8mb4_unicode_ci NOT NULL,
  `account_id` bigint NOT NULL,
  `otp_code` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` datetime(3) NOT NULL,
  `is_used` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_resets`
--

LOCK TABLES `password_resets` WRITE;
/*!40000 ALTER TABLE `password_resets` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_resets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `order_id` bigint NOT NULL,
  `payment_type` enum('dp','pelunasan','refund') COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `payment_method` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `midtrans_order_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `midtrans_transaction_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `proof_image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `refund_reason` text COLLATE utf8mb4_unicode_ci,
  `refund_destination` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('menunggu','terverifikasi','ditolak') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'menunggu',
  `verified_by` bigint DEFAULT NULL,
  `verified_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `payments_order_id_fkey` (`order_id`),
  KEY `payments_verified_by_fkey` (`verified_by`),
  CONSTRAINT `payments_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `payments_verified_by_fkey` FOREIGN KEY (`verified_by`) REFERENCES `admins` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
INSERT INTO `payments` VALUES (1,2,'dp',500000.00,'BCA Transfer',NULL,NULL,NULL,NULL,NULL,'menunggu',NULL,NULL,'2026-10-06 03:51:58.128'),(2,3,'dp',750000.00,'BCA Transfer',NULL,NULL,NULL,NULL,NULL,'terverifikasi',1,'2026-10-04 03:51:58.142','2026-10-06 03:51:58.143'),(3,4,'pelunasan',375000.00,'QRIS',NULL,NULL,NULL,NULL,NULL,'terverifikasi',1,'2026-09-27 03:51:58.152','2026-10-06 03:51:58.153'),(4,6,'dp',2100000.00,'BCA Transfer',NULL,NULL,NULL,NULL,NULL,'terverifikasi',1,'2026-09-30 03:51:58.172','2026-10-06 03:51:58.173'),(5,7,'pelunasan',720000.00,'QRIS',NULL,NULL,NULL,NULL,NULL,'terverifikasi',1,'2026-10-05 03:51:58.197','2026-10-06 03:51:58.198'),(6,9,'dp',1125000.00,'BCA Transfer',NULL,NULL,NULL,NULL,NULL,'terverifikasi',1,'2026-10-01 04:00:00.000','2026-10-01 03:40:00.000'),(7,9,'pelunasan',1125000.00,'BCA Transfer',NULL,NULL,NULL,NULL,NULL,'terverifikasi',1,'2026-10-05 02:00:00.000','2026-10-05 01:20:00.000'),(8,10,'pelunasan',1800000.00,'Mandiri Transfer',NULL,NULL,NULL,NULL,NULL,'terverifikasi',1,'2026-10-04 03:00:00.000','2026-10-04 02:00:00.000'),(9,11,'pelunasan',1500000.00,'QRIS',NULL,NULL,NULL,NULL,NULL,'terverifikasi',1,'2026-10-03 02:00:00.000','2026-10-03 01:00:00.000'),(10,15,'dp',2660000.00,'BCA Transfer',NULL,NULL,NULL,NULL,NULL,'terverifikasi',1,'2026-09-27 04:00:00.000','2026-09-27 02:30:00.000'),(11,16,'dp',4160000.00,'Mandiri Transfer',NULL,NULL,NULL,NULL,NULL,'terverifikasi',1,'2026-09-14 04:00:00.000','2026-09-14 02:30:00.000'),(12,17,'dp',1500000.00,'BRI Transfer',NULL,NULL,NULL,NULL,NULL,'terverifikasi',1,'2026-09-08 04:00:00.000','2026-09-08 02:30:00.000'),(13,17,'pelunasan',1500000.00,'BRI Transfer',NULL,NULL,NULL,NULL,NULL,'terverifikasi',1,'2026-10-04 04:00:00.000','2026-10-04 02:30:00.000'),(14,18,'dp',4100000.00,'BNI Transfer',NULL,NULL,NULL,NULL,NULL,'terverifikasi',1,'2026-08-24 04:00:00.000','2026-08-24 02:30:00.000'),(15,18,'pelunasan',4100000.00,'BNI Transfer',NULL,NULL,NULL,NULL,NULL,'terverifikasi',1,'2026-09-20 04:00:00.000','2026-09-20 02:30:00.000'),(16,22,'pelunasan',750000.00,'QRIS',NULL,NULL,NULL,NULL,NULL,'terverifikasi',1,'2026-10-03 04:00:00.000','2026-10-03 02:30:00.000'),(17,23,'pelunasan',1850000.00,'BCA Transfer',NULL,NULL,NULL,NULL,NULL,'terverifikasi',1,'2026-09-30 04:00:00.000','2026-09-30 02:30:00.000'),(18,24,'pelunasan',850000.00,'BRI Transfer',NULL,NULL,NULL,NULL,NULL,'terverifikasi',1,'2026-09-22 04:00:00.000','2026-09-22 02:30:00.000'),(19,26,'pelunasan',1800000.00,'Mandiri Transfer',NULL,NULL,NULL,NULL,NULL,'terverifikasi',1,'2026-10-04 04:00:00.000','2026-10-04 02:30:00.000'),(20,27,'pelunasan',750000.00,'QRIS',NULL,NULL,NULL,NULL,NULL,'terverifikasi',1,'2026-09-29 04:00:00.000','2026-09-29 02:30:00.000'),(21,28,'pelunasan',2400000.00,'BCA Transfer',NULL,NULL,NULL,NULL,NULL,'terverifikasi',1,'2026-09-19 04:00:00.000','2026-09-19 02:30:00.000');
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_accessories`
--

DROP TABLE IF EXISTS `product_accessories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_accessories` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `product_id` bigint NOT NULL,
  `accessory_id` bigint NOT NULL,
  `quantity_per_set` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `product_accessories_product_id_accessory_id_key` (`product_id`,`accessory_id`),
  KEY `product_accessories_accessory_id_fkey` (`accessory_id`),
  CONSTRAINT `product_accessories_accessory_id_fkey` FOREIGN KEY (`accessory_id`) REFERENCES `accessories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `product_accessories_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_accessories`
--

LOCK TABLES `product_accessories` WRITE;
/*!40000 ALTER TABLE `product_accessories` DISABLE KEYS */;
INSERT INTO `product_accessories` VALUES (1,1,1,1),(2,1,3,2),(3,1,2,1),(4,2,4,1),(5,2,5,1),(6,2,6,2);
/*!40000 ALTER TABLE `product_accessories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_images`
--

DROP TABLE IF EXISTS `product_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_images` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `product_id` bigint NOT NULL,
  `image_url` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_primary` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `product_images_product_id_fkey` (`product_id`),
  CONSTRAINT `product_images_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_images`
--

LOCK TABLES `product_images` WRITE;
/*!40000 ALTER TABLE `product_images` DISABLE KEYS */;
/*!40000 ALTER TABLE `product_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_variants`
--

DROP TABLE IF EXISTS `product_variants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_variants` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `product_id` bigint NOT NULL,
  `size` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `stock_buy` int NOT NULL,
  `stock_rent` int NOT NULL,
  `price_buy_override` decimal(12,2) DEFAULT NULL,
  `price_rent_override` decimal(12,2) DEFAULT NULL,
  `stock_in_service` int NOT NULL DEFAULT '0',
  `service_note` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `deleted_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `product_variants_product_id_size_key` (`product_id`,`size`),
  CONSTRAINT `product_variants_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_variants`
--

LOCK TABLES `product_variants` WRITE;
/*!40000 ALTER TABLE `product_variants` DISABLE KEYS */;
INSERT INTO `product_variants` VALUES (1,1,'S',5,8,NULL,NULL,0,NULL,NULL),(2,1,'M',8,12,NULL,NULL,0,NULL,NULL),(3,1,'L',6,10,NULL,NULL,0,NULL,NULL),(4,1,'XL',3,5,NULL,NULL,1,'Jahit ulang kancing & ganti resleting',NULL),(5,2,'S',0,4,NULL,NULL,0,NULL,NULL),(6,2,'M',0,6,NULL,NULL,1,'Laundry noda make-up',NULL),(7,2,'L',0,4,NULL,NULL,0,NULL,NULL),(8,3,'All Size',0,6,NULL,NULL,0,NULL,NULL),(9,4,'All Size',30,20,NULL,NULL,0,NULL,NULL);
/*!40000 ALTER TABLE `product_variants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `category_id` bigint NOT NULL,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `base_price_buy` decimal(12,2) DEFAULT NULL,
  `base_price_rent` decimal(12,2) DEFAULT NULL,
  `is_custom_available` tinyint(1) NOT NULL,
  `is_visible` tinyint(1) NOT NULL,
  `sku` varchar(40) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `condition_grade` varchar(2) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `deleted_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `products_category_id_fkey` (`category_id`),
  CONSTRAINT `products_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,1,'Kostum Drumband Gita Bahari','Seragam drumband lengkap dengan aksesoris mayor & pasukan, bahan American Drill premium.',850000.00,200000.00,1,1,'KST-DRM-01','A',NULL,'2026-10-06 03:51:58.050','2026-10-06 03:52:38.662'),(2,2,'Kostum Karnaval Nusantara','Kostum tari kreasi nusantara untuk pawai dan karnaval budaya.',NULL,180000.00,0,1,'KST-KRN-02','A',NULL,'2026-10-06 03:51:58.060','2026-10-06 03:52:38.691'),(3,2,'Kostum Reog & Warok Ponorogo','Kostum reog lengkap dengan dadak merak dan properti warok.',NULL,250000.00,0,1,'KST-ROG-03','B',NULL,'2026-10-06 03:51:58.067','2026-10-06 03:52:38.716'),(4,3,'Selempang & Topi Drumband','Aksesoris tambahan selempang dan topi untuk pasukan drumband.',75000.00,25000.00,0,1,'AKS-DRM-04','A',NULL,'2026-10-06 03:51:58.075','2026-10-06 03:52:38.724');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `refresh_tokens`
--

DROP TABLE IF EXISTS `refresh_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `refresh_tokens` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `account_type` enum('user','admin') COLLATE utf8mb4_unicode_ci NOT NULL,
  `account_id` bigint NOT NULL,
  `token_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` datetime(3) NOT NULL,
  `revoked_at` datetime(3) DEFAULT NULL,
  `device_name` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `refresh_tokens`
--

LOCK TABLES `refresh_tokens` WRITE;
/*!40000 ALTER TABLE `refresh_tokens` DISABLE KEYS */;
INSERT INTO `refresh_tokens` VALUES (1,'admin',1,'cdd911738c4ac8cf644cdff97418b1aafbf7301ea9672a61b51e0c39a4ff407f','2026-10-13 04:03:59.622',NULL,'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1','2026-10-06 04:03:59.625');
/*!40000 ALTER TABLE `refresh_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rentals`
--

DROP TABLE IF EXISTS `rentals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rentals` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `order_id` bigint NOT NULL,
  `pickup_date` date NOT NULL,
  `return_date` date NOT NULL,
  `actual_return_date` date DEFAULT NULL,
  `item_condition_before` text COLLATE utf8mb4_unicode_ci,
  `item_condition_after` text COLLATE utf8mb4_unicode_ci,
  `damage_note` text COLLATE utf8mb4_unicode_ci,
  `penalty_amount` decimal(12,2) DEFAULT NULL,
  `pickup_time` varchar(5) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `return_time` varchar(5) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `handover_admin_id` bigint DEFAULT NULL,
  `handover_at` datetime(3) DEFAULT NULL,
  `agreement_photo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `deposit_amount` decimal(12,2) DEFAULT NULL,
  `refund_amount` decimal(12,2) DEFAULT NULL,
  `refund_status` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `refund_bank` varchar(40) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `refund_account` varchar(40) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `refund_holder` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `refund_proof_image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `refunded_at` datetime(3) DEFAULT NULL,
  `status` enum('dipesan','diambil','dikembalikan','terlambat') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'dipesan',
  PRIMARY KEY (`id`),
  UNIQUE KEY `rentals_order_id_key` (`order_id`),
  CONSTRAINT `rentals_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rentals`
--

LOCK TABLES `rentals` WRITE;
/*!40000 ALTER TABLE `rentals` DISABLE KEYS */;
INSERT INTO `rentals` VALUES (1,2,'2026-10-06','2026-10-09',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'dipesan'),(2,3,'2026-10-05','2026-10-08',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'diambil'),(3,7,'2026-10-07','2026-10-10',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'dipesan'),(4,10,'2026-10-06','2026-10-08',NULL,NULL,NULL,NULL,NULL,'09:00','18:00',NULL,NULL,NULL,500000.00,NULL,NULL,'BRI','0021-01-998877-50-1','Bendahara SMAN 1 Kepanjen',NULL,NULL,'dipesan'),(5,11,'2026-10-04','2026-10-06',NULL,'Diserahkan lengkap: 2 set reog, dadak merak utuh, topeng tanpa retak.',NULL,NULL,NULL,'10:00','18:00',1,'2026-10-04 03:05:00.000',NULL,300000.00,NULL,NULL,'BCA','4410-223-987','Budi Santoso',NULL,NULL,'diambil'),(6,26,'2026-10-08','2026-10-10',NULL,NULL,NULL,NULL,NULL,'07:30','17:00',NULL,NULL,NULL,500000.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'dipesan'),(7,27,'2026-10-02','2026-10-05',NULL,'Diserahkan lengkap: 3 set reog dalam kondisi baik.',NULL,NULL,NULL,'08:00','16:00',1,'2026-10-02 01:10:00.000',NULL,300000.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'terlambat'),(8,28,'2026-09-24','2026-09-26','2026-09-26','Diserahkan lengkap: 12 stel jas drumband ukuran M.','12 stel baik & lengkap.',NULL,NULL,'08:00','17:00',1,'2026-09-24 01:15:00.000',NULL,400000.00,400000.00,'selesai',NULL,NULL,NULL,NULL,'2026-09-27 03:00:00.000','dikembalikan');
/*!40000 ALTER TABLE `rentals` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `store_profile`
--

DROP TABLE IF EXISTS `store_profile`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `store_profile` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `store_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `whatsapp_number` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `social_media` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `logo_image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `operational_hours` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `latitude` decimal(10,7) DEFAULT NULL,
  `longitude` decimal(10,7) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `store_profile`
--

LOCK TABLES `store_profile` WRITE;
/*!40000 ALTER TABLE `store_profile` DISABLE KEYS */;
INSERT INTO `store_profile` VALUES (1,'Vieguard Kostum & Drumband','Pusat pembuatan dan penyewaan kostum drumband, pawai, dan karnaval berkualitas tinggi.','Jl. Merdeka No. 45, Kota Malang, Jawa Timur','081234567890','info@vieguard.com','6281234567890','@vieguard_official',NULL,'Senin - Sabtu: 08:00 - 17:00 WIB',NULL,NULL,'2026-10-06 03:51:46.565','2026-10-06 03:51:46.565');
/*!40000 ALTER TABLE `store_profile` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `testimonials`
--

DROP TABLE IF EXISTS `testimonials`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `testimonials` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `order_id` bigint DEFAULT NULL,
  `rating` int NOT NULL,
  `comment` text COLLATE utf8mb4_unicode_ci,
  `is_featured` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `testimonials_user_id_fkey` (`user_id`),
  KEY `testimonials_order_id_fkey` (`order_id`),
  CONSTRAINT `testimonials_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `testimonials_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `testimonials`
--

LOCK TABLES `testimonials` WRITE;
/*!40000 ALTER TABLE `testimonials` DISABLE KEYS */;
/*!40000 ALTER TABLE `testimonials` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `google_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `profile_photo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_key` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Budi Santoso','budi.santoso@example.com','081234000001',NULL,NULL,'Jl. Ahmad Yani No. 12, Malang, Jawa Timur',NULL,'2026-10-06 03:51:58.001','2026-10-06 03:51:58.001'),(2,'Ni Made Sukmawati','sanggar.gayatri@example.com','081234000002',NULL,NULL,'Jl. Diponegoro No. 8, Surabaya, Jawa Timur (Sanggar Tari Gayatri)',NULL,'2026-10-06 03:51:58.024','2026-10-06 03:51:58.024'),(3,'Rina Wijaya','rina.wijaya@example.com','081234000003',NULL,NULL,'Jl. Sudirman No. 20, Malang, Jawa Timur',NULL,'2026-10-06 03:51:58.031','2026-10-06 03:51:58.031'),(4,'Ahmad Fauzan','ahmad.fauzan@example.com','081234000004',NULL,NULL,'Jl. Veteran No. 5, Malang, Jawa Timur',NULL,'2026-10-06 03:51:58.036','2026-10-06 03:51:58.036'),(5,'Dimas Kurniawan','smk.telkom.malang@example.com','081234000005',NULL,NULL,'Jl. Danau Ranau, Malang, Jawa Timur (SMK Telkom Malang)',NULL,'2026-10-06 03:51:58.040','2026-10-06 03:51:58.040'),(6,'SMAN 3 Malang','sman3.malang@example.com','081233344455',NULL,NULL,'Jl. Sultan Agung Utara No. 7, Klojen, Kota Malang',NULL,'2026-10-06 03:52:07.997','2026-10-06 03:52:07.997'),(7,'SD Muhammadiyah 1 Batu','sdmuh1.batu@example.com','081377788899',NULL,NULL,'Jl. Diponegoro No. 21, Kota Batu, Jawa Timur',NULL,'2026-10-06 03:52:08.020','2026-10-06 03:52:08.020'),(8,'SMK Negeri 2 Malang','smkn2.malang@example.com','081255566677',NULL,NULL,'Jl. Veteran No. 17, Lowokwaru, Kota Malang',NULL,'2026-10-06 03:52:08.024','2026-10-06 03:52:08.024'),(9,'SMP Brawijaya Malang','smp.brawijaya@example.com','081234567890',NULL,NULL,'Jl. Veteran No. 12, Lowokwaru, Kota Malang, Jawa Timur',NULL,'2026-10-06 03:52:38.761','2026-10-06 03:52:38.761'),(10,'SMA Taruna Bangsa','sma.taruna@example.com','081355512345',NULL,NULL,'Jl. Soekarno Hatta No. 45, Kota Malang, Jawa Timur',NULL,'2026-10-06 03:52:38.776','2026-10-06 03:52:38.776'),(11,'SMAN 1 Kepanjen','sman1.kepanjen@example.com','081299988877',NULL,NULL,'Jl. Raya Kepanjen No. 3, Kabupaten Malang, Jawa Timur',NULL,'2026-10-06 03:52:38.785','2026-10-06 03:52:38.785');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'vieguard_db'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-11  7:16:22
