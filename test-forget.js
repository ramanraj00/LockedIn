const axios = require('axios');
axios.post('http://localhost:3000/api/auth/forgetPassword', { email: 'test@example.com' })
  .then(res => console.log('SUCCESS:', res.data))
  .catch(err => console.error('ERROR:', err.response ? err.response.data : err.message));
