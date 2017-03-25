/** CSGOFall Server **/

var WebSocket = require('ws');
var fs = require('fs');
var port = process.argv[2];
var wss = new WebSocket.Server({ port: port }); //wss.clients
var mysql = require('mysql');
var db;
function takeConnection() {
    db = mysql.createConnection({host: '127.0.0.1', user: 'root', password: 'dev', database: 'csgofall'});
    db.connect(function(err) { if(err) setTimeout(takeConnection, 2000); });
    db.on('error', function(err) { takeConnection(); });
}
takeConnection();

var max_chat = 50;

var request = require('request');
var prices, cacheredeem = {};

var pos = [
    [50,25,1.4,1.3,1.2,0.1,1.1,1.1,1.1,1.1,1.1,0.1,1.2,1.3,1.4,25,50],
    [100,25,10,6,3,2,1.3,0.2,0,0.2,1.3,2,3,6,10,25,100],
    [250,50,20,10,5,3,0,0,0.1,0,0,3,5,10,20,50,250]
];

var last_chat_message = null, last_live, last_high;
setInterval(function(){
    db.query("SELECT g.id,g.uid,g.mul,g.bet,g.time,g.color,u.username FROM games g LEFT JOIN users u ON u.id=g.uid WHERE (UNIX_TIMESTAMP()-g.time)>9 AND g.bet < 25000 ORDER BY g.id DESC LIMIT 1",function(err,rows){
        if(last_live != rows[0].toString())
		{
			last_live = rows[0].toString();
			sendAll({type:'GamesLastLive',data:rows});
		}
    });
    db.query("SELECT g.id,g.uid,g.mul,g.bet,g.time,g.color,u.username FROM games g LEFT JOIN users u ON u.id=g.uid WHERE (UNIX_TIMESTAMP()-g.time)>9 AND g.bet >= 25000 ORDER BY g.id DESC LIMIT 1",function(err,rows){
        if(last_high != rows[0].toString())
		{
			last_high = rows[0].toString();
			sendAll({type:'GamesLastHigh',data:rows});
		}
    });
},2000);
setInterval(function(){
	db.query("SELECT COUNT(*) AS total_online FROM users WHERE (UNIX_TIMESTAMP()-600) < online",function (err,rows) {
        sendAll({type:'Online',data:rows[0].total_online});
    });
	db.query("SELECT message FROM chat ORDER BY id DESC LIMIT 1",function(err,rows){
		if(last_chat_message != rows[0].message){
			sendAll({type: 'Chat', data: JSON.parse(rows[0].message)});
			last_chat_message = rows[0].message;
		}
    });
},5000);

wss.on('connection', function(ws) {
	//rateLimit(ws);
    ws.on('message', function(msg) {
        //console.log(msg);
        try{ msg = JSON.parse(msg); }catch(e){}
        if(msg.hasOwnProperty('type') && msg.hasOwnProperty('data') && msg.hasOwnProperty('token')) {
            var data = msg.data, token = msg.token;
            if(token != null) db.query("UPDATE users SET online=UNIX_TIMESTAMP() WHERE token=?", [token]);
            switch (msg.type) {
                case 'Join':
                    sendTo(ws, {type: 'BotsCount', data: bots.length});
                    break;
                case 'Login':
                    db.query("SELECT u.balance, u.total_wagered, u.steamid, u.trade_url, c.code, c.value FROM users u LEFT JOIN codes c ON c.uid=u.id WHERE token=?", [token], function (err, rows) {
                        if (rows.length < 1) return;
                        sendTo(ws, {type: 'Logged', data: rows[0]});
                    });
                    break;
                case 'Chat':
                    db.query("SELECT value FROM settings WHERE keyname='chat_open'",function(err, is_open) {
                        if (is_open.length < 1 || !is_open[0].value) {
                            sendTo(ws, {type: 'ChatError', data: 'Chat is closed'});
                            return;
                        }
                        db.query("SELECT username, balance, avatar, icon, (UNIX_TIMESTAMP()-last_chat) AS anti_spam, banned, id FROM users WHERE token=?", [token], function (err, rows) {
                            if (rows.length < 1) {
                                sendTo(ws, {type: 'ChatError', data: 'Not signed in!'});
                                return;
                            }
                            if(data.charAt(0) == '/'){
                                var params = data.split(' ');
                                switch(params[0]){
                                    case '/ref':
                                        askRedeem(token,data,ws,'PlayAlert');
                                        break;
                                    case '/ban':
                                        if(rows[0].icon == 'mod' || rows[0].icon == 'admin'){
                                            db.query("SELECT id,message FROM chat",function(err,rows){
                                                for(var k in rows){
                                                    var msg = JSON.parse(rows[k].message);
                                                    db.query("SELECT steamid,id FROM users WHERE id=?",[msg.uid],function(err,urows){
                                                        if(urows.length > 0 && urows[0].steamid == params[1])
                                                            db.query("DELETE FROM chat WHERE id=?",[urows[0].id]);
                                                    });
                                                }
                                            });
											db.query("UPDATE users SET banned = NOT banned WHERE steamid=?",[params[1]]);
                                        }
                                        break;
										case '/limit':
                                        if(rows[0].icon == 'mod' || rows[0].icon == 'admin'){
											db.query("UPDATE users SET limited = NOT limited WHERE steamid=?",[params[1]]);
                                        }
                                        break;
										case '/alert':
										sendAll({type: 'PlayAlert', data: params.slice(1).join(' ')});
										break;
                                }
                                return;
                            }
                            if (data.length <= 250 && data.length >= 2) {
                                if (rows[0].anti_spam > 2) {
                                    var newmsg = {
                                        username: rows[0].username,
                                        avatar: rows[0].avatar,
                                        chat: noUrls(escapeHtml(data)),
                                        icon: rows[0].icon,
                                        uid: rows[0].id
                                    };
                                    if (!rows[0].banned){
                                        db.query("INSERT INTO chat(message) VALUES(?)", [JSON.stringify(newmsg)]);
                                        db.query("SELECT COUNT(*) AS count FROM chat", function (err, rows) {
                                            if (rows[0].count > max_chat)
                                                db.query("DELETE FROM chat ORDER BY id ASC LIMIT 1");
                                        });
                                    }
                                    db.query("UPDATE users SET last_chat=UNIX_TIMESTAMP(),total_chat=total_chat+1 WHERE id=?", [rows[0].id]);
                                } else
                                    sendTo(ws, {type: 'ChatError', data: 'Typing too fast!'});
                            }
                            else
                                sendTo(ws, {type: 'ChatError', data: 'Invalid text length!'});
                        });
                    });
                    break;
                case 'Inventory':
                    db.query("SELECT steamid FROM users WHERE token=?", [token], function (err, rows) {
                        if (rows.length < 1){
                            sendTo(ws, {type: 'InventoryError', data: 'Sign in with Steam to see inventory.'});
                            return;
                        }
						request({url:'https://steamcommunity.com/inventory/' + rows[0].steamid + '/730/2?l=english', headers:{
							"Referer": "https://steamcommunity.com/profiles/" + rows[0].steamid + "/inventory"}}, function (err, resp, body) {
							try {
								if (!err && resp.statusCode == 200) {
									var rg = JSON.parse(body);
									if (rg.hasOwnProperty('descriptions')) {
										GetItems(rg, function (items) {
											if (items.length > 0)
												sendTo(ws, {type: 'Inventory', data: items});
											else
												sendTo(ws, {type: 'InventoryError', data: 'Try again.'});
										});
									} else
										sendTo(ws, {type: 'InventoryError', data: 'Your inventory is private or empty.'});
								} else
									sendTo(ws, {type: 'InventoryError', data: 'The server was unable to load your inventory.'});
							}catch(e){
								sendTo(ws, {type: 'InventoryError', data: 'The server did not generate a response.'});
							}
						});
                    });
                    break;
                case 'BotInventory':
                    var pool = parseInt(data);
                    db.query("SELECT json FROM poll_bots WHERE id=?",[pool],function(err,rows){
							sendTo(ws,JSON.parse(rows[0].json));
						});
                    break;
                case 'SerieReset':
                    db.query("SELECT id AS uid FROM users WHERE token=?",[token],function(err,rows) {
                        if (rows.length < 1) return;
                        var base = [pos[0],pos[1],pos[2]];
                        db.query("UPDATE series SET json=? WHERE uid=?",[JSON.stringify([[],[],[]]),rows[0].uid],function(){
                            sendTo(ws,{type:'Series',data:base})
                        });
                    });
                    break;
                case 'NewSerie':
                    if(!data.hasOwnProperty('serie') || !data.hasOwnProperty('pos') || !(data['serie'] instanceof Array)) return;
                    db.query("SELECT id AS uid FROM users WHERE token=?",[token],function(err,rows){
                        if(rows.length < 1) return;
                        var pindex = parseInt(data['pos']); if(pos[pindex] == undefined) return;
                        db.query("SELECT json FROM series WHERE uid=?",[rows[0].uid],function(err,json){
                            json = json.length < 1 ? [[],[],[]] : JSON.parse(json[0].json);
                            if(data['serie'].length == 17) {
                                if(payTableToEdge(data['serie']) < 0.99) return;
                                json[pindex] = pos[pindex].toString() != data['serie'].toString() ? data['serie'] : [];
                                db.query("REPLACE INTO series(uid,json) VALUES(?,?)",[rows[0].uid,JSON.stringify(json)]);
                            }
                        });
                    });
                    break;
                case 'Series':
                    db.query("SELECT id AS uid FROM users WHERE token=?",[token],function(err,rows){
                        var base = [pos[0],pos[1],pos[2]];
                        if(rows.length < 1){
                            sendTo(ws, {type:'Series',data:base});
                            return;
                        }
                        db.query("SELECT json FROM series WHERE uid=?",[rows[0].uid],function(err,rows){
                            if(rows.length < 1){
                                sendTo(ws, {type:'Series',data:base});
                                return;
                            }
                            var json = JSON.parse(rows[0].json);
                            for(var i=0;i<3;i++)
                                if(json[i].length < 1)
                                    json[i] = base[i];
                            sendTo(ws, {type:'Series',data:json});
                        });
                    });
                    break;
                case 'Play':
                    if(!data.hasOwnProperty('amount') || !data.hasOwnProperty('coin')) return;
                    var bet = parseInt(data.amount);
                    if (!isNaN(bet)) {
                        db.query("SELECT value FROM settings WHERE keyname='min_bet' OR keyname='max_bet' ORDER BY keyname DESC",function(err,rows) {
                            if (rows.length < 2) {
                                sendTo(ws, {type: 'PlayError', data: 'Unable to bet try again later!'});
                                return;
                            }
                            if (bet < rows[0].value) {
                                sendTo(ws, {type: 'PlayError', data: 'Minimum bet is ' + rows[0].value + ' credits!'});
                                return;
                            }
                            if (bet > rows[1].value) {
                                sendTo(ws, {type: 'PlayError', data: 'Maximum bet is ' + rows[1].value + ' credits!'});
                                return;
                            }
                            db.query("SELECT s.json,u.balance,u.redeemed,(UNIX_TIMESTAMP()-u.last_game) AS last_play,u.id AS uid FROM users u LEFT JOIN series s ON s.uid=u.id WHERE u.token=?", [token], function (err, rows) {
                                if (rows.length < 1) {
                                    sendTo(ws, {type: 'PlayAlert', data: 'Sign in with Steam to play!'});
                                    return;
                                }
                                db.query("UPDATE users SET last_game=UNIX_TIMESTAMP() WHERE id=?",[rows[0].uid]);
                                var balance = rows[0].balance; var json = rows[0].json==null ? pos : JSON.parse(rows[0].json); json.push(1);
                                if (bet <= balance) {
                                    var pindex = parseInt(data.coin), tserie = json[pindex];
                                    if (tserie != undefined) {
                                        if(tserie.length<1) tserie = pos[pindex];
                                        var serie = [], zt, win, res;
                                        var server_seed = getToken();
                                        var hash = getSHA1(server_seed+getSHA1((bet).toString()));
                                        if(tserie instanceof Array) {
                                            var final = 16; zt = [-1, 1];
                                            for (var p = 0; p < 16; p++) {
                                                var new_v = zt[hash.charCodeAt(p) % 2];
                                                serie.push(new_v);
                                                if (new_v < 0) final--;
                                            }
                                            win = tserie[final]; res = parseInt(bet * win);
                                        }else{
                                            if(rows[0].last_play < 1){
                                                sendTo(ws, {type: 'PlayAlert', data: 'You are playing too fast!'});
                                                return;
                                            }
                                            if(!data.hasOwnProperty('over') || !data.hasOwnProperty('proll')) return;
                                            var is_over = data.over?1:0, proll = parseFloat(data.proll);
                                            if(((proll < 1.99 || proll > 99.98) && is_over) || ((proll < 0.01 || proll > 98) && !is_over)) return;
                                            var sum = 0;
                                            for(var z = 0; z < hash.length; z++)
                                                sum += hash.charCodeAt(z) + hash.charCodeAt(z)/100;
                                            sum = (sum % 100).toFixed(2);
                                            if((is_over && sum > proll) || (!is_over && sum < proll)) {
                                                win = !is_over ? 1 / (proll / 99) : -1 / ((proll - 99.99) / 99);
                                                res = parseInt(win * bet);
                                            }
                                            else
                                                res = win = 0;
                                        }
                                        var uid = rows[0].uid, profit = res-bet;
                                        db.query("INSERT INTO games(uid,mul,bet,time,color,seed) VALUES(?,?,?,UNIX_TIMESTAMP(),?,?)", [uid, win.toFixed(3), bet,
                                            data.coin<3?data.coin:(-sum-1).toFixed(2),server_seed], function (err, res) {
                                            sendTo(ws, {
                                                type: 'Play',
                                                data: {id: res.insertId, serie: serie, coin: data.coin}
                                            });
                                        });
                                        if(bet<25000)
                                            db.query("SELECT COUNT(*) AS played FROM games WHERE uid=?",[uid],function(err,games){
                                                if(games[0].played > 250)
                                                    db.query("DELETE FROM games WHERE uid=? AND bet<25000 ORDER BY id ASC LIMIT 1",[uid]);
                                            });
                                        var tbs = profit>=0?"total_wins=total_wins":"total_losses=total_losses";
                                        db.query("UPDATE users SET balance=balance+?,total_wagered=total_wagered+?,total_bets=total_bets+1,"+tbs+"+1 WHERE id=?", [profit, res, uid]);
                                        if(rows[0].redeemed > 0 && profit > 0)
                                            db.query("UPDATE users u INNER JOIN codes c ON c.uid=u.id SET u.balance=u.balance+?,c.earned=c.earned+? WHERE c.id=?"
                                            ,[profit/100,profit/100,rows[0].redeemed]);
                                    }
                                } else
                                    sendTo(ws, {type: 'PlayError', data: 'Your bet is higher than your available balance!'});
                            });
                        });
                    } else
                        sendTo(ws, {type: 'PlayAlert', data: 'Invalid amount value must be a number!'});
                    break;
                case 'Game': //color = coin
                    db.query("SELECT mul,bet,color AS coin FROM games WHERE id=?",[data],function(err,rows){
                        if(rows.length < 1) return;
                        if(rows[0].coin >= 0)
                            sendTo(ws,{type:'Game', data:parseInt(parseFloat(rows[0].mul)*rows[0].bet)});
                        else
                            sendTo(ws,{type:'Game2', data:(rows[0].mul>0?parseInt(parseFloat(rows[0].mul)*rows[0].bet):0)-rows[0].bet});
                    });
                    break;
                case 'HashSee':
                    db.query("SELECT seed,bet FROM games WHERE id=?",[data],function(err,rows){
                        if(rows.length < 1) return;
                        var hash = getSHA1(rows[0].seed+getSHA1((rows[0].bet).toString()));
                        sendTo(ws,{type:'HashModal',data:{server_seed:rows[0].seed,public_hash:hash}});
                    });
                    break;
                case 'Games':
                    switch(data){
                        case 'LIVE':
                            db.query("SELECT g.id,g.uid,g.mul,g.bet,g.time,g.color,u.username FROM games g LEFT JOIN users u ON u.id=g.uid WHERE (UNIX_TIMESTAMP()-g.time)>9 AND g.bet < 25000 ORDER BY g.id DESC LIMIT 50",function(err,rows){
                                if(rows.length < 1){
                                    sendTo(ws,{type:'GamesError', data:'No games to display at the moment!'});
                                    return;
                                }
                                sendTo(ws,{type:'GamesLive',data:rows});
                            });
                            break;
                        case 'HIGH':
                            db.query("SELECT g.id,g.uid,g.mul,g.bet,g.time,g.color,u.username FROM games g LEFT JOIN users u ON u.id=g.uid WHERE (UNIX_TIMESTAMP()-g.time)>9 AND g.bet >= 25000 ORDER BY g.id DESC LIMIT 50",function(err,rows){
                                if(rows.length < 1){
                                    sendTo(ws,{type:'GamesError', data:'No games to display at the moment!'});
                                    return;
                                }
                                sendTo(ws,{type:'GamesHigh',data:rows});
                            });
                            break;
                        case 'MY':
                            db.query("SELECT g.id,g.uid,g.mul,g.bet,g.time,g.color,u.username FROM games g LEFT JOIN users u ON u.id=g.uid WHERE ((UNIX_TIMESTAMP()-g.time)>9 OR color<0) ORDER BY g.id DESC LIMIT 50",function(err,rows){
                                if(rows.length < 1){
                                    sendTo(ws,{type:'GamesError', data:'No games to display at the moment!'});
                                    return;
                                }
                                sendTo(ws,{type:'GamesMy',data:rows});
                            });
                            break;
                    }
                    break;
                case 'Stats':
                    db.query("SELECT username,steamid,avatar,balance,total_wagered,total_bets,total_losses,total_wins,total_chat FROM users WHERE id=?",[data],function(err,rows){
                        if(rows.length > 0)
                            db.query("SELECT COUNT(*) AS refs FROM users u INNER JOIN codes c ON c.id=u.redeemed WHERE c.uid=?",[data],function(err,refs){
                                rows[0]['popularity'] = refs[0].refs;
                                sendTo(ws,{type:'Stats',data:rows[0]});
                            });
                    });
                    break;
                case 'Notify':
                    db.query("SELECT id AS uid FROM users WHERE token=?",[token],function(err,rows){
                        if(rows.length > 0) {
                            db.query("SELECT value,type,isnew FROM notifications WHERE uid=? ORDER BY time DESC LIMIT 5", [rows[0].uid], function (err, rows) {
                                if(rows.length > 0)
                                    sendTo(ws, {type: 'Notify', data: rows});
                                else
                                    sendTo(ws, {type:'NotifyError', data:'You have no notifications!'});
                            });
                        }else
                            sendTo(ws, {type:'NotifyError', data:'Sign in to see notifications!'});
                    });
                    break;
                case 'NotifyCheck':
                    db.query("SELECT id AS uid FROM users WHERE token=?",[token],function(err,rows){
                        if(rows.length > 0)
                            db.query("UPDATE notifications SET isnew=0 WHERE uid=?",[rows[0].uid]);
                    });
                    break;
                case 'Redeem':
                    askRedeem(token,data,ws,'RedeemError');
                    break;
                case 'SetRef':
                    db.query("SELECT id FROM users WHERE token=?",[token],function(err,user){
                       if(user.length > 0){
                           if(/^[a-z0-9_]{3,20}$/i.test(data)){
                               db.query("SELECT value FROM settings WHERE keyname='refval'",function(err,settings) {
                                   if(settings.length < 1) return;
                                   db.query("SELECT id FROM codes WHERE code=? AND uid!=?", [data,user[0].id], function (err, rows) {
                                       if (rows.length < 1) {
                                           db.query("REPLACE INTO codes(code,value,uid) VALUES(?,?,?)", [data, settings[0].value, user[0].id]);
                                           sendTo(ws, {type: 'SetRef', data: data});
                                       }
                                       else
                                           sendTo(ws, {type: 'PlayAlert', data:'Code is taken by another member!'});
                                   });
                               });
                           }else
                               sendTo(ws, {type:'PlayAlert', data:'Invalid code or length'});
                       }
                    });
                    break;
                case 'Deposit':
                    if (!data.hasOwnProperty('trade_url') || !data.hasOwnProperty('total') ||
                        (!data.hasOwnProperty('items') || !data.hasOwnProperty('amounts') ||
                        !(data.items instanceof Array) || !(data.amounts instanceof Array))) return;
                    db.query("SELECT value FROM settings WHERE keyname='deposit_open'",function(err, is_open) {
                        if(is_open.length < 1 || !is_open[0].value){
                            sendTo(ws, {type: 'PlayAlert', data: 'Deposits are under maintenance, retry later.'});
                            return;
                        }
                        var acount = data.amounts.reduce(function (a, b) {return a + b;}, 0);
                        if (acount > 10 || acount < 1) return;
                        var total = parseInt(data.total);
                        if (isNaN(total)) return;
                        db.query("SELECT steamid,id AS uid FROM users WHERE token=?", [token], function (err, rows) {
                            if (rows.length > 0) {
                                db.query("SELECT value FROM notifications WHERE uid=? AND type=3",[rows[0].uid],function(err, offcheck) {
                                    if (offcheck.length > 0) {
                                        sendTo(ws, {
                                            type: 'PlayAlert',
                                            data: 'You already have a pending deposit of ' + offcheck[0].value + ' credits!'
                                        });
                                        return;
                                    }
                                    if (isTradeUrl(data.trade_url)) {
                                        var pool = Math.floor(Math.random()*bots.length);
                                        managers[pool].getUserInventoryContents(rows[0].steamid, 730, 2, true, function (err, inventory) {
                                            if (err) {
                                                sendTo(ws, {type: 'PlayAlert', data: 'Unexpected error happened [!]'});
                                                return;
                                            }
                                            db.query("SELECT value FROM settings WHERE keyname='min_deposit'", function (err, settings) {
                                                if (settings.length < 1) return;
                                                var ceitems = [], ctotal = 0;
                                                for (var z in inventory) {
                                                    var ky = data.items.indexOf(inventory[z].market_hash_name);
                                                    if (ky > -1 && data.amounts[ky] > 0) {
                                                        if (!inventory[z].tradable) {
                                                            sendTo(ws, {
                                                                type: 'PlayAlert',
                                                                data: inventory[z].market_hash_name + ' is not tradable'
                                                            });
                                                            return;
                                                        }
                                                        var item_price = getPrice(inventory[z].market_hash_name);
                                                        if (item_price < settings[0].value) {
                                                            sendTo(ws, {
                                                                type: 'PlayAlert',
                                                                data: 'Minimum deposit per item is ' + settings[0].value
                                                            });
                                                            return;
                                                        }
                                                        data.amounts[ky]--;
                                                        ceitems.push(inventory[z]);
                                                        ctotal += parseInt((item_price/100)*95);
                                                    }
                                                }
                                                if (ctotal != total || total == 0) {
                                                    sendTo(ws, {type:'PlayAlert', data:'Items not updated, please wait and refresh!'});
                                                    return;
                                                }
                                                var offer = managers[pool].createOffer(data.trade_url);
                                                offer.addTheirItems(ceitems);
                                                offer.setMessage("CSGOFALL - Deposit of "+ctotal);
                                                offer.send(function (err, status) {
                                                    if (err) {
                                                        console.log(err);
                                                        sendTo(ws, {
                                                            type: 'PlayAlert',
                                                            data: 'Error while sending trade try again [!]'
                                                        });
                                                        return;
                                                    }
                                                    db.query("UPDATE users SET trade_url=? WHERE id=?", [data.trade_url, rows[0].uid]);
                                                    createNotification(rows[0].uid, total, 3, offer.id, pool);
                                                    sendTo(ws, {
                                                        type: 'TradeDeposit',
                                                        data: {
                                                            alert: 'Offer #' + offer.id + ' created successfully!',
                                                            offer: offer.id
                                                        }
                                                    });
                                                    if (status == 'pending') community[pool].acceptConfirmationForObject(bots[pool][1], offer.id, function (err) {});
                                                });
                                            });
                                        });
                                    } else sendTo(ws, {type: 'PlayAlert', data: 'Invalid trade url!'});
                                });
                            } else sendTo(ws, {type: 'PlayAlert', data: 'Sign in to trade!'});
                        });
                    });
                    break;
                case 'Withdraw':
                    if (!data.hasOwnProperty('trade_url') || !data.hasOwnProperty('total') || !data.hasOwnProperty('pool') ||
                        (!data.hasOwnProperty('items') || !data.hasOwnProperty('amounts') ||
                        !(data.items instanceof Array) || !(data.amounts instanceof Array))) return;
                    db.query("SELECT value FROM settings WHERE keyname='withdraw_open'",function(err, is_open) {
                        if (is_open.length < 1 || !is_open[0].value) {
                            sendTo(ws, {type: 'PlayAlert', data: 'Withdraws are under maintenance, retry later.'});
                            return;
                        }
                        var acount = data.amounts.reduce(function (a, b) {return a + b;}, 0);
                        if (acount > 10 || acount < 1) return;
                        var total = parseInt(data.total);
                        if (isNaN(total)) return;
                        db.query("SELECT steamid,balance,limited,id AS uid FROM users WHERE token=?", [token], function (err, rows) {
                            if (rows.length > 0) {
                                if(rows[0].limited){
                                    sendTo(ws, {type: 'PlayAlert', data: 'Your account is currently limited'});
                                    return;
                                }
                                db.query("SELECT value FROM notifications WHERE uid=? AND type=1",[rows[0].uid],function(err, offcheck) {
                                    if(offcheck.length > 0){
                                        sendTo(ws, {type: 'PlayAlert', data: 'You already have a pending withdraw of '+offcheck[0].value+' credits!'});
                                        return;
                                    }
                                    if (isTradeUrl(data.trade_url)) {
                                        var pool = parseInt(data.pool); if(clients[pool] == undefined) return;
                                        managers[pool].getInventoryContents(730, 2, true, function (err, inventory) {
                                            if (err) {
                                                sendTo(ws, {type: 'PlayAlert', data: 'Unexpected error happened [!]'});
                                                return;
                                            }
                                            if (total > rows[0].balance) {
                                                sendTo(ws, {type: 'PlayAlert', data: 'Insufficient funds!'});
                                                return;
                                            }
                                            db.query("SELECT value FROM settings WHERE keyname='min_withdraw'", function (err, settings) {
                                                if (settings.length < 1) return;
                                                if (total < settings[0].value) {
                                                    sendTo(ws, {
                                                        type: 'PlayAlert',
                                                        data: 'Minimum withdraw is ' + settings[0].value
                                                    });
                                                    return;
                                                }
                                                var ceitems = [], ctotal = 0;
                                                for (var z in inventory) {
                                                    var ky = data.items.indexOf(inventory[z].market_hash_name);
                                                    if (ky > -1 && data.amounts[ky] > 0) {
                                                        if (!inventory[z].tradable) {
                                                            sendTo(ws, {
                                                                type: 'PlayAlert',
                                                                data: inventory[z].market_hash_name + ' is not tradable'
                                                            });
                                                            return;
                                                        }
                                                        var item_price = getPrice(inventory[z].market_hash_name);
                                                        data.amounts[ky]--;
                                                        ceitems.push(inventory[z]);
                                                        ctotal += parseInt((item_price/100)*105);
                                                    }
                                                }
                                                if (ctotal != total || total == 0){
                                                    sendTo(ws, {type:'PlayAlert', data:'Items not updated, please wait and refresh!'});
                                                    return;
                                                }
                                                var offer = managers[pool].createOffer(data.trade_url);
                                                offer.addMyItems(ceitems);
                                                offer.setMessage("CSGOFALL - Withdraw of "+ctotal);
                                                offer.send(function (err, status) {
                                                    if (err) {
                                                        sendTo(ws, {
                                                            type: 'PlayAlert',
                                                            data: 'Error while sending trade try again [!]'
                                                        });
                                                        return;
                                                    }
                                                    db.query("UPDATE users SET trade_url=?, balance=balance-? WHERE id=?",
                                                        [data.trade_url, total, rows[0].uid]);
                                                    createNotification(rows[0].uid, total, 1, offer.id, pool);
                                                    sendTo(ws, {
                                                        type: 'TradeWithdraw',
                                                        data: {
                                                            alert: 'Offer #' + offer.id + ' created successfully!',
                                                            subfrom: total,
                                                            offer: offer.id
                                                        }
                                                    });
													if (status == 'pending') community[pool].acceptConfirmationForObject(bots[pool][1], offer.id, function (err) {});
                                                });
                                            });
                                        });
                                    } else sendTo(ws, {type: 'PlayAlert', data: 'Invalid trade url!'});
                                });
                            } else sendTo(ws, {type: 'PlayAlert', data: 'Sign in to trade!'});
                        });
                    });
                    break;
            }
        }
    });
});

function GetItems(rg,fback,isbot){
    var items = [];
    for (var k in rg.assets) {
        var asset = rg.assets[k];
        for(var v in rg.descriptions){
            var curr = rg.descriptions[v];
            if (curr.appid == 730 && curr.classid == asset.classid && curr.instanceid == asset.instanceid) {
                var price = getPrice(curr.market_hash_name);
                if (price > 0 && curr.tradable) {
                    items.push({
                        name: curr.market_hash_name,
                        wear_type: getItemWear(curr.market_hash_name),
                        amount: rg.assets[k].amount,
                        price: parseInt(isbot?(price/100)*105:(price/100)*95),
                        image: 'https://steamcommunity-a.akamaihd.net/economy/image/' + curr.icon_url + '/256fx256f'
                    });
                }
            }
        }
    }
    fback(items);
}
function payTableToEdge(table) {
    for(var i=0;i<table.length;i++) {
        table[i] = parseFloat(parseFloat(table[i]).toFixed(1));
        if(isNaN(table[i])) table[i] = 0;
    }
    var binom = function(n, k) {
        k = Math.min(k, n - k);
        var r = 1;
        for (var i = 0; i < k; ++i)
            r = (r * (n - i)) / (i + 1);
        return r;
    };
    var possibilities = Math.pow(2, table.length - 1);
    var ev = -1;
    table.forEach(function(payout, i) {
        var x = binom(table.length - 1, i);
        var prob = x / possibilities;
        ev += prob * payout;
    });
    return -ev * 100;
}

function sendTo(ws,msg){
    if (ws.readyState === WebSocket.OPEN)
        ws.send(JSON.stringify(msg));
}
function sendAll(msg){
    wss.clients.forEach(function(client) {
        sendTo(client,msg);
    });
}
function escapeHtml(unsafe) {
    return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
function noUrls(url){
    return url.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '').replace(/\.com/g,'').replace(/\.net/g,'').replace(/\.org/g,'');
}

function listPrices(){
    request('https://api.csgofast.com/price/all',function(err,resp,body){
		prices = body;
    });
    setTimeout(listPrices,60000*120);
}
function getPrice(market_hash_name){
    var vp = prices.split('"'+market_hash_name+'":');
    if(vp.length > 1)
        return parseInt(parseFloat(vp[1].split(',')[0])*1000);
    return 0;
}
function getItemWear(item){
    var x = item.split('(');
    if(x.length > 1){
        x = x[1].split(')');
        if(x.length > 1)
            return x[0];
    }
    return 'Asset/Case';
}
function isTradeUrl(url){
    return /http(?:s):\/\/steamcommunity.com\/tradeoffer\/new\/\?partner=([0-9]+)&token=([a-zA-Z0-9-_]+)/.test(url);
}

function createNotification(uid,value,type,offer,bot){ //type => 0:Withdraw 1:Pending Withdraw 2:Deposit 3:Pending Deposit
    db.query("INSERT INTO notifications(uid,value,type,isnew,time,offer,bot) VALUES(?,?,?,1,UNIX_TIMESTAMP(),?,?)",[uid,value,type,offer,bot]);
    if(type == 0 || type == 2)
        db.query("DELETE FROM notifications WHERE offer=? AND type=?",[offer,type<1?1:3]);
}
function success_deposit(offer,uid,total,bot){
    db.query("UPDATE users SET balance=balance+? WHERE id=?",[total,uid]);
    createNotification(uid, total, 2, offer, bot);
}
function success_withdraw(offer,uid,total,bot){
    createNotification(uid, total, 0, offer, bot);
}
function deleteOffer(id){
    db.query("DELETE FROM notifications WHERE offer=?", [id]);
}
function cancelOffer(offer){
    db.query("SELECT uid,value,type FROM notifications WHERE offer=? AND (type=3 OR type=1)", [offer.id], function (err, rows) {
        if (rows.length > 0) {
            deleteOffer(offer.id);
            db.query("INSERT INTO poll_trades(json) VALUES(?)",[JSON.stringify({type: 'OfferDeclined', data: {offer:offer.id}})]);
        }
    });
}

var crypto = require('crypto');
function getSHA1(data){
    return crypto.createHash('sha1').update(data).digest('hex');
}
function getToken(){
    return getSHA1(crypto.randomBytes(64).toString('hex'));
}
function askRedeem(token,data,ws,alert){
    db.query("SELECT redeemed,id,steamid FROM users WHERE token=?",[token],function(err,rows){
        if(rows.length > 0){
            if(rows[0].redeemed < 1){
                db.query("SELECT value FROM settings WHERE keyname='codes_open'",function(err,is_open) {
                    if(is_open[0].value) {
                        if(cacheredeem[rows[0].steamid] == undefined) cacheredeem[rows[0].steamid] = 0;
                        if(cacheredeem[rows[0].steamid]>3){
                            sendTo(ws, {type:alert,data:'Retry later.'});
                            return;
                        }
                        db.query("SELECT value,id FROM codes WHERE code=? AND uid!=?", [data, rows[0].id], function (err, code) {
                            if (code.length < 1) {
                                sendTo(ws, {type: alert, data: 'Invalid code'});
                                return;
                            }
                            db.query("UPDATE users SET balance=balance+?, redeemed=? WHERE id=?", [code[0].value, code[0].id, rows[0].id]);
                            db.query("UPDATE codes SET claimed=claimed+1 WHERE id=?", [code[0].id]);
                            sendTo(ws, {type: (alert=='PlayAlert'?alert:'RedeemSuccess'), data: code[0].value});
                        });
                    }else
                        sendTo(ws, {type:alert,data:'Codes are disabled'});
                });
            }else
                sendTo(ws, {type:alert,data:'You claimed already'});
        }else
            sendTo(ws, {type:alert,data:'Not logged in'});
    });
}

setInterval(function(){
	db.query("SELECT json,id FROM poll_trades ORDER BY id ASC",function(err,rows){
		for(var k in rows){
			sendAll(JSON.parse(rows[k].json));
			db.query("DELETE FROM poll_trades WHERE id=?",[rows[k].id]);
		}
	});
},1000);
setInterval(function(){
    cacheredeem = {};
},60000*2);
listPrices();

var SteamUser = require('steam-user');
var SteamCommunity = require('steamcommunity');
var SteamTotp = require('steam-totp');
var TradeOfferManager = require('steam-tradeoffer-manager');

var clients = [];
var managers = [];
var community = [];

var bots = [
    [{"accountName": "username", "password": "password", "twoFactorCode": SteamTotp.getAuthCode("SECRET")}, "IDENTITY"],
];

var funcs = [];
for(var y=0; y<bots.length; y++) {
    funcs[y] = (function(i) {
        return function () {
            clients[i] = new SteamUser();
            managers[i] = new TradeOfferManager({language: "en", cancelTime: 1000*60*7});
            community[i] = new SteamCommunity();

            clients[i].logOn(bots[i][0]);
            clients[i].on('loggedOn', function () {console.log("Logged into Steam #" + i);});
            clients[i].on('webSession', function (sessionID, cookies) {
                managers[i].setCookies(cookies, function (err) {
                    console.log("Got API key: " + managers[i].apiKey);
                });
                community[i].setCookies(cookies);
                updateCacheBots(i);
                setInterval(updateCacheBots,20000,i);
            });
            managers[i].on('unknownOfferSent', function(offer){
                offer.cancel();
            });
			managers[i].on('sentOfferChanged', function(offer, oldState) {
				console.log("Offer: "+offer.id+" - State: "+TradeOfferManager.ETradeOfferState[offer.state]);
				if(offer.state == TradeOfferManager.ETradeOfferState.Accepted){
					db.query("SELECT * FROM notifications WHERE offer=?",[offer.id],function(err,nrows){
						var data = nrows[0];
						if(data.type == 3 || data.type == 1){
							if(data.type == 3)
								db.query("UPDATE users SET balance=balance+? WHERE id=?",[data.value,data.uid]);
							db.query("INSERT INTO poll_trades(json) VALUES(?)",[JSON.stringify({type: 'OfferComplete', data:{offer: offer.id, total: data.value, type: data.type}})]);
							db.query("UPDATE notifications SET type=? WHERE offer=?",[data.type-1,offer.id]);
						}
					});
				}
				else if(offer.state != TradeOfferManager.ETradeOfferState.Active && offer.state != TradeOfferManager.ETradeOfferState.CreatedNeedsConfirmation && offer.state != TradeOfferManager.ETradeOfferState.InEscrow){
					db.query("DELETE FROM notifications WHERE offer=?",[offer.id]);
					db.query("INSERT INTO poll_trades(json) VALUES(?)",[JSON.stringify({type: 'OfferDeclined', data:{offer: offer.id}})]);
				}
			});
			if (fs.existsSync('/var/www/server/polldata'+i+'.json'))
				managers[i].pollData = JSON.parse(fs.readFileSync('/var/www/server/polldata'+i+'.json'));
			managers[i].on('pollData', function(pollData) {
				fs.writeFile('/var/www/server/polldata'+i+'.json', JSON.stringify(pollData), function() {});
			});
        }
    }(y));
}
for (var j = 0; j < bots.length; j++) funcs[j]();
process.on('uncaughtException', function (err) { fs.writeFile('/var/www/server/errors'+port+'.txt',err.stack+"\n"); }); //!

function updateCacheBots(pool){
    var steamID = clients[pool].steamID.getSteamID64();
    request({url:'https://steamcommunity.com/inventory/' + steamID + '/730/2?l=english', headers:{
        "Referer": "https://steamcommunity.com/profiles/" + steamID + "/inventory"}}, function (err, resp, body) {
        try {
            var rg = JSON.parse(body);
            if (!err && resp.statusCode == 200 && rg.hasOwnProperty('descriptions')) {
                GetItems(rg, function (items) {
                    if (items.length > 0)
                        db.query("REPLACE INTO poll_bots(id,json) VALUES(?,?)",[pool,JSON.stringify({type: 'BotInventory', data: [items]})]);
                }, true);
            }
        }catch(e){
            db.query("REPLACE INTO poll_bots(id,json) VALUES(?,?)",[pool,JSON.stringify({type: 'BotInventoryError', data: 'The server was unable to load items.'})]);
        }
    });
}
