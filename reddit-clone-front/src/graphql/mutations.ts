export const REGISTER_MUT = `
mutation Register($username:String!, $password: String!){
  register(options: { username: $username, password: $password }) {
    errors {
      message
      field
    }
    user {
      id
      username
      createdAt
      updatedAt
    }
  }
}
`;
