const axios = require("axios");

const obtenerUsuario = async (id) => {
  const { data } = await axios.get(
    `${process.env.AUTH_SERVICE_URL}/api/usuarios/${id}`
  );

  return data;
};

module.exports = {
  obtenerUsuario,
};