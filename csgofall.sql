-- phpMyAdmin SQL Dump
-- version 4.2.12deb2+deb8u1build0.15.04.1
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Mar 17, 2017 alle 20:27
-- Versione del server: 5.6.27-0ubuntu0.15.04.1
-- PHP Version: 5.6.4-4ubuntu6.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `csgofall`
--

-- --------------------------------------------------------

--
-- Struttura della tabella `chat`
--

CREATE TABLE IF NOT EXISTS `chat` (
`id` bigint(20) unsigned NOT NULL,
  `message` text NOT NULL
) ENGINE=InnoDB AUTO_INCREMENT=18360 DEFAULT CHARSET=latin1;

--
-- Dump dei dati per la tabella `chat`
--

INSERT INTO `chat` (`id`, `message`) VALUES
(18350, '{"username":"henrywest516","avatar":"https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/fe/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb.jpg","chat":"testt","icon":"","uid":49545}'),
(18351, '{"username":"henrywest516","avatar":"https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/fe/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb.jpg","chat":"testing","icon":"","uid":49545}'),
(18352, '{"username":"henrywest516","avatar":"https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/fe/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb.jpg","chat":"test2","icon":"","uid":49545}'),
(18353, '{"username":"henrywest516","avatar":"https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/fe/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb.jpg","chat":"test","icon":"","uid":49545}'),
(18354, '{"username":"henrywest516","avatar":"https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/fe/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb.jpg","chat":"test","icon":"","uid":49545}'),
(18355, '{"username":"henrywest516","avatar":"https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/fe/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb.jpg","chat":"test","icon":"","uid":49545}'),
(18356, '{"username":"henrywest516","avatar":"https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/fe/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb.jpg","chat":"testing","icon":"","uid":49545}'),
(18357, '{"username":"henrywest516","avatar":"https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/fe/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb.jpg","chat":"test","icon":"","uid":49545}'),
(18358, '{"username":"henrywest516","avatar":"https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/fe/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb.jpg","chat":"testing","icon":"","uid":49545}'),
(18359, '{"username":"henrywest516","avatar":"https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/fe/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb.jpg","chat":"lol","icon":"","uid":49545}');

-- --------------------------------------------------------

--
-- Struttura della tabella `codes`
--

CREATE TABLE IF NOT EXISTS `codes` (
`id` int(11) unsigned NOT NULL,
  `code` varchar(20) NOT NULL,
  `value` int(11) NOT NULL,
  `uid` int(11) unsigned NOT NULL,
  `earned` int(11) unsigned NOT NULL,
  `claimed` int(11) unsigned NOT NULL
) ENGINE=InnoDB AUTO_INCREMENT=9913 DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Struttura della tabella `games`
--

CREATE TABLE IF NOT EXISTS `games` (
`id` bigint(20) unsigned NOT NULL,
  `uid` int(11) unsigned NOT NULL,
  `mul` float NOT NULL,
  `bet` int(11) NOT NULL,
  `time` int(11) NOT NULL,
  `color` float NOT NULL,
  `seed` varchar(40) NOT NULL
) ENGINE=InnoDB AUTO_INCREMENT=2270905 DEFAULT CHARSET=latin1;

--
-- Dump dei dati per la tabella `games`
--

INSERT INTO `games` (`id`, `uid`, `mul`, `bet`, `time`, `color`, `seed`) VALUES
(2270901, 49545, 1.1, 25000, 1489774903, 0, '8f2b0b9cba65c551409f5990822ed47fd64acb03'),
(2270902, 49545, 0, 25000, 1489774904, 1, 'a2996b75adff112726b9ce6cbf4f26fbd225f2f1'),
(2270903, 49545, 0.1, 1000, 1489774914, 2, '4f063897a72b3097c57d396d83d8fa722796f7c2'),
(2270904, 49545, 1.1, 1000, 1489774914, 0, 'e645b318c34eaee1dd142489d815051ac03d232b');

-- --------------------------------------------------------

--
-- Struttura della tabella `notifications`
--

CREATE TABLE IF NOT EXISTS `notifications` (
`id` bigint(11) unsigned NOT NULL,
  `uid` int(11) unsigned NOT NULL,
  `value` int(11) NOT NULL,
  `type` tinyint(4) NOT NULL,
  `isnew` tinyint(1) NOT NULL,
  `time` int(11) NOT NULL,
  `offer` varchar(20) NOT NULL,
  `bot` tinyint(3) unsigned NOT NULL
) ENGINE=InnoDB AUTO_INCREMENT=2213 DEFAULT CHARSET=latin1;

--
-- Dump dei dati per la tabella `notifications`
--

INSERT INTO `notifications` (`id`, `uid`, `value`, `type`, `isnew`, `time`, `offer`, `bot`) VALUES
(2209, 49545, 3144, 2, 0, 1489777036, '1945992262', 1),
(2210, 49545, 6089, 0, 0, 1489777111, '1945996029', 2),
(2211, 49545, 1130, 2, 0, 1489777307, '1946005346', 0),
(2212, 49545, 3192, 2, 0, 1489777381, '1946008878', 0);

-- --------------------------------------------------------

--
-- Struttura della tabella `poll_bots`
--

CREATE TABLE IF NOT EXISTS `poll_bots` (
  `id` bigint(20) NOT NULL,
  `json` longtext CHARACTER SET utf8
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dump dei dati per la tabella `poll_bots`
--

INSERT INTO `poll_bots` (`id`, `json`) VALUES
(0, '{"type":"BotInventory","data":[[{"name":"Glock-18 | Water Elemental (Field-Tested)","wear_type":"Field-Tested","amount":"1","price":3528,"image":"https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgposbaqKAxf0Ob3djFN79f7mImagvLnML7fglRc7cF4n-SPrNqm2lbk-kNlMWH7dY-TcVVtNw3UrlO9w-u-15696svOyCdq7nMhtGGdwUKQqhPPUw/256fx256f"},{"name":"Five-SeveN | Retrobution (Minimal Wear)","wear_type":"Minimal Wear","amount":"1","price":1249,"image":"https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgposLOzLhRlxfbGTj5X09q_goWYkuHxPYTDk39D58dknuDO-7P5gVO8v11rNj_3doSVIA5taAmFrlXqx-rphJ66vc7AnXtg6Cgj43zdyRPm0h9NcKUx0kOQhc3i/256fx256f"},{"name":"Sealed Graffiti | Shooting Star Return","wear_type":"Asset/Case","amount":"1","price":598,"image":"https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXQ9QVcJY8gulReQ0HdUuqkw9bsXlRsdVUYpbKqJBNp3fTbZTxQoojjx9DaxvSma-6HxToF7JFz2bHF8Imm3QPh-RdoamHzIIDEelJtaF3Oug_pEvk_8as/256fx256f"}]]}'),
(1, '{"type":"BotInventoryError","data":"The server was unable to load items."}'),
(2, '{"type":"BotInventory","data":[[{"name":"Five-SeveN | Monkey Business (Battle-Scarred)","wear_type":"Battle-Scarred","amount":"1","price":1312,"image":"https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgposLOzLhRlxfbGTj5X09q_goWYkuHxPYTTl2VQ5sROguzA45W70VXiqktvYDinIo6dcFc_aF-E-wO9xrq7g5K4uZjLmiNkuXEl4n3Ungv3309_82FCmw/256fx256f"},{"name":"Five-SeveN | Retrobution (Minimal Wear)","wear_type":"Minimal Wear","amount":"1","price":1249,"image":"https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgposLOzLhRlxfbGTj5X09q_goWYkuHxPYTDk39D58dknuDO-7P5gVO8v11rNj_3doSVIA5taAmFrlXqx-rphJ66vc7AnXtg6Cgj43zdyRPm0h9NcKUx0kOQhc3i/256fx256f"},{"name":"Glock-18 | Water Elemental (Field-Tested)","wear_type":"Field-Tested","amount":"1","price":3528,"image":"https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgposbaqKAxf0Ob3djFN79f7mImagvLnML7fglRc7cF4n-SPrNqm2lbk-kNlMWH7dY-TcVVtNw3UrlO9w-u-15696svOyCdq7nMhtGGdwUKQqhPPUw/256fx256f"}]]}');

-- --------------------------------------------------------

--
-- Struttura della tabella `poll_trades`
--

CREATE TABLE IF NOT EXISTS `poll_trades` (
`id` bigint(20) NOT NULL,
  `json` tinytext NOT NULL
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Struttura della tabella `series`
--

CREATE TABLE IF NOT EXISTS `series` (
  `uid` int(11) unsigned NOT NULL,
  `json` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Struttura della tabella `settings`
--

CREATE TABLE IF NOT EXISTS `settings` (
`id` int(11) NOT NULL,
  `keyname` varchar(20) NOT NULL,
  `value` int(11) NOT NULL
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=latin1;

--
-- Dump dei dati per la tabella `settings`
--

INSERT INTO `settings` (`id`, `keyname`, `value`) VALUES
(1, 'min_bet', 10),
(2, 'max_bet', 500000),
(3, 'min_deposit', 500),
(5, 'min_withdraw', 500),
(6, 'chat_open', 1),
(7, 'deposit_open', 1),
(8, 'withdraw_open', 1),
(9, 'refval', 50),
(10, 'codes_open', 1);

-- --------------------------------------------------------

--
-- Struttura della tabella `users`
--

CREATE TABLE IF NOT EXISTS `users` (
`id` int(11) unsigned NOT NULL,
  `steamid` varchar(20) NOT NULL,
  `balance` int(11) unsigned NOT NULL,
  `total_wagered` bigint(20) unsigned NOT NULL,
  `total_bets` bigint(20) unsigned NOT NULL,
  `total_wins` bigint(20) unsigned NOT NULL,
  `total_losses` bigint(20) unsigned NOT NULL,
  `total_chat` int(10) unsigned NOT NULL,
  `online` int(11) NOT NULL,
  `username` varchar(24) NOT NULL,
  `avatar` tinytext NOT NULL,
  `trade_url` tinytext NOT NULL,
  `token` varchar(40) NOT NULL,
  `last_chat` int(11) NOT NULL,
  `last_game` int(11) NOT NULL,
  `banned` tinyint(1) NOT NULL,
  `limited` tinyint(1) NOT NULL,
  `redeemed` int(11) unsigned NOT NULL,
  `icon` varchar(10) NOT NULL
) ENGINE=InnoDB AUTO_INCREMENT=49546 DEFAULT CHARSET=latin1;

--
-- Dump dei dati per la tabella `users`
--

INSERT INTO `users` (`id`, `steamid`, `balance`, `total_wagered`, `total_bets`, `total_wins`, `total_losses`, `total_chat`, `online`, `username`, `avatar`, `trade_url`, `token`, `last_chat`, `last_game`, `banned`, `limited`, `redeemed`, `icon`) VALUES
(49543, '76561198114966059', 0, 0, 0, 0, 0, 0, 1489777021, 'Don Vasquez', 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/ee/eee6713ff9f64c9c7a252eaef163ec840ea04e44.jpg', '', 'lWBk4Gnj0SzYswef7XdLQtiqoCMvmPphOJ8xVIE2', 0, 0, 0, 0, 0, ''),
(49544, '76561198334934583', 0, 0, 0, 0, 0, 0, 1489694526, 'PeBro69- cs.money / csgo', 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/fe/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb.jpg', 'https://steamcommunity.com/tradeoffer/new/?partner=374668855&token=dS1qJnu9', 'oQC2IwhaUpxfVlW4TnujNbSvecR1qGi73YJgHO9z', 0, 0, 0, 0, 0, ''),
(49545, '76561198335080699', 78077, 28700, 4, 2, 2, 10, 1489778594, 'henrywest516', 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/fe/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb.jpg', 'https://steamcommunity.com/tradeoffer/new/?partner=374814971&token=xgy92zZA', 'kczPQRCrbtsKewiEg5lfXVW8aj9JyvFHBmNYDo4d', 1489774862, 1489774914, 0, 0, 0, '');

-- --------------------------------------------------------

--
-- Struttura della tabella `users_glitched`
--

CREATE TABLE IF NOT EXISTS `users_glitched` (
`id` int(11) unsigned NOT NULL,
  `steamid` varchar(20) NOT NULL,
  `balance` int(11) unsigned NOT NULL,
  `total_wagered` bigint(20) unsigned NOT NULL,
  `total_bets` bigint(20) unsigned NOT NULL,
  `total_wins` bigint(20) unsigned NOT NULL,
  `total_losses` bigint(20) unsigned NOT NULL,
  `total_chat` int(10) unsigned NOT NULL,
  `online` int(11) NOT NULL,
  `username` varchar(24) NOT NULL,
  `avatar` tinytext NOT NULL,
  `trade_url` tinytext NOT NULL,
  `token` varchar(40) NOT NULL,
  `last_chat` int(11) NOT NULL,
  `last_game` int(11) NOT NULL,
  `banned` tinyint(1) NOT NULL,
  `limited` tinyint(1) NOT NULL,
  `redeemed` int(11) unsigned NOT NULL,
  `icon` varchar(10) NOT NULL
) ENGINE=InnoDB AUTO_INCREMENT=48460 DEFAULT CHARSET=latin1;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `chat`
--
ALTER TABLE `chat`
 ADD PRIMARY KEY (`id`);

--
-- Indexes for table `codes`
--
ALTER TABLE `codes`
 ADD PRIMARY KEY (`id`), ADD UNIQUE KEY `uid` (`uid`), ADD KEY `code` (`code`);

--
-- Indexes for table `games`
--
ALTER TABLE `games`
 ADD PRIMARY KEY (`id`), ADD KEY `uid` (`uid`), ADD KEY `mul` (`mul`), ADD KEY `time` (`time`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
 ADD PRIMARY KEY (`id`), ADD KEY `uid` (`uid`), ADD KEY `type` (`type`), ADD KEY `isnew` (`isnew`);

--
-- Indexes for table `poll_bots`
--
ALTER TABLE `poll_bots`
 ADD PRIMARY KEY (`id`);

--
-- Indexes for table `poll_trades`
--
ALTER TABLE `poll_trades`
 ADD PRIMARY KEY (`id`);

--
-- Indexes for table `series`
--
ALTER TABLE `series`
 ADD UNIQUE KEY `uid` (`uid`);

--
-- Indexes for table `settings`
--
ALTER TABLE `settings`
 ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
 ADD PRIMARY KEY (`id`), ADD KEY `steamid` (`steamid`), ADD KEY `online` (`online`), ADD KEY `token` (`token`), ADD KEY `redeemed` (`redeemed`);

--
-- Indexes for table `users_glitched`
--
ALTER TABLE `users_glitched`
 ADD PRIMARY KEY (`id`), ADD KEY `steamid` (`steamid`), ADD KEY `online` (`online`), ADD KEY `token` (`token`), ADD KEY `redeemed` (`redeemed`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `chat`
--
ALTER TABLE `chat`
MODIFY `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=18360;
--
-- AUTO_INCREMENT for table `codes`
--
ALTER TABLE `codes`
MODIFY `id` int(11) unsigned NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=9913;
--
-- AUTO_INCREMENT for table `games`
--
ALTER TABLE `games`
MODIFY `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=2270905;
--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
MODIFY `id` bigint(11) unsigned NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=2213;
--
-- AUTO_INCREMENT for table `poll_trades`
--
ALTER TABLE `poll_trades`
MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=8;
--
-- AUTO_INCREMENT for table `settings`
--
ALTER TABLE `settings`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=11;
--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
MODIFY `id` int(11) unsigned NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=49546;
--
-- AUTO_INCREMENT for table `users_glitched`
--
ALTER TABLE `users_glitched`
MODIFY `id` int(11) unsigned NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=48460;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
