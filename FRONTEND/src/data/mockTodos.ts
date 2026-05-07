import { Task } from '../types';

const now = Date.now();
const DAY = 86_400_000;
const HOUR = 3_600_000;

export const mockTodos: Task[] = [
  {
    id: '1',
    title: 'Configurar ambiente de desenvolvimento',
    description:
      'Instalar Node.js, configurar variáveis de ambiente e verificar dependências do projeto.',
    priority: 'high',
    status: 'done',
    position: 0,
    created_at: new Date(now - DAY * 3).toISOString(),
  },
  {
    id: '2',
    title: 'Modelar banco de dados',
    description:
      'Definir tabelas, relacionamentos e índices necessários para o sistema.',
    priority: 'high',
    status: 'done',
    position: 1,
    created_at: new Date(now - DAY * 2).toISOString(),
  },
  {
    id: '3',
    title: 'Desenvolver API REST',
    description:
      'Implementar endpoints CRUD para gerenciamento de tarefas com autenticação JWT.',
    priority: 'high',
    status: 'doing',
    position: 0,
    created_at: new Date(now - DAY).toISOString(),
  },
  {
    id: '4',
    title: 'Implementar autenticação',
    description:
      'Adicionar login, registro e proteção de rotas com middleware de autenticação.',
    priority: 'medium',
    status: 'doing',
    position: 1,
    created_at: new Date(now - HOUR * 5).toISOString(),
  },
  {
    id: '5',
    title: 'Escrever testes unitários',
    description:
      'Cobrir as principais funcionalidades com testes automatizados usando Jest.',
    priority: 'medium',
    status: 'pending',
    position: 0,
    created_at: new Date(now).toISOString(),
  },
  {
    id: '6',
    title: 'Configurar CI/CD pipeline',
    description: 'Automatizar build, testes e deploy com GitHub Actions.',
    priority: 'low',
    status: 'pending',
    position: 1,
    created_at: new Date(now).toISOString(),
  },
  {
    id: '7',
    title: 'Documentar API com Swagger',
    description:
      'Gerar documentação interativa para todos os endpoints da API REST.',
    priority: 'low',
    status: 'pending',
    position: 2,
    created_at: new Date(now).toISOString(),
  },
];
