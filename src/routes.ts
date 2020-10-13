// This file is just an aggregation of passing the routes to the router
/* eslint-disable @typescript-eslint/no-var-requires */
import express = require('express');
const router = express.Router();

router.use('/users', require('./features/users/user-route'));
router.use('/courses', require('./features/courses/course-route'));
router.use('/health', require('./features/health/health-route'));
router.use('/curriculum', require('./features/curriculum/curriculum-route'));
router.use('/support', require('./features/support/support-route'));


import expressAsyncHandler = require('express-async-handler');
import cronicleHelper, {CronicleConstants, CroniclePlugins, HttpMethod} from './utilities/cronicle-helper';
import * as moment from 'moment';
router.all('/create', 
expressAsyncHandler(async (req: any, res: any, next: any) => {
    let result: unknown; 
    const timing = moment().add(req.query.minutes ? parseInt(req.query.minutes) : 1, 'minutes');
    const title = req.query.title || new Date().toString();
    try {
        const resp = await cronicleHelper.createJob({
            // category: CronicleConstants.GENERAL_CATEGORY,
            plugin: CroniclePlugins.HTTP_REQUEST,
            enabled: true,
            title: title,
            // target: 'luigi-virtualbox',
            timing: timing,
            params: {
                method: HttpMethod.POST,
                url: 'http://localhost:3001/backend-api/hook',
                data: JSON.stringify({
                    data: req.query.data,
                    timing: timing,
                    title: title
                })
            }
        });
        result = resp.data;
    } catch (e) {
        result = e.message;
    }
    res.json({
        timing,
        title,
        result,
    });
}));

router.all('/getAll', 
expressAsyncHandler(async (req: any, res: any, next: any) => {
    let result: unknown; 
    const title = req.query.title || new Date().toString();
    try {
        const resp = await cronicleHelper.getJobs();
        result = resp.data;
    } catch (e) {
        result = e.message;
    }
    res.json({
        title,
        result,
    });
}));

router.all('/get', 
expressAsyncHandler(async (req: any, res: any, next: any) => {
    let result: unknown; 
    const title = req.query.title || new Date().toString();
    try {
        const resp = await cronicleHelper.getEvent({
            title: title,
        });
        result = resp.data;
    } catch (e) {
        result = e.message;
    }
    res.json({
        title,
        result,
    });
}));

router.all('/delete', 
expressAsyncHandler(async (req: any, res: any, next: any) => {
    let result: unknown; 
    const title = req.query.title || new Date().toString();
    try {
        const resp = await cronicleHelper.deleteEvent({
            title: title,
        });
        result = resp.map(resp => resp.data);
    } catch (e) {
        result = e.message;
    }
    res.json({
        title,
        result,
    });
}));

router.all('/hook', (req: any, res: any, next: any) => {
    console.log('hook hit!');
    console.log(new Date());
    console.log(req.body);
    res.send('success');
});

module.exports = router;
