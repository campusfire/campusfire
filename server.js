const express = require('express');
const bodyParser = require('body-parser');
const ExpressPeerServer = require('peer').ExpressPeerServer;
const path = require('path');
const app = express();
app.use(express.static(path.join(__dirname, 'build')));

function makeid(length) {
    let result           = '';
    let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

let clientKey = makeid(8);

app.get('/ping', function (req, res) {
 return res.send('pong');
});

app.get('/display/:key', function(req, res){
    if(req.params.key === 'fire'){
        res.send('ok');
    }else

    res.send('ko');
});

app.get('/mobile/:key', function(req, res){
    if(req.params.key == clientKey){
        clientKey = makeid(8);
        res.send('ok');
    }else

        res.send('ko');
});

app.get('/key', function(req, res){
    res.send(clientKey);
});

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});


app.use(function (req, res, next) {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});


const server = app.listen(process.env.PORT || 8080);

const options = {
    debug: true
};

const peerserver = ExpressPeerServer(server, options);

app.use('/peer', peerserver);
peerserver.on('connection', function(c){
    console.log('coucou');
    console.log(c);
});