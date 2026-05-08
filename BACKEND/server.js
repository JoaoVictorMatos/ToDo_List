import fastify from "fastify";
import jwt from "@fastify/jwt";
import cors from "@fastify/cors";
import 'dotenv/config'; // Carrega o arquivo .env
import { databasePostgres } from "./database-postgres.js";
import { createUserSchema } from "./schema.js";
import { z } from "zod";

const server = fastify({ logger: true });
const db = new databasePostgres();

// --- CONFIGURAÇÃO DE PLUGINS ---

// Permite que o seu Front-end (React) acesse a API mesmo estando em portas diferentes
server.register(cors, {
    origin: "*", // Em produção, substitua pelo domínio do seu front-end
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
});

// Registro do JWT para autenticação
server.register(jwt, {
    secret: process.env.SECRET || 'secret-padrao-para-desenvolvimento',
});

// Middleware (Decorator) para proteger rotas: verifica se o token Bearer é válido
server.decorate("authenticate", async (request, reply) => {
    try {
        await request.jwtVerify();
    } catch (err) {
        reply.status(401).send({ error: "Token inválido ou ausente" });
    }
});

// --- ROTAS DE USUÁRIO & AUTENTICAÇÃO ---

/**
 * Cadastro de Usuário
 */
server.post("/users", async (request, reply) => {
    try {
        // Validação com Zod conforme o schema definido
        const { name, email, password } = createUserSchema.parse(request.body);

        const existingUser = await db.getUserByEmail(email);
        if (existingUser) {
            return reply.status(409).send({ error: "Usuário já cadastrado com este e-mail." });
        }

        const userId = await db.createUser(name, email, password);
        return reply.status(201).send({ id: userId });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return reply.status(400).send({ error: "Dados inválidos", details: error.flatten().fieldErrors });
        }
        return reply.status(500).send({ error: "Erro interno no servidor" });
    }
});

/**
 * Login - Gera o Token JWT
 */
server.post("/login", async (request, reply) => {
    const { email, password } = request.body;
    
    // Verifica credenciais no banco
    const user = await db.loginUser(email, password);

    if (!user) {
        return reply.status(401).send({ error: "E-mail ou senha inválidos." });
    }

    // Gera o token inserindo o ID e Nome no payload
    const token = server.jwt.sign(
        { id: user.id, name: user.name },
        { expiresIn: '7d' }
    );

    return reply.send({ 
        token,
        user: { 
            id: user.id, 
            name: user.name, 
            email: user.email, 
            dark_mode: user.dark_mode 
        } 
    });
});

// Verifica se um e-mail está cadastrado (usado na recuperação de senha)
server.get("/check-email", async (request, reply) => {
  const { email } = request.query;
  if (!email) return reply.status(400).send({ error: "Email é obrigatório." });
  const user = await db.getUserByEmail(email);
  if (!user) return reply.status(404).send({ error: "E-mail não cadastrado." });
  return reply.status(200).send({ exists: true });
});

// Recuperação de senha (simples, sem email)
server.post("/recover-password", async (request, reply) => {
  const {email, newPassword} = request.body;

  try {
    await db.recoverPassword(email, newPassword);
    return reply.send({ message: "Senha atualizada com sucesso." });
  } catch (error) {
    return reply.status(500).send({ error: "Erro ao atualizar senha." });
  }
});

/**
 * Dados do usuário autenticado (usado para sincronização de tema entre dispositivos)
 */
server.get("/users/me", { onRequest: [server.authenticate] }, async (request, reply) => {
  try {
    const user = await db.getUserById(request.user.id);
    return reply.send({
      id: user.id,
      name: user.name,
      email: user.email,
      dark_mode: user.dark_mode,
    });
  } catch (error) {
    return reply.status(500).send({ error: "Erro ao buscar usuário." });
  }
});

/**
 * Atualizar preferência de tema (Dark Mode)
 */
server.patch("/users/theme", { onRequest: [server.authenticate] }, async (request, reply) => {
  try {
    // O front-end da Claude provavelmente envia { darkMode: true/false }
    const { darkMode } = request.body; 
    const userId = request.user.id; // Pega o ID do Token JWT

    await db.updateTheme(userId, darkMode);

    return reply.status(204).send(); // Sucesso sem conteúdo
  } catch (error) {
    console.error("Erro ao atualizar tema:", error);
    return reply.status(500).send({ error: "Erro interno ao salvar tema." });
  }
});

// --- ROTAS DE TAREFAS (PROTEGIDAS) ---

/**
 * Listagem de Tarefas - Apenas do usuário logado
 */
server.get("/tasks", { onRequest: [server.authenticate] }, async (request, reply) => {
    try {
        // O ID vem do token decodificado no middleware de autenticação
        const userId = request.user.id;
        const tasks = await db.getTasksByUserId(userId);
        return reply.send(tasks);
    } catch (error) {
        console.error("Error fetching tasks:", error);
        return reply.status(500).send({ error: "Erro ao buscar tarefas." });
    }
});

/**
 * Criação de Tarefa
 */
server.post("/tasks", { onRequest: [server.authenticate] }, async (request, reply) => {
    try {
        const userId = request.user.id;
        const { title, description, status, priority, position } = request.body;

        const taskId = await db.createTask(userId, title, description, status, priority, position);
        const task = await db.getTaskById(taskId);
        return reply.status(201).send(task);
    } catch (error) {
        console.error("Error creating task:", error);
        return reply.status(500).send({ error: "Erro ao criar tarefa." });
    }
});

/**
 * Excluir Tarefa
 */
server.delete("/tasks/:id", { onRequest: [server.authenticate] }, async (request, reply) => {
    try {
        const { id } = request.params;
        await db.deleteTask(id);
        return reply.status(204).send();
    } catch (error) {
        return reply.status(500).send({ error: "Erro ao excluir tarefa." });
    }
});

// --- INICIALIZAÇÃO DO SERVIDOR ---

const start = async () => {
    try {
        await server.listen({
            host: "0.0.0.0",
            port: process.env.PORT || 3333,
        });
        console.log("Server is running!");
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};

server.put("/tasks/:id", { onRequest: [server.authenticate] }, async (request, reply) => {
  const { id } = request.params;
  const { title, description, status, priority, position } = request.body;
  await db.updateTask(id, title, description, status, priority, position);
  return reply.status(204).send();
});

server.patch("/tasks/:id", { onRequest: [server.authenticate] }, async (request, reply) => {
  try {
    const { id } = request.params;
    const existing = await db.getTaskById(id);
    if (!existing) return reply.status(404).send({ error: "Tarefa não encontrada." });

    const { title, description, status, priority, position } = request.body;
    await db.updateTask(
      id,
      title ?? existing.title,
      description ?? existing.description,
      status ?? existing.status,
      priority ?? existing.priority,
      position ?? existing.position
    );
    const updated = await db.getTaskById(id);
    return reply.send(updated);
  } catch (error) {
    console.error("Error updating task:", error);
    return reply.status(500).send({ error: "Erro ao atualizar tarefa." });
  }
});

/**
 * Reordenar Tarefas (Patch em lote)
 * Chamado após o evento onDragEnd do react-beautiful-dnd
 */
server.patch("/tasks/reorder", { onRequest: [server.authenticate] }, async (request, reply) => {
  try {
    const { tasks } = request.body; 

    if (!Array.isArray(tasks)) {
      return reply.status(400).send({ error: "O corpo da requisição deve ser um array de tarefas." });
    }

    await db.updateTasksOrder(tasks);

    return reply.status(204).send();
  } catch (error) {
    console.error("Erro ao reordenar tarefas:", error);
    return reply.status(500).send({ error: "Erro interno ao salvar nova ordem." });
  }
});

server.get("/tasks/archived", { onRequest: [server.authenticate] }, async (request, reply) => {
  try {
    const userId = request.user.id;
    const tasks = await db.getArchivedTasks(userId);
    return reply.send(tasks);
  } catch (error) {
    console.error("Erro ao buscar tarefas arquivadas:", error);
    return reply.status(500).send({ error: "Erro ao buscar tarefas arquivadas." });
  }
});

server.patch("/tasks/:id/archive", { onRequest: [server.authenticate] }, async (request, reply) => {
  try {
    const { id } = request.params;
    const existing = await db.getTaskById(id);
    if (!existing) return reply.status(404).send({ error: "Tarefa não encontrada." });

    await db.archiveTask(id);
    return reply.status(204).send();
  } catch (error) {
    console.error("Erro ao arquivar tarefa:", error);
    return reply.status(500).send({ error: "Erro interno ao arquivar tarefa." });
  }
});

server.patch("/tasks/:id/unarchive", { onRequest: [server.authenticate] }, async (request, reply) => {
  try {
    const { id } = request.params;
    const existing = await db.getTaskById(id);
    if (!existing) return reply.status(404).send({ error: "Tarefa não encontrada." });

    await db.unarchiveTask(id);
    const task = await db.getTaskById(id);
    return reply.send(task);
  } catch (error) {
    console.error("Erro ao desarquivar tarefa:", error);
    return reply.status(500).send({ error: "Erro interno ao desarquivar tarefa." });
  }
});

start();