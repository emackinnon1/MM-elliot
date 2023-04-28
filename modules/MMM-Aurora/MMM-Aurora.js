Module.register("MMM-Aurora", {
	// Default module config.
	defaults: {
		pole: "north", // north, south, solar, coronal or sunX. Set in config.js
		maxWidth: "100%", // Set in config.js. Adjusts size of image. Retains aspect ratio.
		updateInterval: 10 * 60 * 1000, // set in config.js. Image source updates about every 10 minutes
		animationSpeed: 3000 // fade in/out speed. 0 = no fade in/out
	},

	start: function () {
		self = this;
		this.url = "";

		// Schedule update timer
		var self = this;
		setInterval(function () {
			self.updateDom(self.config.animationSpeed || 0);
		}, this.config.updateInterval);
	},

	getStyles: function () {
		return ["MMM-Aurora.css"];
	},

	// Override dom generator.
	getDom: function () {
		var wrapper = document.createElement("div");
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

		return wrapper;
	},

	/////  Add this function to the modules you want to control with Hello-Lucy //////

	notificationReceived: function (notification, payload) {
		if (notification === "HIDE_AURORA") {
			this.hide(1000);
		} else if (notification === "SHOW_AURORA") {
			this.show(1000);
		}
	}
});
