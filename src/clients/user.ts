import * as grpc from '@grpc/grpc-js';
import { Empty } from 'google-protobuf/google/protobuf/empty_pb';
import { UserClient } from '../../generated/user_grpc_pb';
import {
  GetUserRequest,
  GetUserResponse,
  ListUsersRequest,
  ListUsersResponse,
  UpdateUserRequest,
  UpdateUserResponse,
  UpdateUsersResponse,
  UserInfo,
  UserDetail,
  UpdateUserInfo
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
      console.log('receive at client:', userInfo.toObject());
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

const updateUser = (
  id: number,
  email?: string,
  fullName?: string,
  createdAt?: number,
  updatedAt?: number
): Promise<UpdateUserResponse> => {
  const detail = new UserDetail();
  email && detail.setEmail(email);
  fullName && detail.setFullName(fullName);
  createdAt && detail.setCreatedAt(createdAt);
  updatedAt && detail.setUpdatedAt(updatedAt);

  const user = new UpdateUserInfo();
  user.setId(id);
  user.setDetail(detail);

  const request = new UpdateUserRequest();
  request.setUser(user);

  return new Promise((resolve, reject) => {
    client.updateUser(request, (err, response) => {
      if (err) reject(err);
      if (response === undefined) {
        reject('response is undefined');
        return;
      }
      resolve(response);
    });
  });
};

interface User {
  id: number;
  email?: string;
  fullName?: string;
  createdAt?: number;
  updatedAt?: number;
}
const updateStreamUsers = async (users: User[]): Promise<UpdateUsersResponse> => {
  return new Promise(async (resolve) => {
    const apiRequestStream = client.updateStreamUsers((err, value) => {
      if (err) console.error('error on server:', err);
      if (value === undefined) return;
      console.log(`completed: ${value.getUsersList().length} users have been updated.`);
      resolve(value);
    });

    let p = Promise.resolve();

    const f = (v) =>
      new Promise<void>((resolve) =>
        setTimeout(() => {
          console.log('client:', v);
          const userDetail = new UserDetail();
          userDetail.setEmail(v.email);
          userDetail.setFullName(v.fullName);
          userDetail.setCreatedAt(v.createdAt);
          userDetail.setUpdatedAt(v.updatedAt);

          const userInfo = new UserInfo();
          userInfo.setId(v.id);
          userInfo.setDetail(userDetail);

          const reply = new UpdateUserRequest();
          reply.setUser(userInfo);
          apiRequestStream.write(reply);
          resolve();
        }, Math.random() * 1000)
      );

    users.forEach((v) => (p = p.then(() => f(v))));
    await p;

    apiRequestStream.end();
  });
};

const allUsers = () => {
  // 省略
};

export { getUser, listUsers, listStreamUsers, allUsers, updateUser, updateStreamUsers };
