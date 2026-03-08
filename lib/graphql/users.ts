import { gql } from "@apollo/client";

export const GET_ALL_USERS = gql`
  query FindAllUsers {
    findAllUsers {
      id
      username
      email
      firstName
      middleName
      lastName
      fullName
      phoneNumber
      role
      isActive
      linkedMemberId
      branch {
        id
        branchName
      }
    }
  }
`;

export const GET_USER_BY_ID = gql`
  query FindUserById($id: ID!) {
    findUserById(id: $id) {
      id
      username
      email
      firstName
      middleName
      lastName
      fullName
      phoneNumber
      role
      isActive
      branch {
        id
        branchName
      }
    }
  }
`;

export const CREATE_USER = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      username
      email
      firstName
      middleName
      lastName
      fullName
      phoneNumber
      role
      isActive
      linkedMemberId
      branch {
        id
        branchName
      }
    }
  }
`;

export const UPDATE_USER = gql`
  mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
    updateUser(id: $id, input: $input) {
      id
      username
      email
      firstName
      middleName
      lastName
      fullName
      phoneNumber
      role
      isActive
      linkedMemberId
      branch {
        id
        branchName
      }
    }
  }
`;

export const DEACTIVATE_USER = gql`
  mutation DeactivateUser($id: ID!) {
    deactivateUser(id: $id)
  }
`;

export const DELETE_USER = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id)
  }
`;

export const ACTIVATE_USER = gql`
  mutation ActivateUser($id: ID!) {
    activateUser(id: $id)
  }
`;

export const RESET_PASSWORD = gql`
  mutation ResetPassword($id: ID!, $newPassword: String!) {
    resetPassword(id: $id, newPassword: $newPassword)
  }
`;
