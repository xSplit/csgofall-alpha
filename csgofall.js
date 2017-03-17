function error1(msg){
    $('#error-chat').html(msg);
}
var er2t;
function openAlert2(msg){
    var isnw = er2t == null;
    closeAlert2();
    setTimeout(function(){
        $('.notification__body').html(msg);
        $('.notification').addClass('is-shown');
        er2t = setTimeout(closeAlert2,5000);},isnw?0:500);
}
function closeAlert2(){
    clearTimeout(er2t); er2t = null;
    $('.notification').removeClass('is-shown');
}
function error3(msg,wd){
    $('.secondary-item-container').eq(wd).html('<span style="color:#E23E3E;">'+msg+'</span>');
}

/* Server */

var server, down, f=false, wx = Math.floor(Math.random()*60+1);

wx = 1;

function connectws(){
    down = false;
    server = new WebSocket('ws://185.62.189.131:8082');
    server.onopen = function(){
        if(!f){ sendMsg('Join',''); sendMsg('Games','LIVE'); f=true;}
        if(localStorage.getItem('token'))
            sendMsg('Login','');
        $('#error-chat').html('');
    };
    server.onmessage = function (e) {
        var msg = JSON.parse(e.data);
        console.log(msg);
        handleMsg(msg.type,msg.data);
    };
    server.onclose = server.onerror = function(){
        error1('Connection lost');
        down = true;
        resetAuto();
    };
}
connectws();
setInterval(function(){ if(down) connectws(); },2000);
setInterval(function(){ sendMsg('ping','x'); }, 60000*9);

var botscount = 0;
function handleMsg(type,data){
    switch(type){
        case 'BotsCount':
            botscount = data; setPool(0);
			$("#preloader").css("display", "none");
            break;
        case 'Logged':
            if(localStorage.getItem('referral')) sendMsg('Redeem',localStorage.getItem('referral'));
            updateBalance(data.balance);
            updateTotalWagered(data.total_wagered);
            $('#codeAff').prev().html('(Your referrals will receive '+(data.value!=null?data.value:50)+' credits for once)');
            if(data.code != null) updateRefCode(data.code);
            $('.tradeUrl').val(data.trade_url);
            $('.url-btn').attr('data-url','http://steamcommunity.com/profiles/'+data.steamid+'/tradeoffers/privacy#trade_offer_access_url');
            sendMsg('Notify',''); sendMsg('Series','');
            break;
        case 'Online':
            updateOnline(data);
            break;
        case 'ChatCache':
            /*for(var i=0;i<data.length;i++)
                addChat(JSON.parse(data[i].message));
            setTimeout(function(){$('#chat-body-mob').scrollTop(34743839554);},100);*/
            break;
        case 'Chat':
            addChat(data);
            break;
        case 'ChatError':
            error1(data);
            setTimeout(function(){error1('');},5000);
            break;
        case 'Inventory':
            $('.secondary-item-container').eq(0).html('');
            for (var i = 0; i < data.length; i++)
                addItem(i, data[i]);
            localStorage.setItem('items', JSON.stringify(data));
            break;
        case 'BotInventory':
            $('.secondary-item-container').eq(1).html('');
            for (var i = 0; i < data[0].length; i++)
                addItem(i, data[0][i]);
            break;
        case 'InventoryError':
            error3(data,0);
            break;
        case 'BotInventoryError':
            error3(data,1);
            break;
        case 'Play':
            if(data.coin < 3)
                playSerie(data.id,data.coin,data.serie);
            else
                sendMsg('Game', data.id);
            break;
        case 'PlayError':
            updateBalance(old_balance);
            resetAuto();
            openAlert2(data);
            break;
        case 'PlayAlert':
            resetAuto();
            openAlert2(data);
            updateTrade();
            break;
        case 'Game':
            data = parseInt(data); if(data<1) return;
            updateBalance(getBalance()+data);
            updateTotalWagered(new BigNumber($('#wagered-tally').html().replace(/,/g,'')).plus(data).toString());
            if(goanim) {
                $('#balance').animate({color:'lime'},500).animate({color:'white'},{duration:500,complete: function(){ goanim=true; }});
                $('#wagered-tally').animate({color:'lime'},500).animate({color:'white'},500);
                goanim = false;
            }
            break;
        case 'Game2':
            data = parseInt(data);
            var bsi = -1;
            if(data >= 0) {
                bsi = 1;
                setTimeout(function() {
                    updateTotalWagered(new BigNumber($('#wagered-tally').html().replace(/,/g, '')).plus(data).toString());
                    $('#balance').animate({color: 'lime'}, 500).animate({color: 'white'}, {duration: 500});
                    $('#wagered-tally').animate({color: 'lime'}, 500).animate({color: 'white'}, 500);
                },500);
            }else{
                bsi = 0;
                setTimeout(function() { $('#balance').animate({color:'red'},500).animate({color:'white'},{duration:500}); }, 500);
            }
            if(autodice) {
                if(base_bet != null) setTimeout(function(){
                    if(autodice) {
                        if(bsi > -1) {
                            if (bs[bsi]) {
                                var wag = parseInt($('#wager-amt2').val());
                                $('#wager-amt2').val(wag + parseInt((wag / 100) * parseFloat($('.percentageIncrease').eq(bsi).val())));
                            }
                            else if(base_bet != null)
                                $('#wager-amt2').val(base_bet);
                        }
                        playBet2(true);
                    }
                },1500);
            }
            setTimeout(function(){ updateBalance(getBalance() + data); },500);
            break;
        case 'GamesLive':
        appendGames(asTable('#live'),data);
		break;
        case 'GamesHigh':
        appendGames(asTable('#high'),data);
		break;
        case 'GamesMy':
		appendGames(asTable('#myBets'),data);
		break;
        case 'GamesLastHigh':
		renderAppendGames(asTable('#high'),data);
		break;
        case 'GamesLastLive':
		renderAppendGames(asTable('#live'),data);
		break;
        case 'GamesError':
            $(curr_table).find('thead').html('<div class="text-center"><span style="color:white;">'+data+'</span></div>');
            break;
        case 'Notify':
            loadNotifications(data);
            break;
        case 'NotifyError':
            $('.notifications-cont').html('<span style="color:white;margin:10px;text-align:center;">'+data+'</span>');
            break;
        case 'HashModal':
            showHash(data.server_seed,data.public_hash);
            break;
        case 'TradeDeposit':
            localStorage.setItem('deposit_offer',data.offer);
            openAlert2(data.alert);
            updateTrade();
            window.open('https://steamcommunity.com/tradeoffer/' + data.offer + '/', "Deposit Confirmation", 'height=1120,width=1028,resize=yes,scrollbars=yes');
            break;
        case 'TradeWithdraw':
            localStorage.setItem('withdraw_offer',data.offer);
            openAlert2(data.alert);
            updateBalance(getBalance()-data.subfrom);
            updateTrade();
            window.open('https://steamcommunity.com/tradeoffer/' + data.offer + '/', "Withdraw Confirmation", 'height=1120,width=1028,resize=yes,scrollbars=yes');
            break;
        case 'SetRef':
            updateRefCode(data);
            break;
        case 'RedeemSuccess':
            if(localStorage.getItem('referral'))
                localStorage.removeItem('referral');
            else
                $('#redeem-code-log').css({color: 'lime'}).html('Redeemed ' + data + ' credits');
            updateBalance(getBalance() + data);
            break;
        case 'RedeemError':
            if(localStorage.getItem('referral'))
                localStorage.removeItem('referral');
            else
                $('#redeem-code-log').css({color: '#E34747'}).html(data);
            break;
        case 'OfferComplete':
            if(data.type == 1 && data.offer == localStorage.getItem('withdraw_offer')){
                sendMsg('Notify','');
                if(last_container.hasClass('withdraw-container')) {
                    showContainer('.deposit-container');
                    loadInventory();
                }
            }else if(data.type == 3 && data.offer == localStorage.getItem('deposit_offer')) {
                openAlert2('Deposit of ' + data.total + ' credits confirmed!');
                updateBalance(getBalance()+data.total);
                sendMsg('Notify','');
                if(!last_container.hasClass('withdraw-container')) loadInventory();
            }
            break;
        case 'OfferDeclined':
            if(data.offer == localStorage.getItem('withdraw_offer') || data.offer == localStorage.getItem('deposit_offer'))
                sendMsg('Notify','');
            break;
        case 'Stats':
            $('#publicProfileModal').find('.modal-title').html('<a href="http://steamcommunity.com/profiles/'+data.steamid+'/"><img src="'+data.avatar+'">'+data.username+'</a>');
            $('#stats_total_chat').html(numberWithCommas(data.total_chat));
            $('#stats_total_wagered').html(numberWithCommas(data.total_wagered));
            $('#profile_balance').html(numberWithCommas(data.balance));
            $('#stats_total_bets').html(numberWithCommas(data.total_bets));
            $('#stats_total_wins').html(numberWithCommas(data.total_wins));
            $('#stats_total_losses').html(numberWithCommas(data.total_losses));
            var luck = parseInt(data.total_wins/(data.total_wins+data.total_losses)/0.01);
            $('#stats_luck').html((isNaN(luck)?0:luck)+'%');
            $('#popularity').html(data.popularity);
            $('#publicProfileModal').modal('show');
            break;
        case 'Series':
            for(var x=0;x<3;x++){
                var div = $('.plinko-multipliers').eq(x), div2 = $('.payoutsBlocks').eq(x);
                div.html('');
                for(var j=0;j<17;j++){
                    div.append(mulh(j,data[x][j]));
                    div2.find('input').eq(j).val(data[x][j]);
                }
                var edge = payTableToEdge(data[x]);
                div2.parent().find('strong').html(edgeFixed(edge)+'%');
            }
            break;
    }
}

function sendMsg(type,data){
    server.send(JSON.stringify({type:type,data:data,token:localStorage.getItem('token')}));
}

/* Client */

function updateBalance(balance){
    $('#balance').html(numberWithCommas(balance));
}
function updateTotalWagered(total){
    $('#wagered-tally').html(numberWithCommas(total));
}
function updateOnline(online){
    $('#users_online').html('Online: '+online);
}
function updateRefCode(code){
    $('.urlAff').val('https://csgofall.com/?r='+(code.length>0?code:'{code}'));
    $('#codeAff').val(code);
}
function addChat(data){
    $('#chat-body-mob').append('<div class="chat-title-message">'+
        '<div id="avatar-part-left">'+
        '<img src="'+data.avatar+'" class="avatar" style="cursor:pointer;" onclick="askStats('+data.uid+');">'+
        '</div>'+
        '<div id="right-part-message"><h4 class="" style="display:inline-block;cursor:pointer;" onclick="askStats('+data.uid+');"> <span class="username">'+data.username+
        '</span>'+(data.icon.length>1?'<img class="userClass '+data.icon+'" src="img/chat/'+data.icon+'.png">':'')+'</h4><p class="message" style="color: #C3C3C3;">'+data.chat+'</p>'+
    '</div>'+
    '</div>');
    var cc = $('.chat-title-message');
    if(cc.length > 50)
        cc.eq(0).remove();
    $('#chat-body-mob').scrollTop(34743839554);
}
function sendChat(){
    sendMsg('Chat',$('#chat').val());
    error1('');
    $('#chat').val('');
}
var last_container = $('.plinko-external');
function showContainer(name){
    $('#header-nav').find('a').removeClass('menuActive');
    $('#header-nav').find('a[onclick*="'+name+'"]').addClass('menuActive');
    if(name != '.externalDiceContain') resetAuto();
    last_container.hide();
    last_container = $(name);
    last_container.show();
}
function updateNumNotifications(data){
    $('#header-nav').find('a').eq(4).html(data);
}
function showNotifications(){
    $('.notifications-cont').fadeToggle();
    sendMsg('NotifyCheck','');
    updateNumNotifications('Notifications');
}
function loadNotifications(data){
    var ncount = 0, types = [['Withdrawal Successful','positiveWithdrawal','+'], ['Pending Withdrawal','pendingDepOrWith','~'],
        ['Deposit Successful','positiveDeposit','+'], ['Pending Deposit','pendingDepOrWith','~']];
    $('.notifications-cont').html('');
    for(var i=0;i<data.length;i++){
        var value = numberWithCommas(data[i].value), type = types[data[i].type];
        $('.notifications-cont').append('<div class="noti-sub-container">'+
            '<h5>'+type[0]+'</h5>'+
        '<p class="'+type[1]+'">'+type[2].replace('~','<i class="fa fa-refresh fa-spin fa-3x fa-fw"></i>')+' '+value+'</p>'+
        '</div>');
        if(data[i].isnew) ncount++;
    }
    if(ncount > 0)
        updateNumNotifications('Notifications <span class="amt-notifs">'+ncount+'</span>');
    else
        updateNumNotifications('Notifications');
}
function changeRef(){
    sendMsg('SetRef',$('#codeAff').val());
}
var rds;
function redeemCode(){
    clearTimeout(rds);
    rds = setTimeout(function() {
        var inp = $('#redeem-code').val();
        $('#redeem-code-log').css({color: 'white'}).html(inp.length > 0 ? '...' : 'Insert Code');
        if (inp.length > 0) sendMsg('Redeem', inp);
    },500);
}
function askStats(id){
    sendMsg('Stats',id);
}
$('.payoutsBlocks input').keyup(function(){
    if($(this).val().length > 3) $(this).val($(this).val().substr(0,3));
    $(this).val($(this).val().replace(/[^0-9.]/g,''));
    var div = $(this).parent();
    var pos = $('.payoutsBlocks').index(div);
    var serie = [];
    for (var i = 0; i < 17; i++)
        serie.push(div.find('input').eq(i).val());
    var edge = payTableToEdge(serie);
    div.parent().find('strong').css({color:edge<0.99?'#E23E3E':'#707b84'}).html(edgeFixed(edge)+'%');
    if(edge>=0.99) {
        sendMsg('NewSerie', {serie: serie, pos: pos});
        div = $('.plinko-multipliers').eq(pos);
        div.html('');
        for(var j=0;j<17;j++)
            div.append(mulh(j,serie[j]));
    }
});

/* Deposit & Withdraw */

function searchItem(val){
    $('.own-inventory-item').each(function(i){
        var item = $('.own-inventory-item').eq(i);
        if(item.html().toLowerCase().indexOf(val.toLowerCase()) < 0 && val.length > 0)
            item.hide();
        else
            item.show();
    });
}
function cacheInventory(){
    wd_index = 0; updateCalc(true);
    trade_items = [], ids = [], price = 0;
    var items = localStorage.getItem('items');
    if(items) {
        items = JSON.parse(items);
        $('.secondary-item-container').eq(0).html('');
        for (var i = 0; i < items.length; i++)
            addItem(i,items[i]);
    }else loadInventory();
}
function loadInventory(){
	$('.searchItems').val('');
    wd_index = 0; updateCalc(true);
    $('.secondary-item-container').eq(0).html('<span style="color:white;">Loading...</span>');
    sendMsg('Inventory','');
}
function loadBotInventory(){
	$('.searchItems').val('');
    wd_index = 1; updateCalc(true);
    $('.secondary-item-container').eq(1).html('<span style="color:white;">Loading...</span>');
    sendMsg('BotInventory',wpool);
}
function addItem(id,item){
    for(var i=0;i<item.amount;i++) {
        $('.secondary-item-container').eq(wd_index).append('<div class="own-inventory-item">' +
            '<div class="inv-item-head">' +
            '<h4>' + item.name + ' <span class="inspect-ingame"><i class="fa fa-eye" aria-hidden="true"></i></span></h4>' +
            '<small>' + item.wear_type + '</small>' +
            '</div>' +
            '<div class="inv-item-body">' +
            '<img class="inv-item-img" src="' + item.image + '">' +
            '</div>' +
            '<div class="inv-item-foot">' +
            '<button onclick="selectItem(\'' + item.name + '\',' + item.price + ',' + id +
            ')"><i class="fa fa-diamond" style="margin-right:5px;" aria-hidden="true"></i> ' + numberWithCommas(item.price) + '</button>' +
            '</div>' +
            '</div>');
    }
}
var trade_items = [], amounts = [], ids = [], price = 0, wd_index = 0;
function selectItem(item,item_price,id){
    if(ids.indexOf(id) < 0) {
        if(amounts.reduce(function(a,b){return a+b;},0) == 10){
            openAlert2('You can\'t select more than 10 items per offer!');
            return;
        }
        ids.push(id);
        if(trade_items.indexOf(item) > -1)
            amounts[trade_items.indexOf(item)]++;
        else{
            trade_items.push(item);
            amounts.push(1);
        }
        price += item_price;
        $('.secondary-item-container').eq(wd_index).find('.own-inventory-item').eq(id).addClass('selected');
    }else{
        ids.splice(ids.indexOf(id),1);
        trade_items.splice(trade_items.indexOf(item),1);
        amounts.splice(trade_items.indexOf(item),1);
        price -= item_price;
        $('.secondary-item-container').eq(wd_index).find('.own-inventory-item').eq(id).removeClass('selected');
    }
    updateCalc(false);
}
function botChanged(){
    setPool($('#botSelect').val());
    loadBotInventory();
}
function botSelection(){
    if(last_container.hasClass('withdraw-container')){
        var sel = " <select id='botSelect' onchange='botChanged()'>";
        for(var i=0;i<botscount;i++)
            sel += "<option value='"+i+"'"+(wpool==i?" selected":"")+">Bot "+(i+1)+"</option>";
        sel +="</select>";
        return sel;
    }
    return "";
}
function updateCalc(up){
    if(up) trade_items = [], amounts = [], ids = [], price = 0;
    var tc = $('.total-cost-calc-section').eq(wd_index);
    tc.find('strong').eq(0).html(ids.length+' Selected'+botSelection());
    tc.find('span').eq(0).html((wd_index>0?'It will cost':'You\'ll receive')
        +' <i class="fa fa-diamond" style="margin-right:5px;" aria-hidden="true"></i> '+numberWithCommas(price));
}
var wpool = null; function setPool(w){ wpool = w; }
function sendTrade(type){
    if(trade_items.length > 0) {
        sendMsg(type > 0 ? 'Withdraw' : 'Deposit', {
            items: trade_items,
            amounts: amounts,
            total: price,
            trade_url: $('.tradeUrl').eq(type).val(),
            pool: wpool
        });
        $('.send-trade').eq(type > 0 ? 3 : 0).attr('disabled', 'disabled').html('Loading');
    }else
        openAlert2('No items selected');
}
function updateTrade(){
    rsoffer($('.send-trade').eq(0));
    rsoffer($('.send-trade').eq(3));
    sendMsg('Notify', '');
}
function rsoffer(button){
    button.removeAttr('disabled').html('Send Offer');
}

/* Game */

var goanim = true, last_click = new Date(), old_balance;
function playBet(coin){
    if(!localStorage.getItem('token')){ openAlert2('Sign in with Steam to play!'); return; }
    var bet = parseInt($('#wager-amt').val()), balance = getBalance();
    if(!isNaN(bet) && bet <= balance) {
        if($('.notification__body').html().indexOf('too fast') < 0) closeAlert2();
        sendMsg('Play',{coin:coin,amount:bet});
        old_balance = balance;
        updateBalance(balance-bet);
        if(goanim) $('#balance').animate({color:'red'},500).animate({color:'white'},{duration:500,complete: function(){ goanim=true; }});
        goanim=false;
    }else openAlert2(isNaN(bet)?'Invalid amount value must be a number!':'Your bet is higher than your available balance!');
}
function playSerie(id,coin,serie){
    last_click = new Date();
    var img = ['yellow','green','red'], plus = [32,57,82];
    img = $('<img src="img/coins/'+img[coin]+'.png" style="position:absolute;left:242px;top:-4px;">');
    $('#plinko-container').append(img);
    var angle = 0, top = parseInt(img.css('top')), left = parseInt(img.css('left'));
    for(var i=0;i<serie.length;i++)
    {
        angle += 90; //!
        top += 20; left += serie[i]>0?15:-15;
        setTimeout(rotateAnim, 600*i, [angle,serie[i],img,top,left]);
        if(i==serie.length-1){
            setTimeout(function(){
                img.animate({top: (parseInt(img.css('top')) + plus[coin]) + 'px', opacity: 0.8}, 1000);
                img.rotate({angle: 0, animateTo: 720, duration: 1000});
                img.animate({opacity: 0, width: 30, height: 30, left: (parseInt(img.css('left')) - 5) + 'px'}, 300);
                setTimeout(function(){
                    img.remove();
                    sendMsg('Game', id);
                    $('a[href="#myBets"]').click();
                },1300);
            }, 600*i + 400, img);
        }
    }
}
function rotateAnim(ang) {
    var img = ang[2], newd = {top:ang[3]+'px',left:ang[4]+'px'};
    if(!document.hidden){
        img.rotate({animateTo:ang[0], duration:500});
        img.animate(newd,500);
    }else {
        img.rotate({angle:ang[0]});
        img.css(newd);
    }
}
function setWager(b){
    var val = parseInt($('#wager-amt').val());
    switch(b){
        case 0:
            if(localStorage.getItem('token')) $('#wager-amt').val(getBalance());
            break;
        case 1:
            if(!isNaN(val)) $('#wager-amt').val(Math.floor(val*2));
            break;
        case 2:
            if(!isNaN(val)) $('#wager-amt').val(Math.floor(val/2));
            break;
    }
}

/* Game 2 */

var rolltype = 1, minroll = 0.01, maxroll = 98; //1:lower 0:over
$('#wager-amt2').keyup(updateProfitWin);
$('.optionText').eq(0).change(updateFromPayout);
$('.optionText').eq(1).change(function() {
    var chance = parseFloat($('.optionText').eq(1).val()); if(isNaN(chance)) chance = 49.50;
    var payout = 99/chance;
    if(payout<1.01) payout = 1.01; if(payout>9900) payout = 9900;
    var v = rolltype?99*(1/payout):99.99-99*(1/payout);
    if(v<minroll) v = minroll; if(v>maxroll) v = maxroll;
    $('proll').html(v.toFixed(2));
    $('.optionText').eq(0).val(payout.toFixed(3));
    var ch = 99/payout;
    if(ch<0.01) ch = 0.01; if(ch>98) ch = 98;
    $('.optionText').eq(1).val(ch.toFixed(2));
    updateProfitWin();
});
$('.rollOverUnder').eq(0).click(rollChange);
function rollChange(){
    rolltype = !rolltype;
    minroll = rolltype?0.01:1.99; maxroll = rolltype?98:99.98;
    $('.manualSecOne').html($('.manualSecOne').html().replace(rolltype?'OVER':'UNDER',rolltype?'UNDER':'OVER'));
    $('.rollOverUnder').eq(0).click(rollChange);
    updateFromPayout();
}
function updateFromPayout(){
    var payout = parseFloat($('.optionText').eq(0).val()); if(isNaN(payout)) payout = 2;
    if(payout<1.01) payout = 1.01; if(payout>9900) payout = 9900;
    var v = rolltype?99*(1/payout):99.99-99*(1/payout);
    if(v<minroll) v = minroll; if(v>maxroll) v = maxroll;
    $('proll').html(v.toFixed(2));
    $('.optionText').eq(0).val(payout.toFixed(3));
    var ch = 99/payout;
    if(ch<0.01) ch = 0.01; if(ch>98) ch = 98;
    $('.optionText').eq(1).val(ch.toFixed(2));
    updateProfitWin();
}
function updateProfitWin(){
    $('#profitwin').val($('#wager-amt2').val().length > 0 ? parseInt(parseFloat($('.optionText').eq(0).val()) * parseInt($('#wager-amt2').val())) : 0)
}
function setWager2(b){
    var val = parseInt($('#wager-amt2').val());
    switch(b){
        case 0:
            if(localStorage.getItem('token')) $('#wager-amt2').val(getBalance());
            break;
        case 1:
            if(!isNaN(val)) $('#wager-amt2').val(Math.floor(val*2));
            break;
        case 2:
            if(!isNaN(val)) $('#wager-amt2').val(Math.floor(val/2));
            break;
    }
    updateProfitWin();
}
function playBet2(a){
    if($('.autoDiceSubBottomSection').is(":visible") && !a) autodice = true;
    if(!localStorage.getItem('token')){ openAlert2('Sign in with Steam to play!'); return; }
    var bet = parseInt($('#wager-amt2').val()), balance = getBalance();
    if(!isNaN(bet) && bet <= balance) {
        if(base_bet == null && !a && autodice)
            base_bet = bet;
        else if(!a && autodice && base_bet != null) {
            resetAuto();
            return;
        }
        $('.manualDiceBottomSection').addClass('gifAnimation').find('a').html('<img src="img/playing.gif">');
        setTimeout(function(){
            $('.manualDiceBottomSection').removeClass('gifAnimation').find('a').html(autodice?'Stop Dice':'Roll Dice');
            $('a[href="#myBets"]').click();
        },1000);
        if($('.notification__body').html().indexOf('too fast') < 0) closeAlert2();
        sendMsg('Play',{coin:3,amount:bet,over:$('.manualSecOne').html().indexOf('OVER')>-1,proll:$('proll').html()});
        old_balance = balance;
    }else{
        openAlert2(isNaN(bet) ? 'Invalid amount value must be a number!' : 'Your bet is higher than your available balance!');
        resetAuto();
    }
}
function resetAuto(){
    autodice = false;
    $('.manualDiceBottomSection').removeClass('gifAnimation').find('a').html('Roll Dice');
    base_bet = null;
}
$('.percentageIncrease').change(function(){
    if(isNaN(parseFloat($(this).val())))
        $(this).val('0%');
    else
        $(this).val($(this).val().replace('%','')+'%');
});
var autodice = false, base_bet = null;
function showAutoDice(){
    autodice = true;
    $('.autoDiceSubBottomSection').show();
    var li = $('.externalDiceContain').find('li');
    li.eq(0).removeClass('active');
    li.eq(1).addClass('active');
}
function hideAutoDice(){
    resetAuto();
    $('.autoDiceSubBottomSection').hide();
    var li = $('.externalDiceContain').find('li');
    li.eq(0).addClass('active');
    li.eq(1).removeClass('active');
}
var bs = [0,0];
function bsclick(i){
    bs[i] = 0;
    var btn = $('.btnsCont').eq(i);
    btn.find('button').eq(0).addClass('selectedOn');
    btn.find('button').eq(1).removeClass('selectedOn');
    var ip = btn.parent().find('.percentageIncrease');
    ip.attr('disabled','disabled');
    ip.css({color:'#868d9b'});
}
function inclick(i){
    bs[i] = 1;
    var btn = $('.btnsCont').eq(i);
    btn.find('button').eq(0).removeClass('selectedOn');
    btn.find('button').eq(1).addClass('selectedOn');
    var ip = btn.parent().find('.percentageIncrease');
    ip.removeAttr('disabled');
    ip.css({color:'#ffffff'});
}

/* Tables */

var curr_table = '#live', last_bet = null;
function renderAppendGames(trs,data){
    if (trs.find('tr').length > 49)
        trs.find('tr').last().remove();
    var hsave = trs.html();
    appendGames(trs, data);
    var nhtml = trs.html();
    if (last_bet == null && curr_table != '#myBets')
        trs.html('');
    if (nhtml == last_bet)
        trs.html('');
    else
        last_bet = nhtml;
    trs.append(hsave);
}
function appendGames(table,rows){
    table.parent().find('thead').html('<tr class="differentCol">'+
        '<th>ID</th>'+
        '<th>User</th>'+
        '<th>Time</th>'+
        '<th>Bet</th>'+
        '<th>Multiplier</th>'+
        '<th>Roll</th>'+
        '<th>Profit</th>'+
        '</tr>');
    table.html('');
    for(var i=0;i<rows.length;i++)
        addRow(table,rows[i]);
}
function addRow(table,game){
    var img = ['yellow','green','red','dice'];
    var date = new Date(parseInt(game.time) * 1000);
    game.bet = parseInt(game.bet);
    var profit = parseInt(parseFloat(game.mul)*game.bet)-game.bet;
    table.append('<tr><td class="betID"><a href="#" onclick="event.preventDefault();sendMsg(\'HashSee\','+game.id+');">'+game.id+'</a></td>'+
        '<td><a href="#" onclick="event.preventDefault();askStats('+game.uid+');">'+game.username+'</a></td>'+
        '<td>'+min2zeros(date.getHours())+':'+min2zeros(date.getMinutes())+':'+min2zeros(date.getSeconds())+'</td>'+
        '<td>'+numberWithCommas(game.bet)+'</td>'+
        '<td>x'+game.mul+'</td>'+
        '<td>'+(game.color<0?(-(game.color)-1).toFixed(2):'')+' <img src="img/coins/'+img[game.color<0?3:game.color]
        +'.png" class="'+(game.color<0?'rollDice':'rollCoin')+'"></td>'+
        '<td class="'+(profit>=0?"positiveOut":"negativeOut")+'">'+(profit>=0?"+":"-")+numberWithCommas(Math.abs(profit))+'</td></tr>');
}
function asTable(table){
    return $(table).find('table').find('tbody');
}
function showHash(server_seed,public_hash){
    var modal = $('#betHashModal');
    modal.find('.hash-info').eq(0).find('p').html(server_seed);
    modal.find('.hash-info').eq(1).find('p').html(public_hash);
    modal.modal('show');
}
function hashTest(){
    var modal = $('#verificationHashModal').find('.hash-info');
    var server_seed = modal.eq(0).find('input').val();
    var betval = modal.eq(1).find('input').val();
    modal.eq(2).find('input').val(sha1(server_seed + sha1(betval)));
}

/* Utils */

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
function getBalance(){
    return parseInt($('#balance').html().replace(/,/g,''));
}
function min2zeros(n){
    if(n.toString().length<2)
        return '0'+n;
    return n;
}
function edgeFixed(edge){
    edge = edge.toString();
    return edge.indexOf('.') > -1 ? edge.split('.')[0]+'.'+edge.split('.')[1].substr(0,2) : edge;
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
function mulh(n,data){
    return '<div class="multiplier-hole"'+(n<16?'':' style="border-right:0px;"')+'>x'+data+'</div>';
}
