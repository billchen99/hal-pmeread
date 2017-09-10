var max_res =50;
var url = 'http://export.arxiv.org/api/query?search_query=cat:cs.CV+OR+cat:cs.AI+OR+cat:cs.LG+OR+cat:cs.CL+OR+cat:cs.NE+OR+cat:stat.ML&start=0&max_results='+max_res+'&sortBy=lastUpdatedDate';

var FeedParser = require('feedparser');
var request = require('request'); // for fetching the feed
var subjectSlot;
var usedTitles = [];
var json = `{
  "papers": [
    {
      "title": "Why DNA?",
      "summary": "collection,facts,DNA",
      "abstract": "A small collection of general facts related to DNA is presented",
      "category": "condensed matter physics"
    },
    {
      "title": "On Reidys and Stadler's metrics for RNA secondary structures",
      "summary": "metrics,structures,RNA",
      "abstract": "We compute explicitly several abstract metrics for RNA secondary structures defined by Reidys and Stadler.",
      "category": "general mathematics"
    },
    {
      "title": "Stochastic S-I-S-O-E Epidemic Model",
      "summary": "SIS epidemic model,environment",
      "abstract": "An stochastic SIS epidemic model in an open environment is presented.",
      "category": "environment"
    },
    {
      "title": "A model of memory, learning and recognition",
      "summary": "model,memory,recognition",
      "abstract": "We propose a simple model of recognition, short-term memory, long-term memory and learning.",
      "category": "biophysics"
    },
    {
      "title": "A Bit-String Model for Biological Aging",
      "summary": "model,aging,computer simulations",
      "abstract": "We present a simple model for biological aging. We studied it through computer simulations and we have found this model to reflect some features of real populations.",
      "category": "condensed matter physics"
    },
    {
      "title": "Efficient Monte Carlo Simulation of Biological Aging",
      "summary": "models,life-histories,hundreds",
      "abstract": "A bit-string model of biological life-histories is parallelized, with hundreds of millions of individuals. It gives the desired drastic decay of survival probabilities with increasing age for 32 age intervals.",
      "category": "condensed matter physics"
    }
  ]
}`;
// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
exports.handler = function (event, context) {
    try {
        console.log("event.session.application.applicationId=" + event.session.application.applicationId);

        /**
         * Uncomment this if statement and populate with your skill's application ID to
         * prevent someone else from configuring a skill that sends requests to this function.
         */

       /* if (event.session.application.applicationId !== “xxxx”) {
             context.fail("Invalid Application ID");
        }*/



        if (event.session.new) {
            onSessionStarted({requestId: event.request.requestId}, event.session);
        }

        if (event.request.type === "LaunchRequest") {
            onLaunch(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "IntentRequest") {
            onIntent(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "SessionEndedRequest") {
            onSessionEnded(event.request, event.session);
            context.succeed();
        }
    } catch (e) {
        context.fail("Exception: " + e);
    }
};

/**
 * Called when the session starts.
 */
var justReadAnAbstract;
var justReadASummary;

var papers= [];

function onSessionStarted(sessionStartedRequest, session) {
    console.log("onSessionStarted requestId=" + sessionStartedRequest.requestId +
        ", sessionId=" + session.sessionId);
    justReadAnAbstract = false;
    justReadASummary = false;
    papers= [];
}

/**
 * Called when the user launches the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
    console.log("onLaunch requestId=" + launchRequest.requestId +
        ", sessionId=" + session.sessionId);

    // Dispatch to your skill's launch.
    getWelcomeResponse(callback);
}

/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session, callback) {
    console.log("onIntent requestId=" + intentRequest.requestId +
        ", sessionId=" + session.sessionId);

    var intent = intentRequest.intent,
        intentName = intentRequest.intent.name;

    // Dispatch to your skill's intent handlers
    if ("GetRecentPapersIntent" === intentName) {
        GetRecentPapersInSession(intent, session, callback);
    } else if ("findSummaryIntent" === intentName){
        subjectSlot = intent.slots.subject.value;
        findSummary(intent, session, callback);
    } else if ("completeSummaryIntent" === intentName && justReadASummary) {
        completeSummary(intent, session, callback);
    } else if ("GetNextEventIntent" === intentName) {
        if (justReadAnAbstract) {
            justReadAnAbstract = false;
            GetNo(intent, session, callback);
        } else {
            GetNextPaper(intent, session, callback);
        }
    } else if ("GetNoIntent" === intentName) {
        if (justReadAnAbstract) {
            handleSessionEndRequest(callback);
        } else {
            GetNo(intent, session, callback);
        }
    } else if ("AMAZON.HelpIntent" === intentName) {
        getHelpResponse(callback);
    } else if ("AMAZON.StopIntent" === intentName || "AMAZON.CancelIntent" === intentName) {
        handleSessionEndRequest(callback);
    } else {
        throw "Invalid intent";
    }
}

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {
    console.log("onSessionEnded requestId=" + sessionEndedRequest.requestId +
        ", sessionId=" + session.sessionId);
    // Add cleanup logic here
}

// --------------- Functions that control the skill's behavior -----------------------

function getWelcomeResponse(callback) {
    // If we wanted to initialize the session to have some attributes we could add those here.
    var sessionAttributes = {};
    var cardTitle = "Hello, what would you like to learn about?";
    var speechOutput = "Hello, I'm HAL 9001. I'm not going to try to kill you" +
        "What would you like to understand more about today?";
    var cardText = "You can say things like, find out about, check a fact, or recent developments in a specific field";
    // If the user either does not reply to the welcome message or says something that is not
    // understood, they will be prompted again with this text.
    var repromptText = "You can say things like, read most recent ML papers from archive";
    var shouldEndSession = false;

    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle, cardText, speechOutput, repromptText, shouldEndSession));
}


function getHelpResponse(callback) {
    // If we wanted to initialize the session to have some attributes we could add those here.
    var sessionAttributes = {};
    var cardTitle = "Welcome to Hal-p Me Read";
var speechOutput ="You can ask me to summarize papers or ask specific questions about research topics. I will read certain databases in order to \
quickly inform you about a wide subject matter.";

    var cardText = "You can say things like, I want to learn more about biology, and I will present a short summaries of a variety of papers on biology";
    // If the user either does not reply to the welcome message or says something that is not
    // understood, they will be prompted again with this text.
    var repromptText = "You can say things like, tell me about recent developments in biology";
    var shouldEndSession = false;

    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle, cardText, speechOutput, repromptText, shouldEndSession));
}


function handleSessionEndRequest(callback) {
    var cardTitle = "Session Ended";
    var speechOutput = "Okay, don't forget to keep learning!";
    var cardText = speechOutput;
    // Setting this to true ends the session and exits the skill.
    var shouldEndSession = true;

    callback({}, buildSpeechletResponse(cardTitle, cardText, speechOutput, null, shouldEndSession));
}

/**
 * Sets the color in the session and prepares the speech to reply to the user.
 */

function GetRecentPapersInSession(intent, session, callback) {
    var cardTitle = "Paper Title";
    var repromptText = "";
    var sessionAttributes = {};
    var shouldEndSession = false;
    var speechOutput = "";
    var cardText="";
    sessionAttributes.index = 0;
    sessionAttributes.data = "";
    var req = request(url);
  var feedparser = new FeedParser({'addmeta':false});

req.on('error', function (error) {
  console.log(error);
  cardTitle= 'Error';
  cardText= 'Sorry, Something went wrong, try again later';
  speechOutput= 'Sorry, Something went wrong, try again later';
  shouldEndSession= true;
      callback(sessionAttributes,
        buildSpeechletResponse(cardTitle, cardText, speechOutput, repromptText, shouldEndSession));
});

req.on('response', function (res) {
  var stream = this; // `this` is `req`, which is a stream

  if (res.statusCode !== 200) {
    this.emit('error', new Error('Bad status code'));
  }
  else {
    stream.pipe(feedparser);
  }
});

feedparser.on('error', function (error) {
  console.log(error);
  cardTitle= 'Error';
  cardText= 'Sorry, Something went wrong, try again later';
  speechOutput= 'Sorry, Something went wrong, try again later';
  shouldEndSession= true;
      callback(sessionAttributes,
        buildSpeechletResponse(cardTitle, cardText, speechOutput, repromptText, shouldEndSession));
});




feedparser.on('readable', function () {
  // This is where the action is!
  var stream = this; // `this` is `feedparser`, which is a stream
  //var meta = this.meta; // **NOTE** the "meta" is always available in the context of the feedparser instance
  var item;

  while (item = stream.read()) {
    //console.log(item);
    link = item["link"];
    title = item["title"].replace(/\r?\n|\r/g, " ");
    abstract = item["description"].replace(/\r?\n|\r/g, " ");
    papers.push({"title":title,"abstract":abstract,"link":link})
  }
});

feedparser.on('end', function(){

    session.attributes = sessionAttributes;

    speechOutput = "Here are the 50 most recent papers: " + papers[sessionAttributes.index]['title'] + ", Would you like me to read the abstract?";
    repromptText = "You can say things like, yes or  no. Would you like me to read the abstract?";
    cardTitle = papers[sessionAttributes.index]['title'];
    cardText = papers[sessionAttributes.index]['abstract'];
    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle, cardText, speechOutput, repromptText, shouldEndSession));


});




}

function GetNextPaper(intent, session, callback) {
    var cardTitle = "";
    var repromptText = "";
    var sessionAttributes = session.attributes;
    var shouldEndSession = false;
    var speechOutput = "";
    var cardText="";


    speechOutput = papers[sessionAttributes.index]['abstract'] + ", Would you like me to continue to the next paper?" ;
        repromptText = "You can say things like, yes or  no. Would you like to continue to the next paper?";
    justReadAnAbstract = true;
    cardText = ""; //papers[sessionAttributes.index]['abstract'];

    callback(sessionAttributes,
         buildSpeechletResponse(cardTitle,cardText, speechOutput, repromptText, shouldEndSession));

}

function GetNo(intent, session, callback) {
    var cardTitle = "Paper Title";
    var repromptText = "";
    var sessionAttributes = session.attributes;
    var shouldEndSession = false;
    var speechOutput = "";
    var cardText =""

    sessionAttributes.index++;
    if (sessionAttributes.index < papers.length){
        speechOutput = papers[sessionAttributes.index]['title'] + ", Would you like me to read the abstract?";
        repromptText = "You can say things like, yes or  no. Would you like me to read the abstract?";
        cardTitle = papers[sessionAttributes.index]['title'];
        cardText = papers[sessionAttributes.index]['abstract'];
    } else {
        speechOutput = "That was all, Check back tomorrow for more papers!";
        shouldEndSession = true;
    }

    callback(sessionAttributes,
         buildSpeechletResponse(cardTitle,cardText, speechOutput, repromptText, shouldEndSession));
}

//helper function that gets a summary from a category field
function getSummaryFromCategory(category){
  var arr_from_json = JSON.parse(json).papers;
  for (var i = 0; i < arr_from_json.length; i++){
    if (arr_from_json[i].category == category){
      if (!usedTitles.includes(arr_from_json[i].title){
        return arr_from_json[i].summary;
        usedTitles.push(arr_from_json.title);
      }
    }
  }
  return "No summary found";
}
function findSummary(intent,session, callback) {
    var cardTitle = "";
    var repromptText = "";
    var sessionAttributes = session.attributes;
    var shouldEndSession = false;
    var speechOutput = "";
    var cardText="";
    var summary = getSummary(subjectSlot);
    //would need to define a summary
    speechOutput = summary + ", Would you like me to continue to the next paper?" ;
        repromptText = "You can say things like, yes or  no. Would you like to continue to the next paper?";
    justReadASummary = true;
    cardText = "";

    callback(sessionAttributes,
         buildSpeechletResponse(cardTitle,cardText, speechOutput, repromptText, shouldEndSession));
}

function completeSummary(intent, session, callback) {
    var cardTitle = "";
    var repromptText = "";
    var sessionAttributes = session.attributes;
    var shouldEndSession = false;
    var speechOutput = "";
    var cardText="";
    var abstract="This would be the abstract"
    //would need to define a summary
    speechOutput = abstract + ", Would you like me to continue to the next paper?" ;
        repromptText = "You can say things like, yes or  no. Would you like to continue to the next paper?";
    justReadASummary = false;
    cardText = "";

    callback(sessionAttributes,
         buildSpeechletResponse(cardTitle,cardText, speechOutput, repromptText, shouldEndSession));
}


// --------------- Helpers that build all of the responses -----------------------

function buildSpeechletResponse(title, cardText, output, repromptText, shouldEndSession) {
    if (title==""){
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
    } else {
          return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        card: {
            type: "Simple",
            title:  title,
            content: cardText
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
    }
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: "1.0",
        sessionAttributes: sessionAttributes,
        response: speechletResponse
    };
}
