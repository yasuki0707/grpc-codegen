import * as grpc from '@grpc/grpc-js';
import { Empty } from 'google-protobuf/google/protobuf/empty_pb';
import { UserClient } from '../../generated/user_grpc_pb';
import { GetUserRequest, GetUserResponse, ListUsersRequest, ListUsersResponse } from '../../generated/user_pb';

const client = new UserClient('0.0.0.0:50051', grpc.credentials.createInsecure());

const getUser = (id): Promise<GetUserResponse> => {
  const request = new GetUserRequest();
  request.setId(id);

  return new Promise((resolve, reject) => {
    client.getUser(request, (err, response) => {
      if (err) reject(err);
      if (response === undefined) return;
      resolve(response);
    });
  });
};

const listUsers = (limit?: number, offset?: number): Promise<ListUsersResponse> => {
  const request = new ListUsersRequest();
  if (!!limit) request.setLimit(limit);
  if (!!offset) request.setOffset(offset);

  return new Promise((resolve, reject) => {
    client.listUsers(request, (err, response) => {
      if (err) reject(err);
      if (response === undefined) return;
      resolve(response);
    });
  });
};

const allUsers = () => {
  // 省略
};

export { getUser, listUsers, allUsers };
