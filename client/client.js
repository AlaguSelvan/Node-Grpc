const greets = require('../server/protos/greet_pb')
const sums = require('../server/protos/sum_pb')
const services = require('../server/protos/greet_grpc_pb')
const sumservices = require('../server/protos/sum_grpc_pb')

const grpc = require('grpc')

function main() {
	console.log('Hello From Client')
	var client = new services.GreetServiceClient('localhost:50051', grpc.credentials.createInsecure())
	var sumClient = new sumservices.sumServiceClient('localhost:50051', grpc.credentials.createInsecure())
	
	// we do stuff!

	// create our request
	const request = new greets.GreetRequest()
	const sumRequest = new sums.SumRequest();

	const greeting = new greets.Greeting()
	const sum = new sums.Sum();

	greeting.setFirstName("Jerry")
	greeting.setLastName("Tom")

	sum.setFirstNo(3);
	sum.setSecondNo(10);
	
	request.setGreeting(greeting)
	sumRequest.setSum(sum)

	client.greet(request, (error, response) => {
		if (!error) {
			console.log("Greeting Response: ", response.getResult())
		} else {
			console.error(error)
		}
	})
	sumClient.sum(sumRequest, (error, response) => {
		if (!error) {
			console.log("Sum Response: ", response.getResult());
		} else {
			console.error(error)
		}
	})
}

main()