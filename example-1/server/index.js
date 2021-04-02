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
	Implements the greetmanytimes rpc method
*/
function greet(call, callback) {
	const greeting = new greets.GreetResponse()

	greeting.setResult('Hello ' + call.request.getGreeting().getFirstName() + ' ' + call.request.getGreeting().getLastName());
	callback(null, greeting);
}


function greetManyTimes(call, callback) {
	console.log('call:', call.request.getGreeting().getFirstName());
  var firstName = call.request.getGreeting().getFirstName();
  var lastName = call.request.getGreeting().getLastName();
  let count = 0;
  let intervalID = setInterval(function () {
    const greetManyTimesResponse = new greets.GreetManyTimesResponse();
    const result = { firstName, lastName };
    greetManyTimesResponse.setResult(firstName);
    call.write(greetManyTimesResponse);
    if (++count > 9) {
      clearInterval(intervalID);
      call.end(); // we have sent all messages!
    }
  }, 1000);
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

function longGreet(call, callback) {
	call.on('data', request => {
		const fullName = `${request.getGreet().getFirstName()} + ${request.getGreet().getLastName()}`
		console.log(`Hello ${fullName}`)
	})

	call.on('error', error => {
		console.error(error)
	})

	call.on('end', () => {
		const response = new greets.LongGreetResponse();
		response.setResult('Long Greet Client Streaming.....');

		callback(null, response)
	})
}

async function sleep (interval) {
	return new Promise((resolve, reject) => {
		return setTimeout(() => {
			resolve()
		}, interval)
	})
}

async function greetEveryone(call, callback) {
	call.on('data', (response) => {
		const fullName = `${response.getGreet().getFirstName()} ${response.getGreet().getLastName()}`
		console.log(`Hello ${fullName}`)
	})

	call.on('error', error => console.error(error))
	call.on('end', () => console.log('The End..'))

	for (let i = 0; i < 10; i++) {
		// const greeting = new greets.Greeting()
		// greeting.setFirstName('Christian')
		// greeting.setLastName('Bale')
		const request = new greets.GreetEveryoneResponse()
		request.setResult('John Marston');
		// request.setGreet(greeting)
		call.write(request)
		await sleep(1000)
	}

	call.end()
}



function main() {
	const server = new grpc.Server();
	server.addService(service.GreetServiceService, {
    greet,
    greetManyTimes,
    longGreet,
    greetEveryone,
  });
	server.addService(sumService.sumServiceService, {sum: sumFn})
	server.bind("127.0.0.1:50051", grpc.ServerCredentials.createInsecure())
	server.start()

	console.log(`server running on port 50051`);
}

main()