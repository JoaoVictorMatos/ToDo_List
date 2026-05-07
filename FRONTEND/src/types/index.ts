export type Priority = 'low' | 'medium' | 'high';
export type TodoStatus = 'pending' | 'doing' | 'done';
export type SyncState = 'idle' | 'saving' | 'error' | 'success';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TodoStatus;
  priority: Priority;
  position: number;
  created_at: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  dark_mode: boolean;
}

export interface ColumnConfig {
  id: TodoStatus;
  title: string;
  colorClass: string;
  headerClass: string;
  badgeClass: string;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  priority: Priority;
  status: TodoStatus;
  position: number;
}

export type UpdateTaskPayload = Partial<CreateTaskPayload>;

export interface TaskItemProps {
  task: Task;
  index: number;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
}

export interface ColumnProps {
  column: ColumnConfig;
  tasks: Task[];
  onAddTask: (status: TodoStatus) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onArchiveTask: (id: string) => void;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface ReorderPayload {
  tasks: { id: string; position: number; status: string }[];
}

export interface NewTodoModalProps {
  isOpen: boolean;
  initialStatus?: TodoStatus;
  editingTask?: Task | null;
  onClose: () => void;
  onSubmit: (payload: CreateTaskPayload) => void;
}

export interface ArchivedTasksModalProps {
  isOpen: boolean;
  archivedTasks: Task[];
  isLoadingArchived: boolean;
  onClose: () => void;
  onUnarchive: (id: string) => void;
  onFetch: () => void;
}

export interface ThemeToggleProps {
  isDark: boolean;
  onToggle: () => void;
}

export interface SyncStatusProps {
  state: SyncState;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}
