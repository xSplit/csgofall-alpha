<?php
include 'steam/steamauth.php';
$steam = new SteamAuth();
$api_key = '0BFDDB50219AF721A74B8C8D80C1F7CF';
$steam->setSteamKey($api_key);

if($steam->verifyLogin()) {
    $db = new PDO('mysql:dbname=csgofall;host=127.0.0.1', 'root', 'dev', array(PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION)); //SET GLOBAL sql_mode=''
    $user = $steam->loadProfile();

    $c = $db->prepare("SELECT COUNT(*),token FROM users WHERE steamid=?");
    $c->execute(array($user->steamid));
    $data = $c->fetch(); $token = 0; $username = htmlspecialchars(substr($user->personaname,0,24),ENT_QUOTES,'UTF-8');

    if($data[0] > 0){
        $db->prepare("UPDATE users SET username=?,avatar=?,online=UNIX_TIMESTAMP() WHERE token=?")->execute(array($username,$user->avatar,$data[1]));
        $token = $data[1];
    }else{
        do {
            $token = substr(str_shuffle(str_repeat($x='0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', ceil(40/strlen($x)))),1,40);
        }while($db->query("SELECT COUNT(*) FROM users WHERE token='$token'")->fetchColumn() > 0);
        $db->prepare("INSERT INTO users(steamid,online,username,avatar,token) VALUES(?,UNIX_TIMESTAMP(),?,?,?)")->execute(array(
            $user->steamid, $username, $user->avatar, $token
        ));
    }
    ?>
	<head></head>
    Processing Authentication...
    <script>
        localStorage.setItem('token','<?php echo $token;?>');
        location.href = 'index.php';
    </script>
    <?php
    exit;
}
$boards = [[50,25,1.4,1.3,1.2,0.1,1.1,1.1,1.1,1.1,1.1,0.1,1.2,1.3,1.4,25,50],
    [100,25,10,6,3,2,1.3,0.2,0,0.2,1.3,2,3,6,10,25,100],
    [250,50,20,10,5,3,0,0,0.1,0,0,3,5,10,20,50,250]];
    ?>
    <!DOCTYPE html>
    <html lang="en">

    <head>

        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="description" content="The easiest way to win new CS:GO skins, or trade in your old skins for new ones!">
        <meta name="author" content="Desiigner Panda">
        <meta name="theme-color" content="#EF9F21">

        <link rel="shortcut icon" href="img/favicon.ico" type="image/x-icon">
        <title>CS:GO Fall | Play</title>

        <link href="css/bootstrap.min.css" rel="stylesheet">
        <link href="css/menu.css" rel="stylesheet">
        <link href="css/custom.css?v=s4" rel="stylesheet">
        <link href="css/responsive.css" rel="stylesheet">

        <!--[if lt IE 9]>
        <script src="https://oss.maxcdn.com/libs/html5shiv/3.7.0/html5shiv.js"></script>
        <script src="https://oss.maxcdn.com/libs/respond.js/1.4.2/respond.min.js"></script>
        <![endif]-->
    </head>

    <body>

    <div id="preloader">
        <div class="spinlogo-container">
            <img class="pre1" src="img/leftpart.png">
            <img class="pulse" src="img/triangle.png">
            <img class="pre3" src="img/rightpart.png">
        </div>
    </div>

    <header id="header">
        <div class="header-top">
            <div class="header-social">
                <a target="_blank" href="http://twitter.com/csgosweep"><i class="fa fa-twitter"></i> <span>Twitter</span></a>
                <a target="_blank" href="http://steamcommunity.com/groups/csgosweepgroup"><i class="fa fa-steam"></i> <span>Steam</span></a>
            </div>

            <div class="header-links">
                <a href="#" onclick="event.preventDefault();" data-toggle="modal" data-target="#affiliateModal">Affiliate</a>
                <a href="#" onclick="event.preventDefault();$('#redeem-code-container').fadeToggle();">Redeem Code</a>
                <div id="redeem-code-container" style="display:none;">
                    <input id="redeem-code" class="flat-inputs" placeholder="Code..." onkeyup="redeemCode()"> </input>
                    <div id="redeem-code-log">Insert Code</div>
                </div>
                <a href="#" onclick="event.preventDefault();" data-toggle="modal" data-target="#verificationHashModal">Provably Fair</a>
                <a href="#" onclick="event.preventDefault();$('.tos-body').load('tos.html');" data-toggle="modal" data-target="#tosModal">Terms of Service</a>
                <a href="#" onclick="event.preventDefault();" data-toggle="modal" data-target="#faqModal">FAQ</a>
                <a href="#" onclick="event.preventDefault();groove.widget('open')">Contact</a>
                <a href="#" onclick="event.preventDefault();localStorage.clear();location.reload();">Logout</a>
            </div>
        </div>

        <div id="header-main">
            <div id="stats-nav">
                <div class="stats-container">
                    <h4>Balance  <div id="balance">...</div><img class="small-topaz" src="img/ingot.png"></h4>
                    <h4>Total Wagered <div id="wagered-tally">...</div><img class="small-topaz" src="img/ingot.png"></h4>
                    <a href="<?php echo $steam->getAuthUrl();?>"><img class="signInWithSteam" src="https://www.winaskin.com/assets/img/steam.png"></a>
                </div>


            </div>
            <nav id="header-nav">
                <a href="#" onclick="event.preventDefault();$('.live-table-container').show();showContainer('.plinko-external');" class="menuActive">Plinko Game</a>
                <a href="#" onclick="event.preventDefault();$('.live-table-container').show();showContainer('.externalDiceContain');">Dice Game</a>
                <a href="#" onclick="event.preventDefault();$('.live-table-container').hide();showContainer('.deposit-container');cacheInventory();">Deposit</a>
                <a href="#" onclick="event.preventDefault();$('.live-table-container').hide();showContainer('.withdraw-container');loadBotInventory();">Withdraw</a>
                <a style="margin-right:0px;" href="#" onclick="event.preventDefault();showNotifications();">Notifications</a>
            </nav>
        </div>
    </header>

    <div class="profile-nav-mob">
        <div id="mob-logo">
            <a href="index.php"><img id="common-logo" src="img/logo.png"></a></div>
    </div>
    </div>

    <div class="nav-global">
        <div id="o-wrapper" class="o-wrapper">
            <main class="o-content">
                <div class="o-container">

                    <div class="c-buttons">


                        <button id="c-button--push-right" class="c-button"><span class="icon-bar"></span><span class="icon-bar"></span><span class="icon-bar"></span></button>
                    </div>
            </main>
        </div>

        <nav id="c-menu--push-right" class="c-menu c-menu--push-right">
            <button class="c-menu__close">Close Menu &rarr;</button>
            <ul class="c-menu__items">
                <li class="c-menu__item"><a href="#" class="c-menu__link">Mines</a></li>
                <li class="c-menu__item"><a href="#" class="c-menu__link">Dice</a></li>
                <li class="c-menu__item"><a href="#" class="c-menu__link">Deposit</a></li>
                <li class="c-menu__item"><a href="#" class="c-menu__link">Withdraw</a></li>
                <li class="c-menu__item"><a href="#" class="c-menu__link">Notifications</a></li>
            </ul>

            <ul class="c-menu__items">
                <li class="c-menu__item"><a href="#" class="c-menu__link">Twitter</a></li>
                <li class="c-menu__item"><a href="#" class="c-menu__link">Steam</a></li>
            </ul>

            <ul class="c-menu__items">
                <li class="c-menu__item"><a href="#" class="c-menu__link">Provably Fair</a></li>
                <li class="c-menu__item"><a href="#" class="c-menu__link">Terms of Service</a></li>
                <li class="c-menu__item"><a href="#" class="c-menu__link">FAQ</a></li>
                <li class="c-menu__item"><a href="#" class="c-menu__link">Contact</a></li>
                <li class="c-menu__item"><a href="#" class="c-menu__link">Logout</a></li>
            </ul>
        </nav>

        <div id="c-mask" class="c-mask"></div>
    </div>
    </div>

    <!-- / Navigation -->

    <div id="sidebar">
        <div class="chat-container">
            <div class="profile-container" style="margin-bottom:0px;">
                <div id="common-left-logo"><a href="#" onclick="event.preventDefault();showContainer('.plinko-external');"><img src="img/logo.png"></a></div>
            </div>
            <div class="chat-head">Chat <i data-state="0" class="fa fa-times" id="close-chat" aria-hidden="true"></i><small id="users_online">Online: ...</small></div>
            <div id="chat-body-mob" class="chat-body">
            </div>
            <p id="error-chat" style="display: inline;"></p>
            <div id="chat-footer" class="chat-footer">
                <input type="text" id="chat" onkeyup="if(event.keyCode == 13) sendChat();">
                <button type="button" onclick="sendChat()">Send</button>
            </div>
        </div>
    </div>

    <div id="global-body">
        <div class="notification" style="left: 50%;">
            <div class="notification__side" style="background: rgb(57, 67, 76);" id="notification_icon"><i class="fa fa-ban" aria-hidden="true"></i>
            </div><span class="notification__body"></span>
            <div class="notification__side x-notif" style="cursor: pointer;" onclick="closeAlert2()">
                <i class="fa fa-times" aria-hidden="true"></i>
            </div>
        </div>
        <div class="plinko-external">
            <div id="plinko-container" class="plinko-container" style="text-align:Center"></div>
            <div class="plinko-multipliers">
                <?php $output = '';
                foreach($boards[0] as $key => $value):
                    $output .= '<div class="multiplier-hole"'.($key<16?'':' style="border-right:0px;"').'>x'.$value.'</div>';
                endforeach; echo $output;?>
            </div>
            <div class="plinko-multipliers green-plinko">
                <?php $output = '';
                foreach($boards[1] as $key => $value):
                    $output .= '<div class="multiplier-hole"'.($key<16?'':' style="border-right:0px;"').'>x'.$value.'</div>';
                endforeach; echo $output;?>
            </div>
            <div class="plinko-multipliers red-plinko">
                <?php $output = '';
                foreach($boards[2] as $key => $value):
                    $output .= '<div class="multiplier-hole"'.($key<16?'':' style="border-right:0px;"').'>x'.$value.'</div>';
                endforeach; echo $output;?>
            </div>
            <div class="plinko-buttons-container">
                <div class="row">
                    <div class="col-lg-12 col-xs-12">
                        <input id="wager-amt" placeholder="Bet amount" onkeypress='return event.charCode>=48&&event.charCode<=57'><button id="balance-multiplier" onclick="setWager(0)">Max</button><button id="balance-multiplier" onclick="setWager(1)">x2</button><button id="balance-multiplier" style="border-radius:0px 2px 2px 0px;" onclick="setWager(2)">1/2</button>
                    </div>
                    <div class="col-lg-12 col-xs-12 drop-btns">
                        <button id="orange-plinko-btn" style="border-radius:2px 0px 0px 2px"; onclick="playBet(0)">Drop</button><button id="green-plinko-btn" onclick="playBet(1)">Drop</button><button id="red-plinko-btn" style="border-radius:0px 2px 2px 0px" onclick="playBet(2)">Drop</button>
                    </div>
                </div>
            </div>
            <div class="payoutEditorContainer"><a class="payoutEditorLink" href="#" onclick="event.preventDefault();$('#payoutEditorModal').modal('show');">Payout Editor</a></div>
        </div>

        <div class="externalDiceContain" style="display:none;">
            <ul class="nav nav-tabs">
                <li class="active"><a data-toggle="tab" href="#manualDiceTab" onclick="event.preventDefault();hideAutoDice();">Manual Betting</a></li>
                <li class="rightTab"><a href="#" onclick="event.preventDefault();showAutoDice();">Automated Betting</a></li>
            </ul>
            <div class="tab-content">
                <div id="manualDiceTab" class="tab-pane active">
                    <div class="diceContainer">
                        <div class="manualDice">
                            <div class="topSectionDice">
                                <div class="topManualLeft">
                                    <h4>BET AMOUNT</h4>
                                    <div class="childManualLeft">
                                        <input onkeypress='return event.charCode>=48&&event.charCode<=57' id="wager-amt2"><button onclick="setWager2(0)">max</button><button onclick="setWager2(1)">x2</button><button class="farRightMan" onclick="setWager2(2)">1/2</button>
                                    </div>
                                </div>
                                <div class="topManualRight">
                                    <h4>PROFIT ON WIN</h4>
                                    <div class="childManualLeft">
                                        <input id="profitwin" value="0" disabled>
                                    </div>
                                </div>
                            </div>
                            <div class="manualDiceMidSection">
                                <div class="manualSecOne">
                                    <h4>ROLL UNDER</h4>
                                    <div class="rollOverUnder">
                                        <a class="baseFlip" href="#" onclick="event.preventDefault();"><proll>49.50</proll> <img class="pre-rotation" src="img/flip.svg"></a>
                                    </div>
                                </div>
                                <div class="manualSecTwo">
                                    <h4>PAYOUT</h4>
                                    <div class="rollOverUnder">
                                        <input class="optionText" value="2.000" onfocus="$('.editimg').eq(0).hide()" onblur="$('.editimg').eq(0).show()"><img onclick="$('.optionText').eq(0).focus()" src="img/edit.svg" class="editimg">
                                    </div>
                                </div>
                                <span class="rightLine"></span>
                                <div class="manualSecThree">
                                    <h4>WIN CHANCE</h4>
                                    <div class="rollOverUnder">
                                        <input class="optionText" value="49.50" onfocus="$('.editimg').eq(1).hide()" onblur="$('.editimg').eq(1).show()"><img onclick="$('.optionText').eq(1).focus()" src="img/edit.svg" class="editimg">
                                    </div>
                                </div>
                            </div>
                            <div class="autoDiceSubBottomSection" style="display:none;">
                                <div class="autoSecOne">
                                    <h4>On Loss</h4>
                                    <div class="onLossLeft">
                                        <div class="btnsCont"><button class="selectedOn" onclick="bsclick(0)">Return to base</button><button class="rightBtnS" onclick="inclick(0)">Increase by:</button></div>
                                        <input class="percentageIncrease" placeholder="0%" value="0%" disabled>
                                    </div>
                                </div>
                                <div class="autoSecTwo">
                                    <h4>On Win</h4>
                                    <div class="onWinRight">
                                        <div class="btnsCont"><button class="selectedOn" onclick="bsclick(1)">Return to base</button><button class="rightBtnS" onclick="inclick(1)">Increase by:</button></div>
                                        <input class="percentageIncrease" placeholder="0%" value="0%" disabled>
                                    </div>
                                </div>
                            </div>
                            <div class="manualDiceBottomSection">
                                <a href="#" onclick="event.preventDefault();playBet2();">Roll Dice</a>
                            </div>
                        </div>
                    </div>
                </div>
                <div id="autoDiceTab" class="tab-pane">
                    <div class="diceContainerAuto">
                        <div class="autoDice">

                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="live-table-container">
            <ul class="nav nav-tabs">
                <li class="active" onclick="curr_table='#live';last_bet=null;sendMsg('Games','LIVE');"><a data-toggle="tab" href="#live">Live Bets</a></li>
                <li onclick="curr_table='#high';last_bet=null;sendMsg('Games','HIGH');"><a data-toggle="tab" href="#high">High Rollers</a></li>
                <li onclick="curr_table='#myBets';last_bet=null;sendMsg('Games','MY');"><a data-toggle="tab" href="#myBets">My Bets</a></li>
            </ul>
            <div class="tab-content">
                <div id="live" class="tab-pane fade in active">
                    <table class="table">
                        <thead>
                        </thead>
                        <tbody>
                        </tbody>
                    </table>
                </div>
                <div id="high" class="tab-pane fade">
                    <table class="table">
                        <thead>
                        </thead>
                        <tbody>
                        </tbody>
                    </table>
                </div>
                <div id="myBets" class="tab-pane fade">
                    <table class="table">
                        <thead>
                        </thead>
                        <tbody>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <div class="deposit-container" style="display:none;">
            <div class="total-cost-calc-section">
                <h4><strong>0 Selected</strong> <span>You'll receive <i class="fa fa-diamond" style="margin-right:5px;" aria-hidden="true"></i> 0</span><input class="searchItems" onkeyup="searchItem(this.value)" placeholder="Search Items (e.g. Desert Eagle)"></h4>
            </div>
            <div class="secondary-item-container">
            </div>
			<div class="initiate-trade-section">
                <div class="right-section"><button class="send-trade" onclick="sendTrade(0);">Send Offer <i class="fa fa-paper-plane" aria-hidden="true" style="margin-left:5px;"></i></button>
                <button class="send-trade refresh-btn" onclick="loadInventory()">Refresh Inventory <i class="fa fa-retweet" style="margin-left:5px;" aria-hidden="true"></i></button> </div>
                <div class="left-section">
                <button class="send-trade url-btn" data-url="<?php echo $steam->getAuthUrl();?>" onclick="location.href=this.getAttribute('data-url')">Get Trade URL</button>
                <input class="tradeUrl" placeholder="Enter Trade URL"> </div>
            </div>
        </div>

        <div class="withdraw-container" style="display:none;">
            <div class="total-cost-calc-section">
                <h4><strong>0 Selected</strong> <span>It will cost <i class="fa fa-diamond" style="margin-right:5px;" aria-hidden="true"></i> 0</span><input class="searchItems" onkeyup="searchItem(this.value)" placeholder="Search Items (e.g. Desert Eagle)"></h4>
            </div>
            <div class="secondary-item-container"></div>
            <div class="initiate-trade-section">
                <div class="right-section"><button class="send-trade" onclick="sendTrade(1);">Send Offer <i class="fa fa-paper-plane" aria-hidden="true" style="margin-left:5px;"></i></button>
                    <button class="send-trade refresh-btn" onclick="loadBotInventory()">Refresh Items <i class="fa fa-retweet" style="margin-left:5px;" aria-hidden="true"></i></button> </div>
                <div class="left-section">
                <button class="send-trade url-btn" data-url="<?php echo $steam->getAuthUrl();?>" onclick="location.href=this.getAttribute('data-url')">Get Trade URL</button>
                <input class="tradeUrl" placeholder="Enter Trade URL"> </div>
            </div>
        </div>
    </div>

    <div class="notifications-cont" style="display:none;"></div>

    <div id="betHashModal" class="modal fade" role="dialog">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal">&times;</button>
                    <h4 class="modal-title">Verification Information</h4>
                </div>
                <div class="modal-body hash-body">
                    <div class="hash-info">
                        <h5>Server Seed (SHA1)</h5>
                        <p></p>
                    </div>
                    <div class="hash-info">
                        <h5>Public Hash (SHA1)</h5>
                        <p></p>
                    </div>
                    <div class="bottom-cont-hash">
                            <p>The server seed is a random hash and the client seed the bet value. To obtain the final index from the resulting public hash, characters are taken and interpreted as an integer. Each move is determined by the modulo of the current integer. In dice games integers come up to a random sum. For more detailed informations see the <a href="#" onclick="event.preventDefault();$('#betHashModal').modal('hide');" data-toggle="modal" data-target="#verificationHashModal">Verification page.</a></p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div id="verificationHashModal" class="modal fade" role="dialog">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal">&times;</button>
                    <h4 class="modal-title">Verification Information</h4>
                </div>
                <div class="modal-body hash-body">
                    <div class="hash-info">
                        <h5>Enter Server Seed (SHA1)</h5>
                        <input>
                    </div>
                    <div class="hash-info">
                        <h5>Enter Bet Value</h5>
                        <input onkeypress='return event.charCode>=48&&event.charCode<=57'>
                    </div>
                    <div class="hash-info">
                        <h5>Public Hash (SHA1)</h5>
                        <input disabled>
                        <button onclick="hashTest()">Calculate</button>
                    </div>
                    <div class="bottom-cont-hash">
                        <p>Server seed: it's a SHA1 hash of a random 64 characters string<br>
                            Client seed: it's the SHA1 hash of the bet value<br>
                            Public hash: it's the SHA1 hash of serverSeed + clientSeedHash<br>
                            The public hash is used to generate a serie of movements as <span class="glyphicon glyphicon-arrow-left"></span> or <span class="glyphicon glyphicon-arrow-right"></span> from a modulo<br>
                            <br>Here there is an example with javascript pseudocode:<br>
                        </p><div class="codeText">
                        <p><span class="jsVars">var</span> <span class="normalCode">actionMatrix</span> = [BACK, FORWARD], <span class="normalCode">movements</span> = [];</p>
                        <p><span class="jsVars">var</span> <span class="normalCode">hash</span> = <span class="yellowCode">SHA1</span>(<span class="normalCode">serverSeed</span> + <span class="yellowCode">SHA1</span>(<span class="normalCode">betValue</span>));</p>
                        <p><span class="purpleCode">for</span>(<span class="jsVars">var</span> <span class="normalCode">i</span> = <span class="greenCode">0</span>; i &lt; <span class="greenCode">16</span>; <span class="normalCode">i</span>++) {</p>
                        <p style="padding-left:5px;"><span class="jsVars">var</span> mod = <span class="normalCode">actionMatrix</span>[<span class="normalCode">hash</span>[<span class="normalCode">i</span>] % <span class="greenCode">2</span>];</p>
                        <p style="padding-left:5px;"><span class="normalCode">movements</span>.<span class="yellowCode">push</span>(<span class="normalCode">mod</span>);</p>
                        <p>}</p></div><p>
                            The index coming from 16 - SUM(movements) will be the final result for the current coin<br>
                            Coin multipliers are stored as [MAX_LEFT,...,MAX_RIGHT]<br>
                            In dice games sum goes up to hash length and final result is sum % 100<br><br>
                            After this your balance is updated as balance + (bet * currentCoin[finalIndex]) - bet<br>
                            In dice games payout is calculated as [1 / (roll / 99)] or [-1 / ((roll - 99.99) / 99)]
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div id="faqModal" class="modal fade" role="dialog">
        <div class="modal-dialog">

            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal">&times;</button>
                    <h4 class="modal-title">FAQ</h4>
                </div>
                <div class="modal-body faq-body">
                    <h4>What is CSGOFall?</h4>
                    <p>CSGOFall is a brand new innovative platform in which players can exchange their CS:GO skins for "points". Users are then able to play the games listed on our platform with the "points" balance giving them a chance of winning big payouts. Players can then exchange their "points" accumulated on the website in exchange for CS:GO skins and cash out.</p>

                    <h4>How do I deposit?</h4>
                    <p>In order to deposit skins onto our website, you should click on any button that says "deposit", and from there you can select which items you would like to deposit. You will be told how many points you will receive in exchange for your items on the deposit page; once you are satisfied, you can finalise the trade by clicking the deposit button.</p>

                    <h4>How do I withdraw?</h4>
                    <p>Withdrawing from our website is extremely simple; in order to do so, click on the withdraw button, and from there, the withdraw page acts like a marketplace for you to spend your points on new items.</p>

                    <h4>How can I know that this website is fair and legitimate?</h4>
                    <p>You can put your trust in our provably fair method, find out more by visiting our <a onclick="event.preventDefault();$('#faqModal').modal('hide');" style="cursor:pointer;" data-toggle="modal" data-target="#verificationHashModal">provably fair page here.</a></p>
                </div>
            </div>

        </div>
    </div>

    <div id="tosModal" class="modal fade" role="dialog">
        <div class="modal-dialog">

            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal">&times;</button>
                    <h4 class="modal-title">Terms Of Service</h4>
                </div>
                <div class="modal-body tos-body">
                </div>
            </div>

        </div>
    </div>

    <div id="affiliateModal" class="modal fade" role="dialog">
        <div class="modal-dialog">

            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal">&times;</button>
                    <h4 class="modal-title">Referral Program</h4>
                </div>
                <div class="modal-body affiliate-body">
                    <div class="topSec">
                        <p>When users sign up with your referral link, you receive <strong>1% bonus for each profit</strong> they make forever!</p>
                    </div>
                    <div class="midSec">
                        <div class="subMidSec">
                            <h4>Referral URL</h4>
                            <input class="urlAff" value="https://csgofall.com/?r=" onclick="this.select()">
                        </div>
                        <div class="subMidSec">
                            <h4>Change ref code</h4><small>(...)</small>
                            <input id="codeAff" onclick="this.select()">
                            <button onclick="changeRef()">Change Code</button>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </div>

    <div id="publicProfileModal" class="modal fade" role="dialog">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal">&times;</button>
                    <h4 class="modal-title"><a><img></a>Username</h4>
                </div>
                <div class="modal-body publicProfileBody">
                    <div class="topSecP">
                        <div class="leftTp">
                            <h4>Total Wagered</h4>
                            <p id="stats_total_wagered">0</p>
                        </div>
                        <div class="rightTp">
                            <h4>Balance</h4>
                            <p id="profile_balance" class="inProfit">?</p>
                        </div>
                    </div>
                    <div class="midSecP">
                        <div class="lPm">
                            <h4>Total Bets</h4>
                            <p id="stats_total_bets">0</p>
                        </div>
                        <div class="mPm">
                            <h4>Total Wins</h4>
                            <p id="stats_total_wins">0</p>
                        </div>
                        <div class="rPm">
                            <h4>Total Losses</h4>
                            <p id="stats_total_losses">0</p>
                        </div>
                    </div>
                    <div class="botSecP">
                        <div class="lPm">
                            <h4>Luck</h4>
                            <p id="stats_luck">?%</p>
                        </div>
                        <div class="mPm">
                            <h4>Chat Messages</h4>
                            <p id="stats_total_chat">0</p>
                        </div>
                        <div class="rPm">
                            <h4>Referrals</h4>
                            <p id="popularity">?</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div id="payoutEditorModal" class="modal fade" role="dialog">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal">&times;</button>
                    <h4 class="modal-title">Plinko Payout Editor</h4>
                </div>
                <div class="modal-body payoutEditorBody">
                    <div class="topSecPayout">
                        <p>You can set your own payouts (the colored rows beneath the pyramid), but here are some tips:</p>
                        <ul>
                            <li>House edge must be at least 0.99%</li>
                            <li>Payouts can have up to three chars, i.e. XXX or XX or X.X</li>
                            <li>The max bet allowed is not determined by the house edge or highest multiplier</li>
                        </ul>
                    </div>
                    <div class="midSecPayout">
                        <div class="flexColor">
                            <div class="colorOfPayout cofOrange">Orange</div><div class="edgeEd"><strong>...%</strong> house edge</div>
                        </div>
                        <div class="payoutsBlocks">
                            <input value="0"><input value="0"><input value="0"><input value="0"><div class="breakBlocks">-</div><input value="0"><input value="0"><input value="0"><input value="0"><div class="breakBlocks">-</div><input value="0"><div class="breakBlocks">-</div><input value="0"><input value="0"><input value="0"><input value="0"><div class="breakBlocks">-</div><input value="0"><input value="0"><input value="0"><input value="0">
                        </div>
                    </div>
                    <div class="midSecPayoutTwo">
                        <div class="flexColor">
                            <div class="colorOfPayout cofGreen">Green</div><div class="edgeEd"><strong>...%</strong> house edge</div>
                        </div>
                        <div class="payoutsBlocks">
                            <input value="0"><input value="0"><input value="0"><input value="0"><div class="breakBlocks">-</div><input value="0"><input value="0"><input value="0"><input value="0"><div class="breakBlocks">-</div><input value="0"><div class="breakBlocks">-</div><input value="0"><input value="0"><input value="0"><input value="0"><div class="breakBlocks">-</div><input value="0"><input value="0"><input value="0"><input value="0">
                        </div>
                    </div>
                    <div class="midSecPayoutThree">
                        <div class="flexColor">
                            <div class="colorOfPayout cofRed">Red</div><div class="edgeEd"><strong>...%</strong> house edge</div>
                        </div>
                        <div class="payoutsBlocks">
                            <input value="0"><input value="0"><input value="0"><input value="0"><div class="breakBlocks">-</div><input value="0"><input value="0"><input value="0"><input value="0"><div class="breakBlocks">-</div><input value="0"><div class="breakBlocks">-</div><input value="0"><input value="0"><input value="0"><input value="0"><div class="breakBlocks">-</div><input value="0"><input value="0"><input value="0"><input value="0">
                        </div>
                        <button onclick="sendMsg('SerieReset','');">Reset</button>
                    </div>
                    <div class="botSecPayout"></div>
                </div>
            </div>
        </div>
    </div>

    <script src="js/jquery.js"></script>
    <script src="js/jquery.color.js"></script>
    <script src="js/jquery.rotate.min.js"></script>
    <script src="js/jquery-visibility.min.js"></script>

    <script src="js/bignumber.min.js"></script>
    <script src="js/functions.js?v=2"></script>
    <script src="js/menu.js"></script>
    <script src="js/bootstrap.min.js"></script>
    <script src="js/sha1.js"></script>
    <script src="js/csgofall.js?v=213"></script>
    <script>
        $('.tab-pane').find('thead').html('<div class="text-center"><span style="color:white;">Loading...</span></div>');
        if(localStorage.getItem('token'))
            $('.stats-container').find('a').hide();
        else {
            if(location.search.indexOf('?r=')>-1) localStorage.setItem('referral',location.search.split('?r=')[1]);
            $('.stats-container').find('h4').hide();
            $('.secondary-item-container,.midSec').html('<span style="color:#E23E3E;">Not logged in</span>');
        }
        var objContainer = $("#plinko-container"), intLevels = 16;
        for(var i=0; i<intLevels; i++){
            for(var n=0; n<i+1; n++)
                objContainer.append('<div class="plinko-pyramid"></div>');
            objContainer.append('<div></div>');
        }
    </script>
    </body>
	<script id="grv-widget">
  /*<![CDATA[*/
  window.groove = window.groove || {}; groove.widget = function(){ groove._widgetQueue.push(Array.prototype.slice.call(arguments)); }; groove._widgetQueue = [];
  groove.widget('setWidgetId', 'ec4801cf-5da3-6922-a9a6-5d16cef3f941');
  !function(g,r,v){var a,c,n=r.createElement("iframe");(n.frameElement||n).style.cssText="width: 0; height: 0; border: 0",n.title="",n.role="presentation",n.src="javascript:false",r.body.appendChild(n);try{a=n.contentWindow.document}catch(b){c=r.domain;var d="javascript:document.write('<head><script>document.domain=\""+c+"\";</",i="script></head><body></body>')";n.src=d+i,a=n.contentWindow.document}var s="https:"==r.location.protocol?"https://":"http://",p="http://groove-widget-production.s3.amazonaws.com".replace("http://",s);n.className="grv-widget-tag",a.open()._l=function(){c&&(this.domain=c);var t=this.createElement("script");t.type="text/javascript",t.charset="utf-8",t.async=!0,t.src=p+"/loader.js",this.body.appendChild(t)},a.write('<body onload="document._l();">'),a.close()}(window,document);
  /*]]>*/
</script>
    </html>
