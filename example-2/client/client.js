const path = require('path');
const protoLoader = require('@grpc/proto-loader');
const grpc = require('grpc');

// grpc service definition for greet

const greetProtoPath = path.join(__dirname, '..', 'protos', 'greet.proto');
const greetProtoDefinition = protoLoader.loadSync(greetProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const greetPackageDefinition = grpc.loadPackageDefinition(greetProtoDefinition).greet;

const client = new greetPackageDefinition.GreetService("127.0.0.1:50051", grpc.credentials.createInsecure())

function callGreetings() {
	const request = {
		greeting: {
			first_name: "Jerry",
			last_name: "Tom"
		}
	}
	client.Greet(request, (error, response) => {
		if(!error) {
			console.log("Greeting Response", response.result);
		} else {
			console.error(error)
		}
	})
}

function callGreetManytimes() {
	const request = {
		greeting: {
			first_name: 'Jerry',
			last_name: 'Tom',
		},
	};

	const call = client.GreetManyTimes(request, () => {});
	call.on('data', (response) => {
		console.log('Response:', response);
		console.log('Client Streaming Response:', response.getResult())
	})
	call.on('status', (status) => {
		console.log('status:', status)
	})
	call.on('error', (error) => {
    console.log('error:', error);
  });
	call.on('end', (end) => {
		console.log('end:', end);
	});
}

function main() {
	callGreetManytimes();
	callGreetings()
}

main()