const port = 3700;

const puller = require('./lib/HackerNewsPuller');
const posts = require('./lib/Posts');

const path = require('path');
const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server, {path: '/socket.io'});
const pug = require('pug');
const bodyParser = require('body-parser');


var Posts = new posts({server: `mongodb://localhost:27017`, name: `HackerNews`});

app.use(bodyParser());
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/assets/js/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist/js')); // redirect bootstrap JS
app.use('/assets/js/jquery', express.static(__dirname + '/node_modules/jquery/dist')); // redirect JS jQuery
app.use('/assets/css/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist/css'));
app.use('/assets/css/fonts', express.static(__dirname + '/node_modules/bootstrap/dist/fonts'));
app.use('/assets/js/moment', express.static(__dirname + '/node_modules/moment/min'));


app.set('views', __dirname + '/');
app.set('view engine', 'pug');

app.get('/', function(req, res) {
    res.render('index.pug');
});
app.post('/remove/:id', function(req, res) {
  Posts.disablePosts(req.body.username, req.params.id)
  .then((response) => {
    res.send({status: 'done', message: 'Post deleted!'});
  }, (reject) => {
    res.send({status: 'error', message: 'There was an error deleting post'});
  });
});
app.post('/favourites/add/:id', function(req, res) {
  Posts.addFavouritePosts(req.body.username, req.params.id)
  .then((response) => {
    res.send({status: 'done', message: 'Post added to favourites!'});
  }, (reject) => {
    res.send({status: 'error', message: 'There was an error adding post to favourites'});
  });
});
app.post('/favourites/remove/:id', function(req, res) {
  Posts.removeFavouritePosts(req.body.username, req.params.id)
  .then((response) => {
    res.send({status: 'done', message: 'Post removed to favourites!'});
  }, (reject) => {
    res.send({status: 'error', message: 'There was an error removing post from favourites'});
  });
});


var getLatest = async (auth) => {
  try {
    console.log('getLatestEvents', auth.username)
    await puller({database: {server: `mongodb://localhost:27017`, name: `HackerNews`}, api: `https://hn.algolia.com/api/v1/search_by_date?query=nodejs`});
    let result = await Posts.getPosts(auth.username);
    console.log(`latestEventsTo_${auth.username}`)
    io.emit(`latestEventsTo_${auth.username}`, result);
  } catch (e) {
    console.log(e);
  }
}

io.on('connection', function (socket) {
  console.log('client connected');
  socket.on('getLatestEvents', async (username) => {
    getLatest(username);
    setInterval(() => {
      getLatest(username);
    }, 1000 * 60 * 60);
  });
        
  socket.on('disconnect', function() {
    console.log('client disconnected');
  });  
});

server.listen(port, function(){
  console.log(`listening on port: ${port}`);
});


