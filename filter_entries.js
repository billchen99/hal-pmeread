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

var usedTitles = [];
//returns an array of titles from the category

function getAbstractFromTitle(title){
  var arr_from_json = JSON.parse(json).papers;
  var abstract = "";
  for (var i = 0; i < arr_from_json.length; i++){
    if (arr_from_json[i].title == title){
      abstract = arr_from_json[i].abstract;
    }
  }
  return abstract;
}

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
  return "";
}




// getAbstractFromSummary("model,memory,recognition");
