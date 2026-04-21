import express from 'express';
import http from 'http';
import {Server, Socket} from 'socket.io';
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
    description: string;
    deadlineAt: Date;
    comment?: string;
    priority?: TaskCreationAttributes['priority'];
}

interface CreateTaskCallback {
    (response: { success: boolean; task?: Task; error?: string }): void;
}

io.on("connection", (socket: Socket) => {
    console.log('User connected', socket.id);
    socket.emit('serverMessage', 'Connection is successful');
    socket.on('createTask', async (payload: CreateTaskPayload, callback?: CreateTaskCallback) => {
        try {
            const {description, deadlineAt, comment, priority} = payload;
            if (!description || !deadlineAt) {
                const errorMsg = 'Description and deadline are required';
                socket.emit('taskCreationError', {success: false, error: errorMsg});
                if (callback) callback({success: false, error: errorMsg});
                return;
            }
            const task = await Task.create({
                description,
                deadlineAt,
                comment,
                priority,
            });
            socket.emit('taskCreated', task);
            if (callback) callback({success: true, task});
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Internal server error';
            console.error(`Task creation error for payload ${JSON.stringify(payload)}:`, errorMsg);
            socket.emit('taskCreationError', {success: false, error: errorMsg});
            if (callback) callback({success: false, error: errorMsg});
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
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