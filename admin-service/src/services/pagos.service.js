const axios = require("axios");

const PAGOS_URL = process.env.PAGOS_SERVICE_URL;

const getPagos = () => axios.get(`${PAGOS_URL}/api/pagos`);

module.exports = { getPagos };