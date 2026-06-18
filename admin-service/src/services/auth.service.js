const axios = require("axios");

const AUTH_URL = process.env.AUTH_SERVICE_URL;

const getUsuarios = () => axios.get(`${AUTH_URL}/api/usuarios`);
const getUsuario = (id) => axios.get(`${AUTH_URL}/api/usuarios/${id}`);

module.exports = { getUsuarios, getUsuario };