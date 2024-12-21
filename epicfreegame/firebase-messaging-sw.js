import { initializeApp } from "//www.gstatic.com/firebasejs/11.1.0/firebase-app.js"
import { getMessaging, onBackgroundMessage } from "//www.gstatic.com/firebasejs/11.1.0/firebase-messaging-sw.js"

self.addEventListener("install", (evt) => {
	self.skipWaiting()
})

self.addEventListener("notificationclick", (evt) => {
	// close the notification
	evt.notification.close()

	const data = evt.notification.data
	evt.waitUntil((async () => {
		const client = await self.clients.openWindow("./?from=notification")
		client.postMessage(data)
	})())
})

const firebaseApp = initializeApp({
	apiKey: "AIzaSyALyDL5Ixr4gVf6T5HMlV8W8rH6yiA41ys",
	authDomain: "triple-silo-294123.firebaseapp.com",
	projectId: "triple-silo-294123",
	storageBucket: "triple-silo-294123.appspot.com",
	messagingSenderId: "523905433176",
	appId: "1:523905433176:web:a79c91d198d5246402142d",
	measurementId: "G-PEG3EM3YFY"
})

const messaging = getMessaging(firebaseApp)
onBackgroundMessage(messaging, (payload) => {
	// check if the payload is a notification
	if (payload.notification) {
		// the notification is displayed automatically,
		// skip the rest of the function
		return
	}
	/** @type {(Object.<string, string>|null)} data */
	const data = payload.data;
	if (!data) {
		console.warn("Empty data payload", payload)
		return
	}
	if (self.Notification.permission !== "granted") {
		console.warn("Notification permission is not granted")
		return
	}
	// handle the message
	const title = `Epic free games: ${Object.keys(data).length} new game(s) avaliable`
	/** @type {NotificationOptions} options */
	const options = {
		body: Object.keys(data).join(", "),
		data,
	}
	// show the notification, the function must return the promise,
	// to prevent the default notification from being displayed
	return self.registration.showNotification(title, options)
})
