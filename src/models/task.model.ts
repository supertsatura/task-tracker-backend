// Creating a model

import {DataTypes, Model, Optional} from 'sequelize';
import {sequelize} from '../db/database';

// Enum for priority field
export enum TaskPriority {
    Low = 'Низкая',
    Medium = 'Средняя',
    High = 'Высокая'
}

// 1. Interface describing ALL model attributes
export interface TaskAttributes {
    id: number;
    title: string;
    description?: string | null;
    deadlineAt: Date;
    priority: TaskPriority;
    status: boolean;
    completedAt?: Date | null;
}

// 2. Attributes required for creation
export type TaskCreationAttributes = Optional<TaskAttributes, 'id' | 'description' | 'priority' | 'status' | 'completedAt'>;

// 3. Sequelize Model class
export class Task
    extends Model<TaskAttributes, TaskCreationAttributes> implements TaskAttributes {
    public id!: number;
    public title!: string;
    public description?: string | null;
    public deadlineAt!: Date;
    public priority!: TaskPriority;
    public status!: boolean;
    public completedAt?: Date | null;

    // timestamps added by Sequelize
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

// 4. Model initialization
Task.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
            comment: 'Task identifier',
        },

        title: {
            type: DataTypes.TEXT,
            allowNull: false,

            validate: {
                notEmpty: {
                    msg: 'Field cannot be empty',
                },
            },

            comment: 'Task title',
        },

        description: {
            type: DataTypes.TEXT,
            allowNull: true,
            defaultValue: null,

            validate: {
                len: {
                    args: [1, 1000],
                    msg: 'Too many characters',
                },
            },

            comment: 'Task description',
        },

        deadlineAt: {
            type: DataTypes.DATEONLY,
            allowNull: false,

            validate: {
                isDate: {
                    args: true,
                    msg: 'Value must be a date'
                },
            },

            comment: 'Task deadline',
        },

        priority: {
            type: DataTypes.ENUM(...Object.values(TaskPriority)),
            allowNull: true,
            defaultValue: TaskPriority.Medium,

            // Sequelize validation
            validate: {
                isIn: {
                    args: [Object.values(TaskPriority)],
                    msg: 'Priority must be one of: ' + Object.values(TaskPriority).join(', '),
                },
            },

            comment: 'Task priority',
        },

        status: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false,
            comment: 'Task completion status',
        },

        completedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: null,
            comment: 'Completion date',
        },
    },
    {
        sequelize,
        tableName: 'tasks',
        underscored: true,
        timestamps: true,
        hooks: {
            beforeUpdate: async (task) => {
                if (task.changed('status')) {
                    task.completedAt = task.status ? new Date() : null;
                }
            },
        },
    }
);

export default Task;