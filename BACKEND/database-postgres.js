import { sql } from "./db.js"
import { randomUUID } from "node:crypto";
import bcrypt from 'bcryptjs';


export class databasePostgres {

    async createTask(userId, title, description, status, priority, position) {
        const id = randomUUID();
        await sql`
            INSERT INTO todos (id, user_id, title, description, status, priority, position, archieved)
            VALUES (${id}, ${userId}, ${title}, ${description}, ${status}, ${priority}, ${position}, false)
        `;
        return id;
    }

    async getTaskById(id) {
        const result = await sql`
            SELECT * FROM todos WHERE id = ${id}
        `;
        return result[0];
    }

    async getTasksByUserId(userId) {
        return await sql`
            SELECT * FROM todos WHERE user_id = ${userId} AND archieved = false ORDER BY position ASC
        `;
    }

    async getArchivedTasks(userId) {
        return await sql`
            SELECT * FROM todos WHERE user_id = ${userId} AND archieved = true ORDER BY updated_at DESC
        `;
    }

    async updateTask(id, title, description, status, priority, position) {
        await sql`
            UPDATE todos
            SET title = ${title}, description = ${description}, status = ${status},
                priority = ${priority}, position = ${position}, updated_at = CURRENT_TIMESTAMP
            WHERE id = ${id}
        `;
    }

    async archiveTask(id) {
        await sql`
            UPDATE todos SET archieved = true, updated_at = CURRENT_TIMESTAMP WHERE id = ${id}
        `;
    }

    async unarchiveTask(id) {
        await sql`
            UPDATE todos SET archieved = false, status = 'done', updated_at = CURRENT_TIMESTAMP WHERE id = ${id}
        `;
    }

    async deleteTask(id) {
        await sql`
            DELETE FROM todos WHERE id = ${id}
        `;
    }

    async updateTasksOrder(tasks) {
        for (const task of tasks) {
            await sql`
                UPDATE todos
                SET position = ${task.position}, status = ${task.status}, updated_at = CURRENT_TIMESTAMP
                WHERE id = ${task.id}
            `;
        }
    }

    async createUser(name, email, password) {
        const id = randomUUID();
        const password_hash = await bcrypt.hash(password, 10);

        await sql`
            INSERT INTO users (id, name, email, password_hash)
            VALUES (${id}, ${name}, ${email}, ${password_hash})
        `;
        return id;
    }

    async getUserByEmail(email) {
        const user = await sql`
            SELECT * FROM users WHERE email = ${email}
        `;
        return user[0];
    }

    async getUserById(id) {
        const user = await sql`
            SELECT id, name, email, dark_mode FROM users WHERE id = ${id}
        `;
        return user[0];
    }

    async updateUser(id, name, email, password) {
        const password_hash = await bcrypt.hash(password, 10);
        await sql`
            UPDATE users
            SET name = ${name}, email = ${email}, password_hash = ${password_hash}
            WHERE id = ${id}
        `;
    }

    async loginUser(email, password) {
        const user = await this.getUserByEmail(email);
        if (!user) return null;
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) return null;
        return user;
    }

    async updateTheme(userId, darkMode) {
        await sql`
            UPDATE users
            SET dark_mode = ${darkMode}
            WHERE id = ${userId}
        `;
    }
}
