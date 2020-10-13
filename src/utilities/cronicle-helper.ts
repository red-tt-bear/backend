// https://github.com/jhuckaby/Cronicle#api-reference
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import * as path from 'path';
import * as moment from 'moment';
import * as _ from 'lodash';

const BASE_PATH = '/api/app/';
const API_VERSION_PATH = '/v1/';
const CREATE_EVENT_ENDPOINT = path.posix.join(BASE_PATH, '/create_event/', API_VERSION_PATH);
const GET_SCHEDULES_ENDPOINT = path.posix.join(BASE_PATH, '/get_schedule/', API_VERSION_PATH);
const GET_EVENT_ENDPOINT = path.posix.join(BASE_PATH, '/get_event/', API_VERSION_PATH);
const DELETE_EVENT_ENDPOINT = path.posix.join(BASE_PATH, '/delete_event/', API_VERSION_PATH);

export interface CronicleHelperConfigurations {
    apiKey: string;
    baseURL?: string;
};

export enum CroniclePlugins {
    HTTP_REQUEST= 'urlplug'
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace CronicleConstants {
    export const GENERAL_CATEGORY = 'general';
    export const TARGET_ALL = 'allgrp';
};

export enum HttpMethod {
    GET = 'GET',
    POST = 'POST',
}

export interface CronicleHttpRequestParams {
    method: HttpMethod;
    url: string;
    headers?: string;
    data?: string;
    timeout?: number;
    ssl_cert_bypass?: boolean;
    success_match?: boolean;
    follow?: boolean;
};


type CronicleTiming = {
    days?: Array<number>;
    hours?: Array<number>;
    minutes?: Array<number>;
    months?: Array<number>;
    years?: Array<number>;
    weekdays?: Array<number>;
}

interface CronicleJob {
    id?: string;
    title: string;
    enabled: boolean;
    category?: string;
    // plugin cannot have spaces
    // if not found the plugin is set to none
    // cannot be empty string either
    plugin: CroniclePlugins | string;
    target?: string;
    timing: CronicleTiming | moment.Moment | Date;
    params: CronicleHttpRequestParams;
    timezone?: string;
}


interface GetEventOptions {
    id?: string;
    title?: string;
}

type DeleteEventOptions = GetEventOptions;

const momentToCronicleTiming = (theMoment: moment.Moment): CronicleTiming => {
    theMoment.utc();
    return {
        days: [theMoment.date()],
        hours: [theMoment.hour()],
        minutes: [theMoment.minute()],
        months: [theMoment.month() + 1],
        // weekdays: [theMoment.day()],
        years: [theMoment.year()],
    };
};

const convertToCronicleTiming = (arg: CronicleTiming | moment.Moment | Date): CronicleTiming => {
    // if (typeof arg === typeof CronicleTiming) {
    //     return arg;
    // } else if (arg instanceof moment.Moment) {
    //     return momentToCronicleTiming(arg);
    // } else if (arg instanceof Date) {
    //     return momentToCronicleTiming(arg.toMoment());
    // } else {
    //     throw new Error('Invalid type in convertToCronicleTiming');
    // }
    if (moment.isMoment(arg)) {
        return momentToCronicleTiming(arg);
    } else if (arg instanceof Date) {
        return momentToCronicleTiming(arg.toMoment());
    } else {
        return arg;
    }

};

export class CronicleHelper {
    private readonly apiKey: string;
    private readonly axios: AxiosInstance;
    
    constructor({
        apiKey,
        baseURL = 'http://localhost:3012'
    }: CronicleHelperConfigurations) {
        this.apiKey = apiKey;
        this.axios = axios.create({
            baseURL: baseURL,
            responseType: 'json',
        });
    }

    getJobs = async (): Promise<AxiosResponse<unknown>> => {
        const result = await this.axios.get(GET_SCHEDULES_ENDPOINT, {
            headers: {
                'X-API-Key': this.apiKey
            }
        });
        return result;
    }

    getEvent = async ({
        id,
        title
    }: GetEventOptions): Promise<AxiosResponse<unknown>> => {
        const result = await this.axios.get(GET_EVENT_ENDPOINT, {
            headers: {
                'X-API-Key': this.apiKey
            },
            params: {
                id,
                title
            }
        });
        return result;
    }

    deleteEvent = async ({
        id,
        title
    }: DeleteEventOptions): Promise<Array<AxiosResponse<unknown>>> => {
        const results: Array<AxiosResponse<unknown>> = [];
        const schedule = await this.getJobs();
        await ((schedule.data as any).rows as Array<CronicleJob>).asyncForEach(async(event: CronicleJob) => {
            if (event.title === title || event.id === id) {
                const result = await this.axios.post(DELETE_EVENT_ENDPOINT, {
                    id,
                    title
                }, {
                    headers: {
                        'X-API-Key': this.apiKey
                    },
                });
                results.push(result);
            }
        });

        return results;
    }

    
    deleteAll = async (): Promise<Array<AxiosResponse<unknown>>> => {
        const results: Array<AxiosResponse<unknown>> = [];
        const schedule = await this.getJobs();
        await ((schedule.data as any).rows as Array<CronicleJob>).asyncForEach(async(event: CronicleJob, index: number) => {
            const result = await this.axios.post(DELETE_EVENT_ENDPOINT, {
                id: event.id,
            }, {
                headers: {
                    'X-API-Key': this.apiKey
                },
            });

            console.log(`DELETED ${index}`);

            results.push(result);
        });

        return results;
    }

    createJob = async ({
        category = CronicleConstants.GENERAL_CATEGORY,
        enabled,
        plugin,
        title,
        target  = CronicleConstants.TARGET_ALL,
        timing,
        params: {
            method,
            url,
            data = '',
            follow = false,
            headers = 'User-Agent: Cronicle/1.0',
            // eslint-disable-next-line @typescript-eslint/camelcase
            ssl_cert_bypass = false,
            // eslint-disable-next-line @typescript-eslint/camelcase
            success_match = false,
            timeout = 30
        }
    }: CronicleJob): Promise<AxiosResponse<unknown>> => {
        const timezone = 'UTC';
        const transformedTiming = convertToCronicleTiming(timing);
        const result = await this.axios.post(CREATE_EVENT_ENDPOINT, {
            category: category,
            enabled: Number(enabled),
            plugin: plugin,
            title: title,
            target: target,
            timing: transformedTiming,
            timezone: timezone,
            params: {
                method: method,
                url: url,
                data: data,
                follow: Number(follow),
                headers: headers,
                // eslint-disable-next-line @typescript-eslint/camelcase
                ssl_cert_bypass: Number(ssl_cert_bypass),
                // eslint-disable-next-line @typescript-eslint/camelcase
                success_match: Number(success_match),
                timeout: timeout
            }
        }, {
            headers: {
                'X-API-Key': this.apiKey
            }
        });
        return result;
    }
}

const cronicleHelper = new CronicleHelper({
    // apiKey: 'b85363e0f3876895b02b2dc630f09626'
    apiKey: '9cb638fda0429506a2a6afd23accaa52',
    baseURL: 'http://ec2-18-223-247-120.us-east-2.compute.amazonaws.com:3012'
});
export default cronicleHelper;
