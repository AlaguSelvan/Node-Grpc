const greets = require('./protos/greet_pb')
const path = require('path')
const protoLoader = require('@grpc/proto-loader')
const grpc = require('grpc')

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

function greet(call, callback) {
	console.log('call:', call)
	var firstName = call.request.greeting.first_name;
	var lastName = call.request.greeting.last_name;
	callback(null, {result: "Hello" + " " + firstName + " " + lastName })
}

function greetManyTimes(call, callback) {
	console.log('call:', call);
	var firstName = call.request.greeting.first_name;
	var lastName = call.request.greeting.last_name;
	let count = 0
	let intervalID = setInterval(function() {
		// callback(null, {})
		const greetManyTimesResponse = new greets.GreetManyTimesResponse();
		const result = {firstName, lastName}
		greetManyTimesResponse.setResult(result);
		console.log('greetManyTimesResponse:', greetManyTimesResponse);
		call.write(greetManyTimes);
		// greetManyTimesResponse.setResult(firstName)
		// setup streaming
		// call.write(greetManyTimesResponse)
		if(++count > 9) {
			clearInterval(intervalID)
			call.end(); // we have sent all messages!
		}
	}, 1000)
}

function main() {
	const server = new grpc.Server()

	server.addService(greetPackageDefinition.GreetService.service, {
    greet,
    greetManyTimes
  });

	server.bind("127.0.0.1:50051", grpc.ServerCredentials.createInsecure())
	server.start()
	console.log('Server Running at 127.0.0.1:50051');

}

main()