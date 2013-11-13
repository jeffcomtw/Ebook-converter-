use test;
DROP TABLE IF EXISTS `ebook`;
CREATE TABLE `ebook` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(512) DEFAULT NULL,
  `author` varchar(256) DEFAULT NULL,
  `date` varchar(100) DEFAULT NULL,
  `language` varchar(100) DEFAULT NULL,
  `url` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
