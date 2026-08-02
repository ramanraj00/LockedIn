let cacheStore = {};
const TTL_MS = 60000; // 60 seconds

function getCache(key) {
    const entry = cacheStore[key];
    if (entry && (Date.now() - entry.timestamp < TTL_MS)) {
        return entry.data;
    }
    return null;
}

function setCache(key, data) {
    cacheStore[key] = {
        data: data,
        timestamp: Date.now()
    };
}

function invalidateCache(key) {
    if (key) {
        delete cacheStore[key];
    } else {
        cacheStore = {};
    }
}

module.exports = { getCache, setCache, invalidateCache };
