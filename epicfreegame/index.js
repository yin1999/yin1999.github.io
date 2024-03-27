import { initializeApp } from 'firebase/app'
import { initializeAnalytics } from "firebase/analytics"
import { getMessaging, getToken, deleteToken } from 'firebase/messaging'
import { getDatabase, ref, onValue } from 'firebase/database'

const firebaseConfig = {
	apiKey: "AIzaSyALyDL5Ixr4gVf6T5HMlV8W8rH6yiA41ys",
	authDomain: "triple-silo-294123.firebaseapp.com",
	databaseURL: "https://triple-silo-294123-default-rtdb.firebaseio.com/",
	projectId: "triple-silo-294123",
	storageBucket: "triple-silo-294123.appspot.com",
	messagingSenderId: "523905433176",
	appId: "1:523905433176:web:a79c91d198d5246402142d",
	measurementId: "G-PEG3EM3YFY"
}

let messaging = null;
const subscribeURL = "//firebase-subscribe-k2xj5acqmq-uc.a.run.app/"
const serviceWorker = "./firebase-messaging-sw.js"

function getQueryVariable(query, name) {
	const params = new URLSearchParams(query)
	return params.get(name)
}

/**
 * 
 * @param {Array<String>} items
 */
function showGame(items) {
	const df = new DocumentFragment();
	for (const item of items) {
		const li = document.createElement("li")
		li.innerHTML = `<a href="//store.epicgames.com/zh-CN/${item}" target="_blank">${item.substring(item.indexOf('/')+1)}</a>`
		df.appendChild(li)
	}
	document.querySelector("#gameList").appendChild(df)
}

async function init() {
	let slug = getQueryVariable(window.location.search.substring(1), "slug")
	if (slug) {
		showGame(slug.split(';'))
	}
	const firebaseApp = initializeApp(firebaseConfig)
	initializeAnalytics(firebaseApp, {
		cookie_flags: "SameSite=None; Secure; Partitioned"
	})
	messaging = getMessaging(firebaseApp)
	if (!slug) {
		const db = getDatabase(firebaseApp)
		const slugRef = ref(db, "freeGameList")
		onValue(slugRef, snapshot => {
			showGame(snapshot.val())
		})
	}
}

async function sub() {
	if (Notification.permission !== "granted") {
		if(!confirm('请授予通知权限')) {
			return
		}
		const permission = await Notification.requestPermission()
		if (permission !== "granted") {
			alert('未授予通知权限')
			return
		}
	}
	try {
		const token = await getToken(messaging, {
			vapidKey: "BBxTI5zZIw6TOuASd1U9tb-Ye4zQONJPvaaw_0iCbX63-vvon7nuOnyzklBsFtbuULsT77PPcvKaoWtC6o6unDY",
			serviceWorkerRegistration: await registerServiceWorker()
		})
		const res = await fetch(subscribeURL, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ method: "subscribe", token })
		})
		if (res.ok) {
			localStorage.setItem('token', token)
			alert('订阅成功')
		} else {
			const body = await res.json()
			throw new Error(body.message)
		}
	} catch (e) {
		if (e instanceof TypeError) {
			alert('请求失败')
		} else {
			alert(`订阅失败：${e.message}`)
		}
	}
}

async function unsub() {
	const token = localStorage.getItem('token')
	if (token) {
		localStorage.removeItem('token')
		fetch(subscribeURL, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ method: "unsubscribe", token })
		})
	}
	// provide the service worker registration to the messaging instance
	if (!messaging.swRegistration) {
		messaging.swRegistration = await registerServiceWorker()
	}
	const success = await deleteToken(messaging)
	await unregisterServiceWorker()
	if (success) {
		alert("退订成功")
	} else {
		alert("退订失败")
	}
}

async function registerServiceWorker() {
	// check if service worker has been registered
	let registration = await navigator.serviceWorker.getRegistration(serviceWorker)
	if (registration) {
		// try to update the service worker
		await registration.update()
	} else {
		registration = await navigator.serviceWorker.register(serviceWorker, {
			type: "module",
			updateViaCache: "all"
		})
	}
	// wait for the service worker to be ready
	await navigator.serviceWorker.ready
	return registration
}

async function unregisterServiceWorker() {
	const registration = await navigator.serviceWorker.getRegistration(serviceWorker)
	if (registration) {
		await registration.unregister()
	}
}

init()

document.querySelector('#sub').addEventListener('click', sub)
document.querySelector('#unsub').addEventListener('click', unsub)
