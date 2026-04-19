// const {DataTypes} = require('sequelize');
// const sequelize = require('../db/database');
//
// const TaskModel = sequelize.define('Task', {
//     id: {
//         type: DataTypes.INTEGER,
//         primaryKey: true,
//         autoIncrement: true,
//         allowNull: false,
//         comment: 'Идентификатор задачи'
//     },
//     name: {
//         type: DataTypes.ENUM('Низкая', 'Средняя', 'Высокая', 'Очень высокая'),
//         allowNull: true,
//         defaultValue: 'low',
//         validate: {
//             args: [['Низкая', 'Средняя', 'Высокая', 'Очень высокая']],
//             msg: 'Срочность должна быть: Низкая, Средняя, Высокая, Очень высокая'
//         },
//         comment: 'Степень срочности задачи.'
//     },
//     description: {
//         type: DataTypes.TEXT,
//         allowNull: false,
//         validate: {
//             notEmpty: {
//                 msg: 'Данное поле не может быть пустым.'
//             }
//         },
//         comment: 'Описание задачи'
//     },
//     comment: {
//         type: DataTypes.TEXT,
//         allowNull: true,
//         defaultValue: null,
//         validate: {
//             len: [1, 1000],
//             msg: 'Слишком много символов.'
//         },
//         comment: 'Комментарий к задаче.'
//     },
//     status: {
//         type: DataTypes.BOOLEAN,
//         allowNull: false,
//         defaultValue: false,
//         comment: 'Статус выполнения задачи: выполнено/не выполнено.'
//     },
//     deadline: {
//         type: DataTypes.DATE,
//         allowNull: false,
//         validate: {
//             msg: {
//                 isDate: {
//                     msg: 'Данное поле должно представлять значение даты.'
//                 },
//                 isFuture(date_value) {
//                     if (date_value < new Date()) {
//                         throw new Error('Невозможно создать задачу с прошедшей датой.')
//                     }
//                 }
//             }
//         },
//         comment: 'Срок задачи.'
//     },
//     dateOfComplete: {
//         type: DataTypes.DATE,
//         allowNull: true,
//         defaultValue: null,
//         comment: 'Когда была выполнена задача.'
//     }
// }, {
//     tableName: 'tasks',
//     underscored: true,
//     timestamps: true,
//     getterMethods: {
//         isOver() {
//             return !this.status && this.deadline < new Date();
//         },
//         isDone() {
//             if (this.status) return 'Задача выполнена в срок.'
//             if (this.isOver) return 'Задача просрочена.'
//             return 'Задача в работе.';
//         },
//         formattedDeadline() {
//             return this.deadline.toLocaleDateString('ru-RU', {
//                 year: 'numeric',
//                 month: 'long',
//                 day: 'numeric',
//                 hour: '2-digit',
//                 minute: '2-digit'
//             });
//         }
//     },
//     hooks: {
//         beforeUpdate(task) {
//             if (task.changed('status') && task.status === true) {
//                 task.dateOfComplete = new Date();
//             }
//             if (task.changed('status') && task.status === false) {
//                 task.dateOfComplete = null;
//             }
//         }
//     },
// })
//
// module.exports = TaskModel;

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
    description: string;
    deadlineAt: Date;
    comment?: string | null;
    priority: TaskPriority;
    status: boolean;
    completedAt?: Date | null;
}

// 2. Attributes required for creation
export type TaskCreationAttributes = Optional<TaskAttributes, 'id' | 'comment' | 'priority' | 'status' | 'completedAt'>;

// 3. Sequelize Model class
export class Task
    extends Model<TaskAttributes, TaskCreationAttributes> implements TaskAttributes {
    public id!: number;
    public description!: string;
    public deadlineAt!: Date;
    public comment?: string | null;
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

        description: {
            type: DataTypes.TEXT,
            allowNull: false,

            validate: {
                notEmpty: {
                    msg: 'Field cannot be empty',
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

        comment: {
            type: DataTypes.TEXT,
            allowNull: true,
            defaultValue: null,

            validate: {
                len: {
                    args: [1, 1000],
                    msg: 'Too many characters',
                },
            },

            comment: 'Task comment',
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