module.exports = {
	postcss: {
		plugins: [
			require("autoprefixer")({
				browsers: ["last 3 versions"]
			}),
			require("precss")
		]
	}
};