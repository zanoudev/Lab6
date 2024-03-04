// required packages
var bodyParser = require("body-parser");
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var fs = require("fs");

// read the data file
function readData(fileName) {
  let dataRead = fs.readFileSync("./data/" + fileName + ".json");
  let infoRead = JSON.parse(dataRead);
  return infoRead;
}

// read the data file
function writeData(info, fileName) {
  data = JSON.stringify(info);
  fs.writeFileSync("./data/" + fileName + ".json", data);
}

// update the data file, I use "name" to be equal to fruit, or animal or color
// to match with the file names
// I assume we always just add 1 to a single item
function combineCounts(name, value) {
  // console.log(value);
  info = readData(name);
  // will be useful for text entry, since the item typed in might not be in the list
  var found = 0;
  for (var i = 0; i < info.length; i++) {
    if (info[i][name] === value) {
      info[i].count = parseInt(info[i].count) + 1;
      found = 1;
    }
  }
  if (found === 0) {
    info.push({ [name]: value, count: 1 });
  }
  writeData(info, name);
}

// This is the controler per se, with the get/post
module.exports = function (app) {
  // when a user goes to localhost:3000/analysis
  // serve a template (ejs file) which will include the data from the data files
  app.get("/analysis", function (req, res) {
    var q1 = readData("q1");
    var q2 = readData("q2");
    var q3 = readData("q3");
    var q4 = readData("q4");
    var q5 = readData("q5");

    res.render("showResults", { results: [q1, q2, q3, q4, q5] });
    console.log([q1, q2, q3, q4, q5]);
  });

  // when a user goes to localhost:3000/niceSurvey
  // serve a static html (the survey itself to fill in)
  app.get("/niceSurvey", function (req, res) {
    res.sendFile(__dirname + "/src/niceSurvey.html");
  });

  // when a user types SUBMIT in localhost:3000/niceSurvey
  // the action.js code will POST, and what is sent in the POST
  // will be recuperated here, parsed and used to update the data files
  app.post("/niceSurvey", urlencodedParser, function (req, res) {
    console.log(req.body);
    var json = req.body;
    for (var key in json) {
      console.log(key + ": " + json[key]);
      // in the case of checkboxes, the user might check more than one
      if (key === "option" && json[key].length === 2) {
        for (var item in json[key]) {
          combineCounts(key, json[key][item]);
        }
      } else {
        combineCounts(key, json[key]);
      }
    }
    // mystery line... (if I take it out, the SUBMIT button does change)
    // if anyone can figure this out, let me know!
    res.sendFile(__dirname + "/src/niceSurvey.html");
  });
};
