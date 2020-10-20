const axios = require('axios');


module.exports.doRequest = async (config) => {
    return await axios.request(config);
};