(function() {
    var slack;
    var R = require('Ramda');

    var http = require('http');
    var Botkit = require('botkit');

    var cheeseNames = [];
    var giphyUrl =  "http://tv.giphy.com/v1/gifs/tv?api_key=CW27AW0nlp5u0&tag={tag}&internal=yes";

    fs.createReadStream('Cheese.txt', { encoding: 'utf8'}).on('data', function(data){
        cheeseNames = R.map(R.trim, data.split('\n'));
    }).on('end', function(){
        slack.login();
    });

    var controller = Botkit.slackbot({
        debug: true
        //include "log: false" to disable logging
        //or a "logLevel" integer from 0 to 7 to adjust logging verbosity
    });

    //connect the bot to a stream of messages
    var bot = controller.spawn({
        token: 'xxxx',
    }).startRTM();

    // give the bot something to listen for.
    controller.hears(cheeseNames, ['message_received'], function (bot, message) {

        bot.reply(message, getGif());
    });









    function getGif(callback){
        http.get(giphyUrl, function(response){
            response.setEncoding('utf8');
            var body = '';
            response.on('data', function(data){
                body += data;
            });
            response.on('end', function(){
                var responseObject = JSON.parse(body);
                if(responseObject.data.url){
                    console.log(responseObject.data.url);
                    channel.send(responseObject.data.url);
                }
            });
        });
    }
})();
