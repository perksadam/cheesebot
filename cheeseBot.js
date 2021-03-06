// Generated by CoffeeScript 1.10.0
(function() {
  var Slack, autoMark, autoReconnect, slack, token;

  Slack = require('slack-client');

    var http = require('http');
    var R = require('Ramda');

    var cheeseNames = [];

    fs.createReadStream('Cheese.txt', { encoding: 'utf8'}).on('data', function(data){
        cheeseNames = R.map(R.trim, data.split('\n'));
    }).on('end', function(){
        slack.login();
    });
	
  token = 'xxxxx';

    var giphyUrl =  "http://tv.giphy.com/v1/gifs/tv?api_key=CW27AW0nlp5u0&tag={tag}&internal=yes";
    autoReconnect = true;

  autoMark = true;

  slack = new Slack(token, autoReconnect, autoMark);

  slack.on('open', function() {
    var channel, channels, group, groups, id, messages, unreads;
    channels = [];
    groups = [];
    unreads = slack.getUnreadCount();
    channels = (function() {
      var ref, results;
      ref = slack.channels;
      results = [];
      for (id in ref) {
        channel = ref[id];
        if (channel.is_member) {
          results.push("#" + channel.name);
        }
      }
      return results;
    })();
    groups = (function() {
      var ref, results;
      ref = slack.groups;
      results = [];
      for (id in ref) {
        group = ref[id];
        if (group.is_open && !group.is_archived) {
          results.push(group.name);
        }
      }
      return results;
    })();
    console.log("Welcome to Slack. You are @" + slack.self.name + " of " + slack.team.name);
    console.log('You are in: ' + channels.join(', '));
    console.log('As well as: ' + groups.join(', '));
    messages = unreads === 1 ? 'message' : 'messages';
    return console.log("You have " + unreads + " unread " + messages);
  });

  slack.on('message', function(message) {
        var channel, channelError, channelName, errors, response, text, textError, ts, type, typeError, user, userName;
        channel = slack.getChannelGroupOrDMByID(message.channel);
        user = slack.getUserByID(message.user);
        response = '';
        type = message.type, ts = message.ts, text = message.text;
        channelName = (channel != null ? channel.is_channel : void 0) ? '#' : '';
        channelName = channelName + (channel ? channel.name : 'UNKNOWN_CHANNEL');
        userName = (user != null ? user.name : void 0) != null ? "@" + user.name : "UNKNOWN_USER";
        console.log("Received: " + type + " " + channelName + " " + userName + " " + ts + " \"" + text + "\"");

        if (type === 'message' && (text != null) && (channel != null) && (channelName != '#general') && (messageContainsCheese(text))) {
            var requestUrl = giphyUrl.replace('{tag}', 'cheese');
            http.get(requestUrl, function(response){
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
            return console.log("@" + slack.self.name + " responded with \"" + response + "\"");
        } else {
            typeError = type !== 'message' ? "unexpected type " + type + "." : null;
            textError = text == null ? 'text was undefined.' : null;
            channelError = channel == null ? 'channel was undefined.' : null;
            errors = [typeError, textError, channelError].filter(function(element) {
                return element !== null;
            }).join(' ');
            return console.log("@" + slack.self.name + " could not respond. " + errors);
        }
    });
  slack.on('error', function(error) {
    return console.error("Error: " + error);
  });

    function getRegExp(cheese){
        return new RegExp('(^|\\W)' + cheese + '(?=\\W|$)', 'gi');
    }

    function messageContainsCheese(message){
        return R.any(R.test(R.__, message))(R.map(getRegExp, cheeseNames));
    }
}).call(this);
