import * as fs from 'fs';
import * as grpc from '@grpc/grpc-js';
import { UserService } from '../generated/user_grpc_pb';
import { UserInfo, GetUserResponse, ListUsersResponse } from '../generated/user_pb';

const dummyUsers = JSON.parse(fs.readFileSync('./db/user.json', 'utf8'));

const getUser = (call, callback) => {
  const user = dummyUsers.filter((dumyUser) => dumyUser.id === call.request.getId()).shift();

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
  const limit = call.request.hasLimit() ? call.request.getLimit() : -1;
  const offset = call.request.hasOffset() ? call.request.getOffset() : 0;

  const reply = new ListUsersResponse();
  reply.setTotal(dummyUsers.length);

  const users = dummyUsers.slice(offset).slice(0, limit);
  users.forEach((user, index) => {
    const userInfo = new UserInfo();
    userInfo.setId(user.id);
    userInfo.setEmail(user.email);
    userInfo.setFullName(user.fullName);
    userInfo.setCreatedAt(user.createdAt);
    userInfo.setUpdatedAt(user.updatedAt);
    reply.addUsers(userInfo, index);
  });

  callback(null, reply);
};

const listStreamUsers = async (call) => {
  const limit = call.request.hasLimit() ? call.request.getLimit() : -1;
  const offset = call.request.hasOffset() ? call.request.getOffset() : 0;

  // response with stream for every 1 second
  let p = Promise.resolve();
  const users = dummyUsers.slice(offset).slice(0, limit);
  const f = (v) =>
    new Promise<void>((resolve) =>
      setTimeout(() => {
        const userInfo = new UserInfo();
        userInfo.setId(v.id);
        userInfo.setEmail(v.email);
        userInfo.setFullName(v.fullName);
        userInfo.setCreatedAt(v.createdAt);
        userInfo.setUpdatedAt(v.updatedAt);

        const reply = new GetUserResponse();
        reply.setUser(userInfo);
        call.write(reply);
        console.log('server:', reply);
        resolve();
      }, Math.random() * 1000)
    );

  users.forEach((v) => (p = p.then(() => f(v))));
  await p;

  call.end();
};

const allUsers = (call, callback) => {
  // 省略
  //   const users = dummyUsers.slice(offset).slice(0, limit);
};

const server = new grpc.Server();

server.addService(UserService, {
  getUser,
  listUsers,
  allUsers,
  listStreamUsers
});

server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), (e, port) => {
  if (e) console.error(e);

  server.start();
  console.log(`server start listing on port ${port}`);
});
