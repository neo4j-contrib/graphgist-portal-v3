import AWS from "aws-sdk";

export function sendEmail(message) {
  const ses = new AWS.SES({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
    apiVersion: '2010-12-01',
  });

	var params = {
		Destination: { ToAddresses: message.to },
		Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: message.htmlBody,
        },
        // Text: {
        //  Charset: "UTF-8",
        //  Data: ""
        // }
      },
      Subject: {
        Charset: 'UTF-8',
        Data: message.subject,
      }
		},
    Source: 'graphgist_portal@graphgist.org',
		ReplyToAddresses: ['devrel@neo4j.com'],
	};

	var sendPromise = ses.sendEmail(params).promise();

	sendPromise.catch(function(err) {
    console.error(err, err.stack);
  });
}

