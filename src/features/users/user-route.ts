import { Request, Response } from "express";
import configurations from '../../configurations';
import userController from "./user-controller";
const router = require('express').Router();

router.post('/login',
    // TODO add req validation
    // TODO add passport auth
    (req: Request, res: Response) => {
        const MILLIS_PER_HOUR = 3600000;
        const cookieOptions = {
            maxAge: MILLIS_PER_HOUR // TODO add a configuration for session life
        };
        res.cookie('sessionToken', 'test', cookieOptions);
        return res.status(200).json({}); // TODO create a response
    });

router.post('/register',
// TODO add req validation
// TODO add passport auth
async (req: Request, res: Response) => {
    const baseUrl = `${req.protocol}://${req.get('host')}/${configurations.server.basePath}`;
    const newUser = await userController.registerUser({
        userObject: req.body,
        baseUrl
    });
    return res.status(200).json(newUser); // TODO create a response
});

router.get('/verify',
// TODO add req validation
// TODO add passport auth
(req: Request, res: Response) => {
    return res.status(200).json({}); // TODO create a response
});

module.exports = router;