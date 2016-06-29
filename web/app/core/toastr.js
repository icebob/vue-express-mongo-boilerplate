let style 	= require('toastr/build/toastr.css');
let toastr 	= require('toastr/build/toastr.min.js');

toastr.options = {
	debug: false,
	newestOnTop: true,
	timeOut: 5000
};

export default toastr;