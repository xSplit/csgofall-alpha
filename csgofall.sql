SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

CREATE TABLE IF NOT EXISTS `chat` (
`id` bigint(20) unsigned NOT NULL,
  `message` text NOT NULL
) ENGINE=InnoDB AUTO_INCREMENT=18360 DEFAULT CHARSET=latin1;

CREATE TABLE IF NOT EXISTS `codes` (
`id` int(11) unsigned NOT NULL,
  `code` varchar(20) NOT NULL,
  `value` int(11) NOT NULL,
  `uid` int(11) unsigned NOT NULL,
  `earned` int(11) unsigned NOT NULL,
  `claimed` int(11) unsigned NOT NULL
) ENGINE=InnoDB AUTO_INCREMENT=9913 DEFAULT CHARSET=latin1;

CREATE TABLE IF NOT EXISTS `games` (
`id` bigint(20) unsigned NOT NULL,
  `uid` int(11) unsigned NOT NULL,
  `mul` float NOT NULL,
  `bet` int(11) NOT NULL,
  `time` int(11) NOT NULL,
  `color` float NOT NULL,
  `seed` varchar(40) NOT NULL
) ENGINE=InnoDB AUTO_INCREMENT=2270905 DEFAULT CHARSET=latin1;

INSERT INTO `games` (`id`, `uid`, `mul`, `bet`, `time`, `color`, `seed`) VALUES
(2270901, 49545, 1.1, 25000, 1489774903, 0, '8f2b0b9cba65c551409f5990822ed47fd64acb03'),
(2270902, 49545, 0, 25000, 1489774904, 1, 'a2996b75adff112726b9ce6cbf4f26fbd225f2f1'),
(2270903, 49545, 0.1, 1000, 1489774914, 2, '4f063897a72b3097c57d396d83d8fa722796f7c2'),
(2270904, 49545, 1.1, 1000, 1489774914, 0, 'e645b318c34eaee1dd142489d815051ac03d232b');

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

INSERT INTO `notifications` (`id`, `uid`, `value`, `type`, `isnew`, `time`, `offer`, `bot`) VALUES
(2209, 49545, 3144, 2, 0, 1489777036, '1945992262', 1),
(2210, 49545, 6089, 0, 0, 1489777111, '1945996029', 2),
(2211, 49545, 1130, 2, 0, 1489777307, '1946005346', 0),
(2212, 49545, 3192, 2, 0, 1489777381, '1946008878', 0);

CREATE TABLE IF NOT EXISTS `poll_bots` (
  `id` bigint(20) NOT NULL,
  `json` longtext CHARACTER SET utf8
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE IF NOT EXISTS `poll_trades` (
`id` bigint(20) NOT NULL,
  `json` tinytext NOT NULL
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=latin1;

CREATE TABLE IF NOT EXISTS `series` (
  `uid` int(11) unsigned NOT NULL,
  `json` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE IF NOT EXISTS `settings` (
`id` int(11) NOT NULL,
  `keyname` varchar(20) NOT NULL,
  `value` int(11) NOT NULL
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=latin1;

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

ALTER TABLE `chat`
 ADD PRIMARY KEY (`id`);
 
ALTER TABLE `codes`
 ADD PRIMARY KEY (`id`), ADD UNIQUE KEY `uid` (`uid`), ADD KEY `code` (`code`);
 
ALTER TABLE `games`
 ADD PRIMARY KEY (`id`), ADD KEY `uid` (`uid`), ADD KEY `mul` (`mul`), ADD KEY `time` (`time`);
 
ALTER TABLE `notifications`
 ADD PRIMARY KEY (`id`), ADD KEY `uid` (`uid`), ADD KEY `type` (`type`), ADD KEY `isnew` (`isnew`);
 
ALTER TABLE `poll_bots`
 ADD PRIMARY KEY (`id`);
 
ALTER TABLE `poll_trades`
 ADD PRIMARY KEY (`id`);

ALTER TABLE `series`
 ADD UNIQUE KEY `uid` (`uid`);

ALTER TABLE `settings`
 ADD PRIMARY KEY (`id`);

ALTER TABLE `users`
 ADD PRIMARY KEY (`id`), ADD KEY `steamid` (`steamid`), ADD KEY `online` (`online`), ADD KEY `token` (`token`), ADD KEY `redeemed` (`redeemed`);

ALTER TABLE `users_glitched`
 ADD PRIMARY KEY (`id`), ADD KEY `steamid` (`steamid`), ADD KEY `online` (`online`), ADD KEY `token` (`token`), ADD KEY `redeemed` (`redeemed`);

ALTER TABLE `chat`
MODIFY `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=18360;

ALTER TABLE `codes`
MODIFY `id` int(11) unsigned NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=9913;

ALTER TABLE `games`
MODIFY `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=2270905;

ALTER TABLE `notifications`
MODIFY `id` bigint(11) unsigned NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=2213;

ALTER TABLE `poll_trades`
MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=8;

ALTER TABLE `settings`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=11;

ALTER TABLE `users`
MODIFY `id` int(11) unsigned NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=49546;

ALTER TABLE `users_glitched`
MODIFY `id` int(11) unsigned NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=48460;
