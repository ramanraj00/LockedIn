const bcrypt = require('bcrypt');
const hash = '$2b$10$7T58asxofTWm3yQ4nMwT0.M8HJGjzwY3M6TEqdD9O9fTmhrqpHxrG';
bcrypt.compare('Chodu420#', hash).then(console.log);
