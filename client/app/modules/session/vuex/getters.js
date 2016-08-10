export function me(state) {
	return state.session.user;
}

export function notifications(state) {
	return state.session.notifications;
}

export function messages(state) {
	return state.session.messages;
}