let express = require('express');
let app = express();

app.use(express.static('public'))
app.set('views', __dirname + '/public/html');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.get('/', function (req, res) {
    res.render('index.html');
});

app.listen(8080, function () {
  console.log('Wiju Task App listening on port 8080!');
});