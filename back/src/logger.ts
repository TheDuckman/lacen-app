/* eslint-disable prefer-rest-params */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from "express";
import { createLogger, format, transports } from "winston";

const BLUE = "\x1b[1;36m";
const GREY = "\x1b[1;37m";
const NC = "\x1b[0m";

const myFormat = format.printf((stuff) => {
  const { level, message, metadata } = stuff as any; // typescript error fix
  let msg = `${level} - [${GREY}${metadata.statusCode} ${message}${NC}] : ${BLUE}${metadata.method}${NC} ${metadata.url}`;
  if (metadata.statusCode >= 400) {
    msg = `${msg}\n\t${String.fromCodePoint(0x1f4ac)} "${metadata.apiMessage}"`;
  }
  return msg;
});
const requestLogger = createLogger({
  format: format.combine(
    format.json(),
    format.metadata(),
    // format.timestamp(),
    format.colorize(),
    myFormat,
  ),
  transports: [new transports.Console()],
});

const logger = (req: Request, res: Response, next: NextFunction): void => {
  if (process.env.NODE_ENV === "test") {
    next();
    return;
  }
  // Get request body when status code >= 400
  let body: string;
  const chunks = [];

  const originalWrite = res.write;
  res.write = function (chunk) {
    if (res.statusCode < 400) {
      return originalWrite.apply(res, arguments);
    }
    chunks.push(chunk);
    return originalWrite.apply(res, arguments);
  };

  const originalEnd = res.end;
  res.end = function (chunk) {
    if (res.statusCode < 400) {
      originalEnd.apply(res, arguments);
      return;
    }
    if (chunk) {
      chunks.push(chunk);
    }
    if (chunks.length > 0) {
      if (Buffer.isBuffer(chunk[0])) {
        body = Buffer.concat(chunks).toString("utf8");
      } else {
        body = `${body}${chunks}`;
      }
    }

    originalEnd.apply(res, arguments);
  } as any;

  // Handler
  const infoFn = () => {
    let level = "info";
    if (res.statusCode >= 500) {
      level = "error";
    } else if (res.statusCode >= 400) {
      level = "warn";
    }
    requestLogger.log({
      level,
      method: req.method,
      url: req.originalUrl,
      responseTime: res.getHeader("x-response-time"),
      statusCode: res.statusCode,
      message: res.statusMessage,
      apiMessage: body,
    });
  };

  // Listener
  res.on("finish", infoFn);

  // Go to next middleware
  next();
};

export default logger;
