const axios = require("axios");
const VUELOS_URL = process.env.VUELOS_SERVICE_URL;
const getVuelos = () => axios.get(`${VUELOS_URL}/api/vuelos`);

module.exports = { getVuelos };