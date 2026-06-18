const axios = require("axios");

const RESERVAS_URL = process.env.RESERVAS_SERVICE_URL;

const getReservas = () => axios.get(`${RESERVAS_URL}/api/reservas`);

module.exports = { getReservas };