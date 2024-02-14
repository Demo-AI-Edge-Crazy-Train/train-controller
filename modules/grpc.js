const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
var PROTO_PATH ='./protos/grpc_predict_v2.proto';

exports.grpcPredictImage = function grpcPredictImage(host, inputs) {
    var result = null;
    var packageDefinition = protoLoader.loadSync(
        PROTO_PATH,
        {keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
        });
        var inference = grpc.loadPackageDefinition(packageDefinition).inference;
        // Create client
        const clientOptions = {
            "grpc.lb_policy_name": "round_robin",
        };
        const model_mesh_uri = 'traffic-crazy-train.apps.rhods-internal.61tk.p1.openshiftapps.com/v2/models/traffic/infer';
        const client = new inference.GRPCInferenceService(model_mesh_uri,
                                        grpc.credentials.createInsecure(),clientOptions);
        client.modelInfer(inputs, function(error, modelInferResponse) {
            console.log(error);
            console.log('Results : ', modelInferResponse);
            result = modelInferResponse;
        });
        return result;
}