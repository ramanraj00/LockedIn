const mongoose = require("mongoose");
const logger = require("../utils/logger");

async function connectDb(){
   try{
    await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 50,
    });
    logger.info("DB connected");
  } catch(err){
    logger.error("DB connection failed", err);
    process.exit(1);
  }
}

mongoose.plugin((schema) => {
    schema.pre(/^find|update|save|deleteOne|deleteMany|aggregate/, function () {
        this._startTime = Date.now();
    });
    schema.post(/^find|update|save|deleteOne|deleteMany|aggregate/, function (res, next) {
        if (this._startTime) {
            const duration = Date.now() - this._startTime;
            if (duration > 300) {
                logger.warn(`[Slow Query] ${this?.model?.modelName || 'Unknown'} operation took ${duration}ms`);
            }
        }
        if (typeof next === 'function') next();
    });
});

mongoose.connection.on('disconnected', () => {
    logger.warn('Mongoose connection disconnected');
});

module.exports = { mongoose, connectDb };