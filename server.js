const express = require('express');
const bodyParser = require('body-parser');
const db = require("./models");
const PORT = process.env.PORT || 3000;
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("build"));

require("./routes/api-routes.js")(app);

db.sequelize.sync({
}).then(function() {
	app.listen(PORT, function() {
		console.log("App listening on PORT " + PORT);
	});
});