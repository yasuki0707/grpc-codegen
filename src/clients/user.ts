import * as grpc from '@grpc/grpc-js';
import { Empty } from 'google-protobuf/google/protobuf/empty_pb';
import { UserClient } from '../../generated/user_grpc_pb';
import {
  GetUserRequest,
  GetUserResponse,
  ListUsersRequest,
  ListUsersResponse,
  UserInfo,
  UserDetail
} from '../../generated/user_pb';

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

const listStreamUsers = (limit?: number, offset?: number): Promise<ListUsersResponse> => {
  const request = new ListUsersRequest();
  if (!!limit) request.setLimit(limit);
  if (!!offset) request.setOffset(offset);

  return new Promise((resolve) => {
    const call = client.listStreamUsers(request);
    const res = new ListUsersResponse();
    call.on('data', (response) => {
      // user ごとのデータが stream の一単位として送られてくる
      const userInfo = new UserInfo();
      const user = response.array[0];
      userInfo.setId(user[0]);

      const userDetail = new UserDetail();
      userDetail.setEmail(user[1][0]);
      userDetail.setFullName(user[1][1]);
      userDetail.setCreatedAt(user[1][2]);
      userDetail.setUpdatedAt(user[1][3]);
      userInfo.setDetail(userDetail);
      res.addUsers(userInfo, res.getTotal());
      res.setTotal(res.getTotal() + 1);
      console.log('client:', userInfo);
    });
    call.on('end', () => {
      console.log('number of users:', res.getTotal());
      resolve(res);
    });
    call.on('error', (err) => {
      console.log(err);
    });
    call.on('status', (status) => {
      console.log('status:', status);
    });
  });
};

const allUsers = () => {
  // 省略
};

export { getUser, listUsers, listStreamUsers, allUsers };
