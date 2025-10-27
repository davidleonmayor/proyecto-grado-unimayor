import { rateLimit } from "express-rate-limit";

// const limiter = rateLimit({
//   windowMs: 60 * 1000, // 1 minute
//   limit: 300, // Limit each IP to 300 requests per `window` (here, per 1 minute).
//   message: {
//     error: "You have exceeded the limit of requests",
//   },
//   standardHeaders: "draft-8", // draft-6: `RateLimit-*` headers; draft-7 & -draft-8: combined `RateLimit` header
//   legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
//   // store: ... , // Redis, Memcached, etc. See below.
// });

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    limit: 15, // solo 5 intentos cada 15 minutos // TODO: just 5 atemps
    message: {
        error: "Too many authentication attempts, please try again later",
    },
    standardHeaders: "draft-8",
    legacyHeaders: false,
    skipSuccessfulRequests: true, // no contar requests exitosos
});

// export { limiter, authLimiter };
export { authLimiter };
