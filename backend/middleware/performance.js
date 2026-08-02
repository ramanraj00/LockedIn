const logger = require("../utils/logger");

const performanceMiddleware = (req, res, next) => {
    const start = process.hrtime();

    res.on("finish", () => {
        const diff = process.hrtime(start);
        const timeMs = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);
        
        logger.info(`[Performance] ${req.method} ${req.originalUrl} - ${timeMs}ms`);
    });

    next();
};

module.exports = performanceMiddleware;
