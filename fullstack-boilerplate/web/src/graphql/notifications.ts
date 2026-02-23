import { gql } from "@apollo/client";

const NOTIFICATION_FRAGMENT = gql`
  fragment NotificationFields on NotificationObjectType {
    id
    type
    title
    body
    read
    userId
    tenantId
    taskId
    jobId
    actorEmail
    createdAt
  }
`;

export const GET_NOTIFICATIONS = gql`
  ${NOTIFICATION_FRAGMENT}
  query GetNotifications($input: GetNotificationsInput) {
    getNotifications(input: $input) {
      items {
        ...NotificationFields
      }
      total
      page
      limit
      unreadCount
    }
  }
`;

export const GET_UNREAD_COUNT = gql`
  query UnreadNotificationCount {
    unreadNotificationCount
  }
`;

export const MARK_NOTIFICATION_AS_READ = gql`
  mutation MarkNotificationAsRead($id: String!) {
    markNotificationAsRead(id: $id)
  }
`;

export const MARK_ALL_NOTIFICATIONS_AS_READ = gql`
  mutation MarkAllNotificationsAsRead {
    markAllNotificationsAsRead
  }
`;
