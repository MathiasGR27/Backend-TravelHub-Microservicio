const axios = require("axios");

const obtenerVuelo = async (id) => {
  const { data } = await axios.get(
    `${process.env.VUELOS_SERVICE_URL}/api/vuelos/${id}`
  );

  return data;
};

module.exports = {
  obtenerVuelo,
};