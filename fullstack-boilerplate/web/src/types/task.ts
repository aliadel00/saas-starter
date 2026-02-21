export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: number;
  dueDate: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedTasks {
  items: Task[];
  total: number;
  page: number;
  limit: number;
}

export interface GetTasksInput {
  page?: number;
  limit?: number;
  status?: TaskStatus;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority: number;
  dueDate?: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  priority?: number;
  dueDate?: string;
}

export interface ChangeTaskStatusInput {
  status: TaskStatus;
}
