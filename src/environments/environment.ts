// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  maxCorrectAnswers: 3,
  pointsToWinGame: 15,
  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  firebaseConfig: {
    apiKey: 'AIzaSyCZesBkML3xiUe9oY3ykLoI7b15TsHNGcw',
    authDomain: 'preguntados-raval.firebaseapp.com',
    projectId: 'preguntados-raval',
    storageBucket: 'preguntados-raval.appspot.com',
    messagingSenderId: '433139480068',
    appId: '1:433139480068:web:1463b65aaeb1c9e8eee751',
    measurementId: 'G-FTT4DD2HFL',
  },
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
