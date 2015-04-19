var helpers = require("./helpers");
var AWS = require("aws-sdk");
var Queue = require("queuemanager");
var AWS_CONFIG_FILE = "./config.json";
var APP_CONFIG_FILE = "./app.json";

AWS.config.loadFromPath(AWS_CONFIG_FILE);

(function() 
{
	var s3 = new AWS.S3();
	var appConfig = helpers.readJSONFile(APP_CONFIG_FILE);
	var iterations = 1;
	console.log("Queue worker started");
	console.log(iterations+" messages will be proceeded");
	var queue = new Queue(new AWS.SQS(), appConfig.QueueUrl);
	while(iterations > 0){
		iterations--;
		queue.receiveMessage(function(err, data){
			if(err) { console.log("ERROR: "+err); return; }
			var dataInArray = data.Body.split("{}");
			var params = {
				"Bucket": dataInArray[0], 
		  		"Key": dataInArray[1] 
			}
			s3.getObject(params, function(err, result) {
				helpers.calculateMultiDigest(result.Body, ['md5', 'sha1','sha512','sha256'], 
				function(err, digests) {

					console.log(digests);
				
				}, 1);
			});
			
		});	
	}

})();
