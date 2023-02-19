# XXXX

## How to use?

### Repo clone & Installation

```sh
git clone git@github.com:yasuki0707/grpc-codegen.git

npm install
```

### Stub generation

#### Prepare `.proto` file

```proto
# e.g. user.proto

syntax = "proto3";

package user;

import "google/protobuf/empty.proto";
import "google/protobuf/wrappers.proto";

service User {
  rpc GetUser(GetUserRequest) returns (GetUserResponse) {}
  rpc ListUsers(ListUsersRequest) returns (ListUsersResponse) {}
  rpc AllUsers(google.protobuf.Empty) returns (ListUsersResponse) {}
}

message GetUserRequest {
  int32 id = 1;
}

message GetUserResponse {
  UserInfo user = 1;
}

message ListUsersRequest {
  google.protobuf.Int32Value limit = 1;
  google.protobuf.Int32Value offset = 2;
}

message ListUsersResponse {
  int32 total = 1;
  repeated UserInfo users = 2;
}

message UserInfo {
  int32 id = 1;
  string email = 2;
  string full_name = 3;
  int64 created_at = 4;
  int64 updated_at = 5;
}
```

#### Prepare destination folder where generated files are put into

```sh
mkdir generated
```

#### Run scripts

```sh
# for Node server
sh/ts-gen-service-node.sh

# for web browser
sh/ts-gen-service-web.sh
```

This will generate stub code in `/generated` (prepared step above).  
Among them `xxx_grpc_pb.js` is for interfaces of gRPC services(`xxx_grpc_pb.d.ts` is corresponding type definition).  
Similarly `xxx_pb.js` includes model definition for each type defined in `.proto`(`xxx_pb.d.ts` is its type definition).

### Implement services

At this point you can start implementation for services using auto-generated stubs.(basically in `/src`)  
Scripts also generate type definition files so that Typescript are available.

## Test

This project ships samples for communication between Node server(client, hosted by Express) and gPRC server.  
By using a tool like `BloomRPC` you can easily check whether it works.

```sh
# install BloomRPC
brew install --cask bloomrpc
```
