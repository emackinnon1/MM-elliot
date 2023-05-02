// const request = require("request");

Module.register("MMM-Aurora", {
	// Default module config.
	defaults: {
		pole: "north", // north, south, solar, coronal or sunX. Set in config.js
		maxWidth: "100%", // Set in config.js. Adjusts size of image. Retains aspect ratio.
		updateInterval: 10 * 60 * 1000, // set in config.js. Image source updates about every 10 minutes
		animationSpeed: 3000 // fade in/out speed. 0 = no fade in/out
	},

	getScripts: function () {
		return ["modules/" + this.name + "/node_modules/chart.js/dist/chart.min.js"];
	},

	start: function () {
		const self = this;
		self.sendSocketNotification("START", { message: "start connection" });
		this.url = "";

		// Schedule update timer
		this.getForecasts();
		setInterval(function () {
			self.getForecasts();
			this.updateDom(self.config.animationSpeed || 0);
		}, this.config.updateInterval);
	},

	getForecasts: function () {
		this.sendSocketNotification("MMM-Aurora_GET_FORECAST");
	},

	getStyles: function () {
		return ["MMM-Aurora.css"];
	},

	// Override dom generator.
	getDom: function () {
		const Self = this;
		var wrapper = document.createElement("div");
		wrapper.setAttribute("style", "position: relative; display: inline-block");
		var image = document.createElement("img");
		var getTimeStamp = new Date().getTime();
		image.classList.add = "photo";

		if (this.config.pole === "north") {
			this.url = "https://services.swpc.noaa.gov/images/animations/ovation/north/latest.jpg";
		} else if (this.config.pole === "south") {
			this.url = "https://services.swpc.noaa.gov/images/animations/ovation/south/latest.jpg";
		} else if (this.config.pole === "solar") {
			this.url = "https://services.swpc.noaa.gov/images/animations/enlil/latest.jpg";
		} else if (this.config.pole === "coronal") {
			this.url = "https://services.swpc.noaa.gov/images/animations/lasco-c3/latest.jpg";
		} else if (this.config.pole === "sunX") {
			this.url = "https://services.swpc.noaa.gov/images/animations/GOES-14-CS-PTHNA-0.4/latest.png";
		}

		image.src = this.url + "?seed=" + getTimeStamp;
		image.style.maxWidth = this.config.maxWidth;

		wrapper.appendChild(image);

		const twentySevenDayChartConfig = {
			type: "bar",
			data: {
				labels: Object.keys(Self.twentySevenDayForecast),
				datasets: [
					{
						label: "27 day Aurora Forecast",
						data: Object.values(Self.twentySevenDayForecast),
						fill: true,
						backgroundColor: "rgb(255, 255, 255, .3)",
						borderColor: "rgb(255, 255, 255)"
					}
				]
			},
			options: {
				scales: {
					y: {
						beginAtZero: true
					}
				}
			}
		};
		var e = document.createElement("div");
		wrapper.appendChild(e);

		const twentySevenDayChart = document.createElement("canvas");
		e.appendChild(twentySevenDayChart);
		const tsChart = new Chart(twentySevenDayChart, twentySevenDayChartConfig);

		twentySevenDayChart.width = 200 + "px";
		twentySevenDayChart.height = 100 + "px";
		twentySevenDayChart.setAttribute("style", "display: block");
		tsChart.update();
		wrapper.appendChild(twentySevenDayChart);

		return wrapper;
	},

	socketNotificationReceived: function (notification, payload) {
		console.log("socketNotificationReceived: " + notification);
		if (notification === "MMM-Aurora_three_day_forecast") {
			this.updateDom();
			if (payload["data"] !== {}) {
				this.threeDayForecast = payload["data"];
				this.updateDom();
			}
		} else if (notification === "MMM-Aurora_twenty_seven_day_forecast") {
			this.updateDom();
			if (payload["data"] !== {}) {
				this.twentySevenDayForecast = payload["data"];
				this.updateDom();
			}
		}
	},

	/////  Add this function to the modules you want to control with Hello-Lucy //////

	notificationReceived: function (notification, payload) {
		console.log("notificationReceived: " + notification);
		if (notification === "HIDE_AURORA") {
			this.hide(1000);
		} else if (notification === "SHOW_AURORA") {
			this.show(1000);
		}
	}
});
