<?php
include 'openid.php';

class SteamAuth{

    private $api_key = false;
    private $logged = false;
    private $openid;

    public function setSteamKey($api_key){
        $this->api_key = $api_key;
        $this->openid = new LightOpenID('http://185.62.189.131/');
        $this->openid->identity = 'http://steamcommunity.com/openid/';
    }

    public function getAuthUrl(){
        return $this->openid instanceof LightOpenID ? $this->openid->authUrl() : false;
    }

    public function verifyLogin(){
        return $this->openid instanceof LightOpenID && $this->openid->mode ? $this->openid->validate() && ($this->logged = true) : false;
    }

    public function loadProfile(){
        if($this->logged) {
            $profile = explode('/', $this->openid->identity);
            $profile = end($profile);

            if($this->api_key) {
                $json = json_decode(file_get_contents("http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key={$this->api_key}&steamids={$profile}"));
                return $json->response->players[0];
            }
        }
        return false;
    }
}
