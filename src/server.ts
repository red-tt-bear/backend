import configurations from './configurations';
import logger from './utilities/logger';
import bodyParser = require('body-parser');
import cookieParser = require('cookie-parser');
// Switching to import caused errors
// eslint-disable-next-line @typescript-eslint/no-var-requires
const router = require('./routes');

import express = require('express');
import { Request, Response, NextFunction } from 'express';

import morgan = require('morgan');
import passport = require('passport');
import rateLimit = require('express-rate-limit');
import Boom = require('boom');
import AlreadyExistsError from './exceptions/already-exists-error';
import NotFoundError from './exceptions/not-found-error';

interface ErrorResponse {
    statusCode: number;
    status: string;
    rederlyReference: string;
    error?: unknown;
}

const { port, basePath } = configurations.server;

const {
    windowLength,
    maxRequests
} = configurations.server.limiter;

const app = express();
app.use(morgan('dev', {
    stream: {
        write: (message): void => {
            logger.info(message);
        }
    }
}));

const limiter = rateLimit({
    windowMs: windowLength,
    max: maxRequests,
    handler: (req, res, next) => next(Boom.tooManyRequests())
});

app.use(limiter);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(passport.initialize());

app.use(basePath, router);


// General Exception Handler
// next is a required parameter, without having it requests result in a response of object
// TODO: err is Boom | Error | any, the any is errors that we have to define
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
app.use((obj: any, req: Request, res: Response, next: NextFunction) => {
    if (obj instanceof AlreadyExistsError || obj instanceof NotFoundError) {
        next(Boom.badRequest(obj.message));
    } else {
        next(obj);
    }
});

// General Exception Handler
// next is a required parameter, without having it requests result in a response of object
// TODO: err is Boom | Error | any, the any is errors that we have to define
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
app.use((obj: any, req: Request, res: Response, next: NextFunction) => {
    if (obj.output) {
        return res.status(obj.output.statusCode).json(obj.output.payload);
    }
    else if (obj.statusCode) {
        return res.status(obj.statusCode).json(obj);
    } else if (obj.status) {
        return res.status(obj.status).json(obj);
    } else {
        const rederlyReference = `rederly-reference-${new Date().getTime()}-${Math.floor(Math.random() * 1000000)}`;
        logger.error(`${rederlyReference} - ${obj.stack}`);
        const data: ErrorResponse = {
            statusCode: 500,
            status: 'Interal Server Error',
            rederlyReference
        };

        if (process.env.NODE_ENV !== 'production') {
            data.error = obj;
        }

        return res.status(data.statusCode).json(data);
    }
});

export const listen = (): Promise<null> => {
    return new Promise((resolve) => {
        app.listen(port, () => {
            logger.info(`Server started up and listening on port: ${port}`);
            resolve();
        });
    });
};
