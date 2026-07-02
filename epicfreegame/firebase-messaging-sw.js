import { initializeApp } from "//www.gstatic.com/firebasejs/12.15.0/firebase-app.js"
import { getMessaging, onBackgroundMessage } from "//www.gstatic.com/firebasejs/12.15.0/firebase-messaging-sw.js"
import firebaseConfig from "./config.js"

self.addEventListener("install", (evt) => {
	self.skipWaiting()
})

self.addEventListener("notificationclick", (evt) => {
	// close the notification
	evt.notification.close()

	const data = evt.notification.data
	evt.waitUntil((async () => {
		if (data) {
			const client = await self.clients.openWindow("./?from=notification")
			client.postMessage(data)
		} else {
			await self.clients.openWindow("./")
		}
	})())
})

const firebaseApp = initializeApp(firebaseConfig)
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
