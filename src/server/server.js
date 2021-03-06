// required dependencies
const coordinatesMapper = require("./coordinatesMapper");
const fetch = require("node-fetch");
const dotenv = require('dotenv');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

// constants
const PORT = 8082;
const API_BASE_URL = {
    GEONAMES: 'http://api.geonames.org',
    WEATHERBIT: 'https://api.weatherbit.io',
    PIXABAY: 'https://pixabay.com'
};

// configure environment file
dotenv.config();

// setup app to listen on specified port
const app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cors());
app.use(express.static('dist'));

app.listen(PORT, () => console.log(`Server running on localhost: ${PORT}`));

// setup utils functions
const fetchInfoLog = (url) => console.log(`Fetched data from ${url}`);

const fetchDataFromApi = async (url, req, res, dataMapper = (data) => data, logger = () => fetchInfoLog(url)) => {
    const response = await fetch(url);

    try {
        const data = await response.json();
        const mappedData = await dataMapper(data);

        logger();

        res.send(mappedData);
    } catch (error) {
        console.log("Error", error);
    }
};

// setup the needed routes

app.get('/', function (req, res) {
    res.sendFile('dist/index.html');
});

app.post('/location', async (req, res) => {
    const url = `${API_BASE_URL.GEONAMES}/searchJSON?q=${req.body.location}&maxRows=1&username=${process.env.GEOCODES_NAME}`;

    await fetchDataFromApi(url, req, res, coordinatesMapper.map);
});

app.post('/weather', async (req, res) => {
    const url = `${API_BASE_URL.WEATHERBIT}/v2.0/forecast/daily?lat=${req.body.lat}&lon=${req.body.long}&key=${process.env.WEATHERBIT_KEY}`;

    await fetchDataFromApi(url, req, res);
});

app.post('/image', async (req, res) => {
    const url = `${API_BASE_URL.PIXABAY}/api/?key=${process.env.PIXABAY_KEY}&q=${req.body.city}&image_type=photo`;

    await fetchDataFromApi(url, req, res);
});
