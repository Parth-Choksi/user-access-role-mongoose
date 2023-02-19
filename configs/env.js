const dotenv = require('dotenv').config({ path: `${process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : '.env'}` });
console.log("dotenv", dotenv);
