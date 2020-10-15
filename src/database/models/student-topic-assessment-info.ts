import { Model, DataTypes, BelongsToGetAssociationMixin, HasManyGetAssociationsMixin } from 'sequelize';
import appSequelize from '../app-sequelize';

interface StudentTopicAssessmentInfoInterface {
    id: number;
    topicAssessmentInfoId: number;
    userId: number;
    startTime: Date;
    endTime: Date;
    nextVersionAvailableTime: Date;
    numAttempts: number;
    maxAttempts: number;
    active: boolean;
}

export default class StudentTopicAssessmentInfo extends Model implements StudentTopicAssessmentInfoInterface {
    public id!: number;
    public topicAssessmentInfoId!: number;
    public userId!: number;
    public startTime!: Date;
    public endTime!: Date;
    public nextVersionAvailableTime!: Date;
    public numAttempts!: number;
    public maxAttempts!: number;
    public active!: boolean;

    public getUser!: BelongsToGetAssociationMixin<User>;
    public getTopicAssessmentInfo!: BelongsToGetAssociationMixin<TopicAssessmentInfo>;
    public getStudentGradeInstances!: HasManyGetAssociationsMixin<StudentGradeInstance>;

    // timestamps!
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    static constraints = {
    }

    static createAssociations(): void {
        // This is a hack to add the associations later to avoid cyclic dependencies
        /* eslint-disable @typescript-eslint/no-use-before-define */
        StudentTopicAssessmentInfo.belongsTo(TopicAssessmentInfo, {
            foreignKey: 'topicAssessmentInfoId',
            targetKey: 'id',
            as: 'topicAssessmentInfo'
        });

        StudentTopicAssessmentInfo.belongsTo(User, {
            foreignKey: 'userId',
            targetKey: 'id',
            as: 'user'
        });

        StudentTopicAssessmentInfo.hasMany(StudentGradeInstance, {
            foreignKey: 'studentTopicAssessmentInfoId',
            sourceKey: 'id',
            as: 'studentGradeInstances'
        });
        /* eslint-enable @typescript-eslint/no-use-before-define */
    }
}

StudentTopicAssessmentInfo.init({
    id: {
        field: 'student_topic_assessment_info_id',
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    topicAssessmentInfoId: {
        field: 'topic_assessment_info_id',
        type: DataTypes.INTEGER,
        allowNull: false
    },
    userId: {
        field: 'user_id',
        type: DataTypes.INTEGER,
        allowNull: false
    },
    startDate: {
        field: 'student_topic_assessment_info_start_date',
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: appSequelize.literal('NOW()')
    },
    endDate: {
        field: 'student_topic_assessment_info_end_date',
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: appSequelize.literal('NOW()')
    },
    nextVersionAvailableTime: {
        field: 'student_topic_assessment_info_next_version_date',
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: appSequelize.literal('NOW()')
    },
    numAttempts: {
        field: 'student_topic_assessment_info_num_attempts',
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    maxAttempts: {
        field: 'student_topic_assessment_info_num_attempts',
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    active: {
        field: 'student_topic_assessment_info_active',
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
}, {
    tableName: 'student_topic_assessment_info',
    sequelize: appSequelize, // this bit is important
});

import User from './user';
import StudentGradeInstance from './student-grade-instance';
import TopicAssessmentInfo from './topic-assessment-info';
