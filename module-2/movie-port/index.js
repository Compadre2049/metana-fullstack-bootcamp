import express from 'express';
import bodyParser from 'body-parser';
import { validateInputs, setError, setSuccess } from './scripts/login.js';
import exphbs from 'express-handlebars';

const app = express();
const PORT = 3000;

// Set the view engine for express to use Handlebars
app.engine(
  'hbs',
  exphbs.engine({
    defaultLayout: 'main', // this looks for a template called "main" in the /views/layouts folder
    extname: '.hbs', // We're specifying the file extension as '.hbs' for brevity
  })
);

//Sets view engine
app.set('view engine', 'hbs');
app.use(express.static('views')); // This sets a static directory for static assets such as CSS files, Javascript, and images

//Sets directory for static assets
app.use(express.static('public'));

// Login page GET request
app.get('/login', function (req, res) {
  res.render('login');
});

// Configure body-parser middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));

// Create an Express route to handle the form submission
app.post('/login', (req, res) => {
  // Access the form data from the request body
  const formData = req.body;

  // Process the form data as needed
  console.log(formData);

  // Render a response to the client
  res.send('Form submitted successfully!');
});

app.post('/login', (req, res) => {
  // Access the form data from the request body
  const formData = req.body;

  // Validate the form inputs
  if (validateInputs(formData)) {
    // If the inputs are valid, submit the form programmatically
    console.log('Form submitted');
    // You can perform any necessary actions with the form data here
    // ...

    // Send a success response to the client
    res.send('Form submitted successfully!');
  } else {
    // If the inputs are invalid, send an error response to the client
    res.status(400).send('Invalid form inputs');
  }
});

// Index page
app.get('/', function (req, res) {
  res.render('index', {
    imgpath1: 'avatar.jpg',
    alt1: 'Avatar',
    imgpath2: 'blazingsaddles.jpg',
    alt2: 'Blazing Saddles',
    imgpath3: 'castleinthesky.jpg',
    alt3: 'Castle in the Sky',
  });
});

// Highly reviewed movies page
app.get('/highly-reviewed-movies', function (req, res) {
  res.render('highly-reviewed-movies', {
    imgpath4: 'theylive.jpg',
    alt4: 'They Live',
    imgpath5: 'theprofessional.jpg',
    alt5: 'The Professional',
    imgpath6: 'pulpfiction.jpg',
    alt6: 'Pulp Fiction',
  });
});

// Popular movies page
app.get('/popular-movies', function (req, res) {
  res.render('popular-movies', {
    imgpath7: 'bladerunner2049.jpg',
    alt7: 'Bladerunner 2049',
    imgpath8: 'shawshankredemption.jpg',
    alt8: 'Sawshank Redemption',
    imgpath9: 'americanpsycho.jpg',
    alt9: 'American Psycho',
  });
});

app.listen(PORT, function () {
  console.log(`Server started at http://localhost:${PORT}`);
});
