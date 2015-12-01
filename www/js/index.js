/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
	// Application Constructor
	initialize: function () {
		this.bindEvents();
	},
	// Bind Event Listeners
	//
	// Bind any events that are required on startup. Common events are:
	// 'load', 'deviceready', 'offline', and 'online'.
	bindEvents: function () {
		document.addEventListener( 'deviceready', this.onDeviceReady, false );
	},
	// deviceready Event Handler
	//
	// The scope of 'this' is the event. In order to call the 'receivedEvent'
	// function, we must explicitly call 'app.receivedEvent(...);'
	onDeviceReady: function () {

		// Get a reference to the plugin.
		var bgGeo = window.BackgroundGeolocation;

		/**
		 * This callback will be executed every time a geolocation is recorded in the background.
		 */
		var callbackFn = function ( location, taskId ) {
			var coords = location.coords;
			var lat = coords.latitude;
			var lng = coords.longitude;

			console.log( 'callbackFn > location >', JSON.stringify( location, true, 4 ) )

			bgGeo.getState( function ( data ) {
				console.log( 'callbackFn > bgGeo.getState >', JSON.stringify( data, true, 4 ) )
			} )

			// Simulate doing some extra work with a bogus setTimeout.  This could perhaps be an Ajax request to your server.
			// The point here is that you must execute bgGeo.finish after all asynchronous operations within the callback are complete.
			setTimeout( function () {
				bgGeo.finish( taskId ); // <-- execute #finish when your work in callbackFn is complete
			}, 1000 );
		};

		var failureFn = function ( error ) {
			console.log( 'BackgroundGeoLocation error', error );
		}

		// BackgroundGeoLocation is highly configurable.
		bgGeo.configure( callbackFn, failureFn, {
			// Geolocation config
			desiredAccuracy: 0,
			stationaryRadius: 50,
			distanceFilter: 50,
			disableElasticity: false, // <-- [iOS] Default is 'false'.  Set true to disable speed-based distanceFilter elasticity
			locationUpdateInterval: 5000,
			minimumActivityRecognitionConfidence: 80, // 0-100%.  Minimum activity-confidence for a state-change 
			fastestLocationUpdateInterval: 5000,
			activityRecognitionInterval: 10000,
			stopDetectionDelay: 1, // [iOS] delay x minutes before entering stop-detection mode
			stopTimeout: 2, // Stop-detection timeout minutes (wait x minutes to turn off tracking)
			activityType: 'AutomotiveNavigation',

			// Application config
			debug: true, // <-- enable this hear sounds for background-geolocation life-cycle.
			forceReloadOnLocationChange: false, // <-- [Android] If the user closes the app **while location-tracking is started** , reboot app when a new location is recorded (WARNING: possibly distruptive to user) 
			forceReloadOnMotionChange: false, // <-- [Android] If the user closes the app **while location-tracking is started** , reboot app when device changes stationary-state (stationary->moving or vice-versa) --WARNING: possibly distruptive to user) 
			forceReloadOnGeofence: false, // <-- [Android] If the user closes the app **while location-tracking is started** , reboot app when a geofence crossing occurs --WARNING: possibly distruptive to user) 
			stopOnTerminate: false, // <-- Don't stop tracking when user closes app.
			startOnBoot: true, // <-- [Android] Auto start background-service in headless mode when device is powered-up.

			// HTTP / SQLite config
			url: 'http://posttestserver.com/post.php?dir=cordova-background-geolocation',
			method: 'POST',
			batchSync: false, // <-- [Default: false] Set true to sync locations to server in a single HTTP request.
			autoSync: true, // <-- [Default: true] Set true to sync each location to server as it arrives.
			maxDaysToPersist: 1, // <-- Maximum days to persist a location in plugin's SQLite database when HTTP fails
			headers: {
				"X-FOO": "bar"
			},
			params: {
				"auth_token": "maybe_your_server_authenticates_via_token_YES?"
			}
		} );

		bgGeo.onHttp( function ( response ) {
			var status = response.status;
			var responseText = response.responseText;
			var res = JSON.parse( responseText ); // <-- if your server returns JSON

			console.log( "- HTTP success", status, res );

		}, function ( response ) {
			var status = response.status;
			var responseText = response.responseText;
			console.log( "- HTTP failure: ", status, responseText );
		} )
		
		// Turn ON the background-geolocation system.  The user will be tracked whenever they suspend the app.
		bgGeo.start();

		// If you wish to turn OFF background-tracking, call the #stop method.
		// bgGeo.stop()
	}
};

app.initialize();

