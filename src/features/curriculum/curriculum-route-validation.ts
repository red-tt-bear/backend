import * as Joi from 'joi';

export const createCurriculumValidation = {
    body: {
        name: Joi.string().required(),
        subject: Joi.string().required(),
        comment: Joi.string().required(),
        active: Joi.boolean().optional().default(true),
        public: Joi.boolean().optional().default(true),
        // university is assumed
    }
}

export const createCurriculumUnitValidation = {
    body: {
        name: Joi.string().required(),
        active: Joi.boolean().optional().default(true),
        curriculumId: Joi.number().required(),
    }
}

export const createCurriculumTopicValidation = {
    body: {
        name: Joi.string().required(),
        active: Joi.boolean().optional().default(true),
        curriculumUnitId: Joi.number().required(),
    }
}

export const createCurriculumTopicQuestionValidation = {
    body: {
        problemNumber: Joi.number().required(),
        webworkQuestionPath: Joi.string().required(),
        curriculumTopicContentId: Joi.number().required(),
    }
}

export const getCurriculumValidation = {
    params: {
        id: Joi.number().required(),
    }
}