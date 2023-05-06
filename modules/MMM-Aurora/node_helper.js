const { json } = require("express");
const NodeHelper = require("node_helper");
const request = require("request");

module.exports = NodeHelper.create({
	start: function () {
		console.log("MMM-Aurora helper started...");
	},

	getForecasts: function () {
		const Self = this;
		let forecast = { twentySeven: {}, threeDay: {} };
		const timeMappings = {
			"00-03UT": "18-21MDT",
			"03-06UT": "21-00MDT",
			"06-09UT": "00-03MDT",
			"09-12UT": "03-06MDT",
			"12-15UT": "06-09MDT",
			"15-18UT": "09-12MDT",
			"18-21UT": "12-15MDT",
			"21-00UT": "15-18MDT"
		};

		request("http://services.swpc.noaa.gov/text/27-day-outlook.txt", (err, response, body) => {
			if (err) {
				console.error(err);
			} else {
				const array = body.split("\n");
				let startLine = 0;
				for (i in array) {
					if (array[i].startsWith("#  Date")) {
						startLine = Number(i) + 1;
						break;
					}
				}
				let siphonedArray = array.slice(startLine);
				let dataArrays = siphonedArray.map((row) => {
					splitRow = row.split(" ");
					return splitRow.filter((item) => item !== " " && item !== "");
				});
				let filtered = dataArrays.filter((arr) => arr.length > 0);
				filtered.forEach((row) => {
					date = `${row[0]} ${row[1]} ${row[2]}`;
					kp = row[5];

					forecast["twentySeven"][date] = kp;
				});
				console.log("27 day forecast", forecast["twentySeven"]);

				Self.sendSocketNotification("MMM-Aurora_twenty_seven_day_forecast", { data: forecast["twentySeven"] });
			}
		});

		request("https://services.swpc.noaa.gov/text/3-day-forecast.txt", (err, response, body) => {
			if (err) {
				console.error("ERROR", err);
			} else {
				const array = body.split("\n");
				noSpaces = array.filter((row) => row !== "" && row !== " ");
				let startLine = 0;
				for (i in noSpaces) {
					if (noSpaces[i].startsWith("NOAA Kp index breakdown ")) {
						startLine = Number(i) + 1;
						break;
					}
				}
				rawRows = noSpaces.slice(startLine, startLine + 9).map((row) => row.trim());
				daysStepOne = rawRows[0].split(" ").filter((i) => i !== "");
				days = daysStepOne.reduce((acc, curr, i) => {
					if (i % 2 === 0) {
						acc.push(`${curr} ${daysStepOne[i + 1]}`);
					}
					return acc;
				}, []);
				dataStepOne = rawRows.slice(1);
				dataStepTwo = dataStepOne.map((r) => r.split(" ").filter((item, i) => i === 0 || (item !== "" && Number(item))));
				dataStepTwo.forEach((row, i) => {
					const kps = row.slice(1);
					kps.forEach((kp, j) => {
						let time = timeMappings[row[0]];
						let day = days[j];

						forecast["threeDay"][day] = { ...forecast["threeDay"][day], [time]: kp };
					});
				});
				console.log("3 day forecast", forecast["threeDay"]);
				Self.sendSocketNotification("MMM-Aurora_three_day_forecast", { data: forecast["threeDay"] });
			}
		});
	},
	socketNotificationReceived: function (notification) {
		console.log(notification);
		if (notification === "START") {
			console.log("bitches");
			this.sendSocketNotification("MSG", { mes: "test" });
		}
		if (notification === "MMM-Aurora_GET_FORECAST") {
			this.getForecasts();
		}
	}
});
