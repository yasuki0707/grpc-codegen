# ts-gen-service-node.sh の時と同じなので、不要？

# Path to this plugin, Note this must be an abolsute path on Windows (see #15)
PROTOC_GEN_TS_PATH="./node_modules/.bin/protoc-gen-ts"

# Directory to write generated code to (.js and .d.ts files)
OUT_DIR="./generated"

# Path to protoc for node
NODE_PROTOC="./node_modules/.bin/grpc_tools_node_protoc"

$NODE_PROTOC \
    --plugin="protoc-gen-ts=${PROTOC_GEN_TS_PATH}" \
    --js_out="import_style=commonjs,binary:${OUT_DIR}" \
    --ts_out="${OUT_DIR}" \
    user.proto