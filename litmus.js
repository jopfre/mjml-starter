var Litmus = require('litmus-api');
var parseXML = require('xml2js').parseString;
var fs = require('fs');

var outputFile = './preview.html';

var api = new Litmus({
  username: 'jonah.freeland+litmus@gmail.com',
  password: 'b0nc0ur4g3',
  url: 'https://jonah-freeland1.litmus.com'
});

var testId;
var previewImages;
var testResults;
var state = '';
var allComplete = false;
// var cleanResults = [];
var htmlOutput = `<html>
<head>
<style>
  body {
    font-family: sans-serif;
  }
  article {
    display: inline-block;
    vertical-align: top;
    width: 33.33%;
  }
  img {
    max-width: 100%;
  }
</style>
</head>
<body>`;

var emailBody = fs.readFileSync( __dirname + '/index.html').toString();

var clients= ['appmail9', 'ol2010', 'ol2011', 'ol2013', 'android4', 'androidgmailapp', 'androidgmailimap', 'android5', 'android6', 'iphone6s', 'iphone6s', 'iphone6splus', 'iphone7', 'iphone7plus', 'ipad', 'aolonline', 'chromegmailnew', 'ffgoogleinbox', 'outlookcom', 'ffyahoo']; //https://COMPANY.litmus.com/emails/clients.xml

var applications = '<applications type="array">';
clients.forEach(function(client) {
  applications += '<application><code>'+client+'</code></application>';
});
applications += '</applications>';

var request = `<?xml version="1.0"?>
<test_set>`
+applications+
`<save_defaults>false</save_defaults>
  <use_defaults>false</use_defaults>
  <email_source>
     <body><![CDATA[`+emailBody+`]]></body>
     <subject>My test email to Litmus</subject>
  </email_source>
</test_set>`;

api.createEmailTest(request).then(function(response) {
  parseXML(response[0].body, function(err, result) {
    // console.log(result);
    testId = result.test_set.id[0]._;
  });

  console.log("test id: "+testId);

  poll(testId);

});


function poll(testId) {
    setTimeout(function() {

      console.log("polling");

      api.pollVersion(testId, 1).then(function(response) {
        parseXML(response[0].body, function(err, result) {
          polls = result.test_set_version.results[0].result;
        });

        polls.forEach(function(poll) {
          state = poll.state[0];
          console.log(state);
          if (state == 'complete') {
            allComplete = true;
          }
        });
      });

      if(!allComplete) {
        poll(testId);
      } else {
        console.log("all complete");
        getResults(testId);
        return;
      }

    }, 1000);
}

function getResults(testId) {

  api.getResults(testId, 1).then(function(response, err) {
    // console.log(err);

    parseXML(response[0].body, function(err, result) {
       testResults = result.results.result;
    });

    testResults.forEach(function(result) {

      var previewImages = result.result_images[0].result_image;
      
      console.log(previewImages);

      previewImages.forEach(function(image) {
        if (image.image_type[0] === 'full_on') { //fullscreen with images on. options: 'full_off', 'full_on', 'window_off', window_on';
        // cleanResults.push({
        //   client: result.test_code[0],
        //   preview: image.full_image[0]
        // });
          htmlOutput += '<article><h2>'+result.test_code[0]+'</h2>';
          if ("full_image" in image) {
            htmlOutput +='<img src="http://'+image.full_image[0]+'">';
          }
          htmlOutput += '</article>';
        } 
      });
    });
    htmlOutput += '</body></html>';

    var stream = fs.createWriteStream(outputFile);

    stream.once('open', function(fd) {
      stream.end(htmlOutput);
    });

  });

}

