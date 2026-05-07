import express from 'express';
import http from 'http';
import {Server, Socket} from 'socket.io';
import {Op} from 'sequelize';
import {initDatabase, closeDatabase} from "./db/database";
import Task, {TaskCreationAttributes} from "./models/task.model";

const app = express();
const server = http.createServer(app);
const PORT = 3000

app.use(express.json());

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

interface CreateTaskPayload {
    title: string;
    description?: string;
    deadlineAt: Date;
    priority?: TaskCreationAttributes['priority'];
}

interface UpdateTaskPayload {
    id: number;
    status: boolean;
}

interface GetAllTasksCallback {
    (response:
     {
         success: boolean;
         tasks?: Task[];
         error?: string
     }): void;
}

interface CreateTaskCallback {
    (response:
     {
         success: boolean;
         task?: Task;
         error?: string
     }): void;
}

io.on("connection", (socket: Socket) => {
    console.log('User connected', socket.id);

    socket.on('createTask', async (payload: CreateTaskPayload, callback?: CreateTaskCallback) => {
        try {
            const {title, description, deadlineAt, priority} = payload;
            if (!title || !deadlineAt) {
                const errorMsg = 'Title and deadline are required';
                if (callback) callback({success: false, error: errorMsg});
                return;
            }
            const task = await Task.create({
                title,
                description,
                deadlineAt,
                priority,
            });
            io.emit("taskCreated", task);
            if (callback) callback({success: true, task});
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Internal server error';
            console.error(`Task creation error for payload ${JSON.stringify(payload)}:`, errorMsg);
            if (callback) callback({success: false, error: errorMsg});
        }
    });

    socket.on('getAllTasks', async (callback?: GetAllTasksCallback) => {
        try {
            const tasks = await Task.findAll({raw: true});
            if (callback) callback({success: true, tasks});
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Internal server error';
            console.error('Get all tasks error:', errorMsg);
            if (callback) callback({success: false, error: errorMsg});
        }
    });

    socket.on('getDoneTasks', async (callback?: GetAllTasksCallback) => {
        try {
            const tasks = await Task.findAll({where: {status: true}, raw: true});
            if (callback) callback({success: true, tasks});
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Internal server error';
            console.error('Get done tasks error:', errorMsg);
            if (callback) callback({success: false, error: errorMsg});
        }
    })

    socket.on('getOverdueTasks', async (callback?: GetAllTasksCallback) => {
        try {
            const today = new Date().toISOString().split('T')[0];
            const tasks = await Task.findAll({
                where: {status: false, deadlineAt: {[Op.lt]: today}}, raw: true
            });
            if (callback) callback({success: true, tasks});
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Internal server error';
            console.error('Get overdue tasks error:', errorMsg);
            if (callback) callback({success: false, error: errorMsg});
        }
    })

    socket.on('updateTaskStatus', async (payload: UpdateTaskPayload, callback?: GetAllTasksCallback) => {
        try {
            const {id, status} = payload;
            const task = await Task.findByPk(id);
            if (!task) {
                if (callback) callback({success: false, error: 'Задача не найдена'});
                return;
            }
            task.status = status;
            await task.save();
            io.emit('taskUpdated', task.toJSON());
            if (callback) callback({success: true});
        } catch (error) {
            const errMsg = error instanceof Error ? error.message : 'Internal server error';
            if (callback) callback({success: false, error: errMsg});
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected', socket.id);
    });
});

(async () => {
    try {
        await initDatabase();
        server.listen(PORT, () => {
            console.log(`Server starts on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
    }
})();

process.on('SIGINT', async () => {
    await closeDatabase();
    process.exit(0);
});