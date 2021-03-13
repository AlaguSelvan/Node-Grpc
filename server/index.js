const greets = require('../server/protos/greet_pb')
const sums = require('../server/protos/sum_pb')
const service = require('../server/protos/greet_grpc_pb')
const sumService = require('../server/protos/sum_grpc_pb')

const grpc = require('grpc')

/*
	Implements the greet rpc method
*/
function greet(call, callback) {
	const greeting = new greets.GreetResponse()

	greeting.setResult('Hello ' + call.request.getGreeting().getFirstName() + ' ' + call.request.getGreeting().getLastName());
	callback(null, greeting);
}

/*
	Implements the sum rpc method
*/
function sumFn(call, callback) {
	const sum = new sums.SumResponse();
	console.log(call.request.getSum().getFirstNo(), 'firstno');
	console.log(call.request.getSum().getSecondNo(), 'secondno');
	sum.setResult(call.request.getSum().getFirstNo() + call.request.getSum().getSecondNo());
	callback(null, sum)
}

function main() {
	const server = new grpc.Server();
	server.addService(service.GreetServiceService, {greet: greet})
	server.addService(sumService.sumServiceService, {sum: sumFn})
	server.bind("127.0.0.1:50051", grpc.ServerCredentials.createInsecure())
	server.start()

	console.log(`server running on port 50051`);
}

main()