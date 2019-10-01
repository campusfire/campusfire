const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
app.use(express.static(path.join(__dirname, 'build')));

app.get('/ping', function (req, res) {
 return res.send('pong');
});

app.get('/display/:key', function(req, res){
    if(req.params.key === 'fire'){
        res.send('ok');
    }else

    res.send('ko');
});

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(process.env.PORT || 8080);