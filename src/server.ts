import * as fs from 'fs';
import * as grpc from '@grpc/grpc-js';
import { UserService } from '../generated/user_grpc_pb';
import { UserInfo, GetUserResponse, ListUsersResponse } from '../generated/user_pb';

const dumyUsers = JSON.parse(fs.readFileSync('./db/user.json', 'utf8'));

const getUser = (call, callback) => {
  const user = dumyUsers.filter((dumyUser) => dumyUser.id === call.request.getId()).shift();

  if (user) {
    const userInfo = new UserInfo();
    userInfo.setId(user.id);
    userInfo.setEmail(user.email);
    userInfo.setFullName(user.fullName);
    userInfo.setCreatedAt(user.createdAt);
    userInfo.setUpdatedAt(user.updatedAt);
    console.log(userInfo);

    const reply = new GetUserResponse();
    reply.setUser(userInfo);

    return callback(null, reply);
  }

  return callback({
    code: grpc.status.NOT_FOUND,
    message: 'user not found'
  });
};

const listUsers = (call, callback) => {
  const limit = call.request.hasLimit() ? call.request.getLimit() : 10;
  const offset = call.request.hasOffset() ? call.request.getOffset() : 0;

  const reply = new ListUsersResponse();
  reply.setTotal(dumyUsers.length);

  const users = dumyUsers.slice(offset).slice(0, limit);
  users.forEach((user, index) => {
    const userInfo = new UserInfo();
    userInfo.setId(user.id);
    userInfo.setEmail(user.email);
    userInfo.setFullName(user.fullName);
    userInfo.setCreatedAt(user.createdAt);
    userInfo.setUpdatedAt(user.updatedAt);
    reply.addUsers(userInfo, index);
    console.log(userInfo);
  });

  callback(null, reply);
};

const allUsers = (call, callback) => {
  // 省略
  //   const users = dumyUsers.slice(offset).slice(0, limit);
};

const server = new grpc.Server();

server.addService(UserService, {
  getUser,
  listUsers,
  allUsers
});

server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), (e, port) => {
  if (e) console.error(e);

  server.start();
  console.log(`server start listing on port ${port}`);
});
