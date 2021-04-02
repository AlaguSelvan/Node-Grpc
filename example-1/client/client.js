const greets = require('../server/protos/greet_pb')
const sums = require('../server/protos/sum_pb')
const services = require('../server/protos/greet_grpc_pb')
// const sumservices = require('../server/protos/sum_grpc_pb')

const grpc = require('grpc')

function callGreetManytimes() {

	const client = new services.GreetServiceClient('localhost:50051', grpc.credentials.createInsecure())
	
	const request = new greets.GreetManyTimesRequest();
	
	const greeting = new greets.Greeting()
	greeting.setFirstName('Paulo')
	greeting.setLastName('Dichone')
	
	request.setGreeting(greeting);
	console.log('called after set')
	
  var call = client.greetManyTimes(request, () => {});
	console.log('called after')

	call.on('data', (response) => {
    console.log('Client Streaming Response:', response.getResult());
  });

	call.on('status', (status) => {
    console.log('status:', status.details);
  });

	call.on('error', (error) => {
    console.log('error:', error.details);
  });

	call.on('end', (end) => {
    console.log('end:', end);
  });
}

function callLongGreeting() {
	const client = new services.GreetServiceClient('localhost:50051', grpc.credentials.createInsecure())

	const request = new greets.LongGreetRequest()

	const call = client.longGreet(request, (error, response) => {
		if(error) throw new Error(error.mesage)
		console.log('Server Response: ', response.getResult())
	})

	let count = 0
	let intervalID = setInterval(() => {
		console.log(`Sending Message ${count}`,)
		const request = new greets.LongGreetRequest();
		const greeting = new greets.Greeting()
		greeting.setFirstName('Henry')
		greeting.setLastName('Cavill')
		request.setGreet(greeting);
		call.write(request);

		const requestTwo = new greets.LongGreetRequest();
		const greetingTwo = new greets.Greeting()
		greetingTwo.setFirstName('Ben');
		greetingTwo.setLastName('Affleck');
		requestTwo.setGreet(greetingTwo);
		call.write(requestTwo);

		if(++count > 3) {
			clearInterval(intervalID)
			call.end() // We have sent all messages
		}
	}, 1000)
}

function main() {
	const client = new services.GreetServiceClient('localhost:50051', grpc.credentials.createInsecure())
	// var sumClient = new sumservices.sumServiceClient('localhost:50051', grpc.credentials.createInsecure())
	
	// we do stuff!

	// create our request
	const request = new greets.GreetRequest()
	// const sumRequest = new sums.SumRequest();

	const greeting = new greets.Greeting()
	// const sum = new sums.Sum();

	greeting.setFirstName("Jerry")
	greeting.setLastName("Tom")

	// sum.setFirstNo(3);
	// sum.setSecondNo(10);
	
	request.setGreeting(greeting)
	// sumRequest.setSum(sum)

	client.greet(request, (error, response) => {
		if (!error) {
			console.log("Greeting Response: ", response.getResult())
		} else {
			console.error(error)
		}
	})
}


async function sleep(interval) {
  return new Promise((resolve, reject) => {
    return setTimeout(() => {
      resolve();
    }, interval);
  });
};

async function callBiDirect() {
	console.log("started bidirectional stream :client")

	const client = new services.GreetServiceClient('localhost:50051', grpc.credentials.createInsecure())

	const request = new greets.GreetEveryoneRequest();

	const call = client.greetEveryone(request, (error, response) => {
		console.log('Server Response: ', response)

	})

	call.on('data', response => {
		console.log('Hello Client!', response.getResult());
	})

	call.on('error', error => console.error(error))

	call.on('end', () => console.log('Client end'))

	for (let i = 0; i < 10; i++) {
		const greeting = new greets.Greeting()
		greeting.setFirstName('Arthur')
		greeting.setLastName('Morgan')

		const request = new greets.GreetEveryoneRequest()
		request.setGreet(greeting)
		await call.write(request)
		await sleep(1500)
	}

	call.end()

}

main()

// callGreetManytimes();
// callLongGreeting();
callBiDirect();
