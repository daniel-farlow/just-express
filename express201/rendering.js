const path = require('path');

const express = require('express');
const app = express();

const helmet = require('helmet');

app.use(helmet());

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));

// Set the default view engine
app.set('view engine', 'ejs');   // uncomment to make default
// app.set('view engine', 'hbs');   // uncomment to make default
// app.set('view engine', 'pug');   // uncomment to make default

// Specify folders for Express to look in for views files
app.set('views', [
  path.join(__dirname + '/views'), 
  path.join(__dirname + '/views/ejsViews'),
  path.join(__dirname + '/views/handlebarsViews'),
  path.join(__dirname + '/views/pugViews'),
  path.join(__dirname + '/viewsFakeOne'),
]);

// For base visit to the root
app.get('/', (req, res, next) => {
  res.render('index');
})

// For files directly in the views folder (which will be typical)
app.get('/sampleejs', (req, res, next) => {
  res.render('sample', {name: 'EJS'});
})

app.get('/samplehandlebars', (req, res, next) => {
  res.render('sample.hbs', {name: 'HANDLEBARS'});
})

app.get('/samplepug', (req, res, next) => {
  res.render('sample.pug', {name: 'PUG'});
})

// For files in subdirectories of the views folder (somewhat common)
app.get('/subfolderejs', (req, res, next) => {
  res.render('subEjsView', {name: 'EJS in a subfolder'});
})

app.get('/subfolderhandlebars', (req, res, next) => {
  res.render('subHandlebarsView.hbs', {name: 'HANDLEBARS in a subfolder'});
})

app.get('/subfolderpug', (req, res, next) => {
  res.render('subPugView.pug', {name: 'PUG in a subfolder'});
})

// For a file in a viewsFakeOne folder not within views folder
app.get('/fakeview', (req, res, next) => {
  res.render('fakeview', {name: 'EJS in a viewsFakeOne directory'});
})

app.listen(3000)
