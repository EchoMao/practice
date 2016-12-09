//测试 上线删除
//var scriptM = document.createElement('script');
//scriptM.src = "http://10.97.199.59:8080/target/target-script-min.js#anonymous";
//document.getElementsByTagName('body')[0].appendChild(scriptM);
//
//localStorage.removeItem('api_time');
//alert(localStorage.api_time);

var getQueryStr = function () {
    var item, key, val, res = {};
    var queryStr = (location.search.length) ? location.search.substring(1) : '';

    if (!queryStr) return res;
    if (queryStr.indexOf('&') === -1 && queryStr.indexOf('=') > -1) {
        item = queryStr.split('=');
        key = decodeURIComponent(item[0]);
        val = decodeURIComponent(item[1]);
        if (key) res[key] = val || "";
        return res;
    }
    if (queryStr.indexOf('&') > -1) {
        items = queryStr.split('&');
        for (var i = 0, len = items.length; i < len; i++) {
            item = items[i].split('=');
            key = decodeURIComponent(item[0]);
            val = decodeURIComponent(item[1]);
            if (key) res[key] = val;
        }
        ;
        return res;
    }
};

//获取card id
var urlCardId = getQueryStr().card_id;

//微信分享
document.addEventListener('WeixinJSBridgeReady', function onBridgeReady() {
    var share_config = {
        general_config:{
            img_url: 'http://static.diditaxi.com.cn/activity/pages/father/share.jpg',
            sharetitle:"父亲一生为你挡风遮雨 你是否愿意为他说一次我爱你",
            sharedesc:"父爱如山，默默给予。你是否从未对父亲表达过爱？今天是父亲节，让我们对他说一次我爱你！",
            link:"http://static.diditaxi.com.cn/activity/pages/father/index.html?v="+Math.random()+'&card_id='+urlCardId
        }
    };

    var obj = share_config.general_config;
    // 分享给朋友
    WeixinJSBridge.on('menu:share:appmessage', function(argv) {
        WeixinJSBridge.invoke('sendAppMessage', {
            "appid": "",
            "img_url": obj.img_url,
            "img_width": "",
            "img_height": "",
            "link": obj.link,
            "title": obj.sharetitle,
            "desc": obj.sharedesc
        }, function(res) {

        });
    });

    // 分享到朋友圈
    WeixinJSBridge.on('menu:share:timeline', function(argv) {
        WeixinJSBridge.invoke('shareTimeline', {
            "img_url": obj.img_url,
            "img_width": "",
            "img_height": "",
            "link": obj.link,
            "title": obj.sharetitle,
            "desc": obj.sharedesc
        }, function(res) {
        });
    });
});

//获取api_ticket
var getApiTicket = function(){
    $.ajax({
        method: "GET",
        url: "http://pay.xiaojukeji.com/activity/hongbao/wxtoken_jsonp/getticket",
        dataType: "jsonp",
        data: "",
        success: function(data){
            if(data.errcode == 0){
                var apiTicket = data.ticket;
                var sengTime = Date.parse(new Date());
                localStorage.api_ticket = apiTicket;
                localStorage.api_time = sengTime;
                var signature = getCardExt(apiTicket);
                actionWX(signature, urlCardId);
            }
            else{
                alert('服务器错误，请刷新页面！')
            }
        },
        error: function(){
            alert('服务器错误，请刷新页面！');
        }
    })
}

//拼接card_ext
var getCardExt = function(api_ticket){
    var card = {};
    card.timestamp = Date.parse(new Date()) / 1000;
    var sigArray = [];
    sigArray.push(api_ticket);
    sigArray.push(urlCardId);
    sigArray.push(card.timestamp);
    sigArray.sort();
    var myString = sigArray[0] + sigArray[1] + sigArray[2];
    card.signature = CryptoJS.SHA1(myString).toString();
    //var stringCard = "{\"timestamp\":\"" + card.timestamp + "\",\"signature\":\"" + card.signature + "\"}"
    var stringCard = JSON.stringify(card);
    //console.log(stringCard)
    return stringCard;
}

//微信调起卡包
var actionWX = function(ext, cardId){
    //console.log({
    //    "card_list": [
    //        {
    //            "card_id": cardId,
    //            "card_ext": ext
    //        }
    //    ]
    //});
    WeixinJSBridge.invoke('batchAddCard', {
        "card_list": [
            {
                "card_id": cardId,
                "card_ext": ext
            }
        ]
    }, function(res){});
}

//获取卡包
var readyFunction = function(){
    document.querySelector('#act-btn-send').addEventListener('click', function(e){
        var thisTime = Date.parse(new Date()),
            api_ticket = localStorage.api_ticket,
            api_time = localStorage.api_time;
        if(api_time === undefined || (thisTime - api_time) > 7200*1000){//如果超过7200秒（距离上次请求）
            getApiTicket();
        }
        else if((thisTime - api_time) < 7200*1000){
            var signature = getCardExt(api_ticket);
            actionWX(signature, urlCardId);
        }
        return false;
    });
}

//运行卡包
if(typeof WeixinJSBridge === "undefined"){
    document.addEventListener('WeixinJSBridgeReady', readyFunction, false);
}
else{
    readyFunction();
}







