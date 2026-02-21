import { gql } from '@apollo/client';

const TASK_FRAGMENT = gql`
  fragment TaskFields on TaskType {
    id
    title
    description
    status
    priority
    dueDate
    createdBy
    createdAt
    updatedAt
  }
`;

export const GET_TASKS = gql`
  ${TASK_FRAGMENT}
  query GetTasks($input: GetTasksInput) {
    getTasks(input: $input) {
      items {
        ...TaskFields
      }
      total
      page
      limit
    }
  }
`;

export const GET_TASK_BY_ID = gql`
  ${TASK_FRAGMENT}
  query GetTaskById($id: String!) {
    getTaskById(id: $id) {
      ...TaskFields
    }
  }
`;

export const CREATE_TASK = gql`
  ${TASK_FRAGMENT}
  mutation CreateTask($input: CreateTaskInput!) {
    createTask(input: $input) {
      ...TaskFields
    }
  }
`;

export const UPDATE_TASK = gql`
  ${TASK_FRAGMENT}
  mutation UpdateTask($id: String!, $input: UpdateTaskInput!) {
    updateTask(id: $id, input: $input) {
      ...TaskFields
    }
  }
`;

export const CHANGE_TASK_STATUS = gql`
  ${TASK_FRAGMENT}
  mutation ChangeTaskStatus($id: String!, $input: ChangeTaskStatusInput!) {
    changeTaskStatus(id: $id, input: $input) {
      ...TaskFields
    }
  }
`;

export const SOFT_DELETE_TASK = gql`
  ${TASK_FRAGMENT}
  mutation SoftDeleteTask($id: String!) {
    softDeleteTask(id: $id) {
      ...TaskFields
    }
  }
`;
