"use strict";

let C = {};

C.append = function(items, prefix) {
	items.forEach((item) => {
		let name = item.toUpperCase();
		if (prefix)
			name = prefix + "_" + name;
		C[name] = item;
	});
}

/**
 * User role constants
 */
C.append([
	"admin",
	"user",
	"guest"
], "ROLE");

C.append([
	"admin",
	"owner",
	"loggedIn",
	"public"
], "PERM");

/**
 * Response error causes
 */
C.append([
	"VALIDATION_ERROR",
	"INVALID_CODE",
	"MODEL_NOT_FOUND",
	"ONLY_OWNER_CAN_EDIT_AND_DELETE"
], "ERR");


module.exports = C;

console.log(C);