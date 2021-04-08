const firebaseConfig = {
	apiKey: "AIzaSyALyDL5Ixr4gVf6T5HMlV8W8rH6yiA41ys",
	authDomain: "triple-silo-294123.firebaseapp.com",
	projectId: "triple-silo-294123",
	storageBucket: "triple-silo-294123.appspot.com",
	messagingSenderId: "523905433176",
	appId: "1:523905433176:web:a79c91d198d5246402142d",
	measurementId: "G-PEG3EM3YFY"
}

firebase.initializeApp(firebaseConfig);
// firebase.analytics();

const messaging = firebase.messaging()

function sub() {
	Notification.requestPermission()
	.then(function () {
		console.log('Have permission')
		return messaging.getToken({ vapidkey: "BBxTI5zZIw6TOuASd1U9tb-Ye4zQONJPvaaw_0iCbX63-vvon7nuOnyzklBsFtbuULsT77PPcvKaoWtC6o6unDY" })
	})
	.then(function (token) {
		fetch("https://asia-east2-triple-silo-294123.cloudfunctions.net/function-1?subscribe=1&token="+token)
			.then(function(response) {
				console.log(response.body)
				if (response.status === 200) {
					alert("订阅成功")
				} else {
					alert("订阅失败")
				}
			}).catch(function(e) {
				console.log(e)
				alert("订阅失败")
			})
	})
	.catch(function (err) {
		console.log(err)
	})
}

function unsub() {
	messaging.deleteToken()
	alert("退订成功")
}
