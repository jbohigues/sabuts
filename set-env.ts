const setEnv = () => {
  const fs = require('fs');
  const writeFile = fs.writeFile;
  const targetPath = './src/environments/environment.prod.ts';
  const envConfigFile = `
export const environment = {
  production: true,
  maxCorrectAnswers: ${process.env['MAX_CORRECT_ANSWERS'] || 3},
  pointsToWinGame: ${process.env['POINTS_TO_WIN_GANE'] || 15},
  maxGamesInPlay: ${process.env['MAX_GAMES_IN_PLAY'] || 5},
  firebaseConfig: {
    apiKey: '${process.env['FIREBASE_API_KEY']}',
    authDomain: '${process.env['FIREBASE_AUTH_DOMAIN']}',
    projectId: '${process.env['FIREBASE_PROJECT_ID']}',
    storageBucket: '${process.env['STORAGE_BUCKET']}',
    messagingSenderId: '${process.env['MESSAGING_SENDER_ID']}',
    appId: '${process.env['APP_ID']}',
    measurementId: '${process.env['MEASUREMENT_ID']}',
  },
};
`;

  writeFile(targetPath, envConfigFile, (err: any) => {
    if (err) {
      console.error(err);
      throw err;
    }
  });
};

setEnv();
