import * as fs from 'fs';
import * as grpc from '@grpc/grpc-js';
import { UserService } from '../generated/user_grpc_pb';
import { UserInfo, UserDetail, GetUserResponse, ListUsersResponse, UpdateUserResponse } from '../generated/user_pb';

const dummyUsers = JSON.parse(fs.readFileSync('./db/user.json', 'utf8'));

const getUser = (call, callback) => {
  const user = dummyUsers.filter((dumyUser) => dumyUser.id === call.request.getId()).shift();

  if (user) {
    const userDetail = new UserDetail();
    userDetail.setEmail(user.email);
    userDetail.setFullName(user.fullName);
    userDetail.setCreatedAt(user.createdAt);
    userDetail.setUpdatedAt(user.updatedAt);

    const userInfo = new UserInfo();
    userInfo.setId(user.id);
    userInfo.setDetail(userDetail);
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
  const limit = call.request.hasLimit() ? call.request.getLimit() : 100;
  const offset = call.request.hasOffset() ? call.request.getOffset() : 0;

  const reply = new ListUsersResponse();
  reply.setTotal(dummyUsers.length);

  const users = dummyUsers.slice(offset).slice(0, limit);
  users.forEach((user, index) => {
    const userDetail = new UserDetail();
    userDetail.setEmail(user.email);
    userDetail.setFullName(user.fullName);
    userDetail.setCreatedAt(user.createdAt);
    userDetail.setUpdatedAt(user.updatedAt);

    const userInfo = new UserInfo();
    userInfo.setId(user.id);
    userInfo.setDetail(userDetail);
    reply.addUsers(userInfo, index);
  });

  callback(null, reply);
};

const listStreamUsers = async (call) => {
  const limit = call.request.hasLimit() ? call.request.getLimit() : 100;
  const offset = call.request.hasOffset() ? call.request.getOffset() : 0;

  // response with stream for every 1 second
  let p = Promise.resolve();
  const users = dummyUsers.slice(offset).slice(0, limit);
  const f = (v) =>
    new Promise<void>((resolve) =>
      setTimeout(() => {
        const userDetail = new UserDetail();
        userDetail.setEmail(v.email);
        userDetail.setFullName(v.fullName);
        userDetail.setCreatedAt(v.createdAt);
        userDetail.setUpdatedAt(v.updatedAt);

        const userInfo = new UserInfo();
        userInfo.setId(v.id);
        userInfo.setDetail(userDetail);

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

const updateUser = (call, callback) => {
  const userId = call.request.getUser().getId();
  const email = call.request.getUser().getDetail().getEmail();
  const fullName = call.request.getUser().getDetail().getFullName();
  const createdAt = call.request.getUser().getDetail().getCreatedAt();
  const updatedAt = call.request.getUser().getDetail().getUpdatedAt();

  // return object assuming it has been updated
  const userDetail = new UserDetail();
  userDetail.setEmail(email || 'default_email');
  userDetail.setFullName(fullName || 'default_fullName');
  userDetail.setCreatedAt(createdAt || 0);
  userDetail.setUpdatedAt(updatedAt || 0);

  const userInfo = new UserInfo();
  userInfo.setId(userId);
  userInfo.setDetail(userDetail);
  console.log(userInfo);

  const reply = new UpdateUserResponse();
  reply.setUser(userInfo);

  return callback(null, reply);
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
  listStreamUsers,
  updateUser
});

server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), (e, port) => {
  if (e) console.error(e);

  server.start();
  console.log(`server start listing on port ${port}`);
});
