const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');

// initialise DB connection
const admin = require('firebase-admin');
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: 'https://testchatbot-csikjr.firebaseio.com/',
});


function connectToDatabase(){
  const connection = createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '12345678',
    database : 'searchair'
  });
  return new Promise((resolve,reject) => {
     connection.connect();
     resolve(connection);
  });
}

function queryDatabase(connection){
  return new Promise((resolve, reject) => {
    connection.query('SELECT * FROM `product`', (error, results, fields) => {
      resolve(results);
    });
  });
}




process.env.DEBUG = 'dialogflow:debug';

/*export*/ const dialogflowFirebaseFulfillment = https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
  /*
  function handleAge(agent) {
    const age = agent.parameters.shapmoo;
    
    return admin.database().ref('shampooInfo').once("value").then((snapshot) => {
      var averageAge = snapshot.child("shampooDetail").val();
      agent.add(`Our recorded average age is ` + averageAge);
    });
  }*/

  function handleReadFromMySQL(agent){
    const shampoo = agent.parameters.shampoo;
    return connectToDatabase()
    .then(connection => {
      return queryDatabase(connection)
      .then(result => {
        console.log(result);
        result.map(product => {
          if(shampoo === product.type){
            agent.add(`Product Name: ${product.name} and Price: ${product.price}`);
          }
        });        
        connection.end();
      });
    });
  }

  // Run the proper function handler based on the matched Dialogflow intent name
  let intentMap = new Map();
  intentMap.set('AskShampoo', handleReadFromMySQL);
  agent.handleRequest(intentMap);
});



