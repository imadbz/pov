import * as functions from "firebase-functions";
import { AccessToken } from 'livekit-server-sdk';

import * as admin from "firebase-admin";
admin.initializeApp();

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
export const helloWorld = functions.https.onRequest((req, res) => {
  functions.logger.info("Hello logs!", {structuredData: true});
  res.send("Hello from Firebase!");
});

export const getLivekitAccessToken = functions.https.onRequest(async (req, res) => {
    // Auth REQUIRED
    // try { 
    //     const decodedIdToken = await validateFirebaseIdToken(req, res)
    // } catch (err) {
    //     res.status(403).send('Unauthorized');
    // }

    // Create access token
    // https://github.com/livekit/server-sdk-js

    const roomName = (req.query.roomName)?.toString() || 'name-of-room';
    const participantName = 'user-name';

    const at = new AccessToken(undefined, undefined, {
        identity: participantName,
    });

    at.addGrant({ roomJoin: true, room: roomName });
    
    const token = at.toJwt();

    res.send({
        roomName,
        token
    });
})






// Firebase Auth function
const validateFirebaseIdToken = async (req: functions.https.Request, res: functions.Response<any>) => {
  functions.logger.log('Check if request is authorized with Firebase ID token');

  if ((!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) &&
      !(req.cookies && req.cookies.__session)) {
    functions.logger.error(
      'No Firebase ID token was passed as a Bearer token in the Authorization header.',
      'Make sure you authorize your request by providing the following HTTP header:',
      'Authorization: Bearer <Firebase ID Token>',
      'or by passing a "__session" cookie.'
    );
    throw new Error();
  }

  let idToken;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    functions.logger.log('Found "Authorization" header');
    // Read the ID Token from the Authorization header.
    idToken = req.headers.authorization.split('Bearer ')[1];
  } else if(req.cookies) {
    functions.logger.log('Found "__session" cookie');
    // Read the ID Token from cookie.
    idToken = req.cookies.__session;
  } else {
    // No cookie
    throw new Error();
  }

  try {
    const decodedIdToken = await admin.auth().verifyIdToken(idToken);
    functions.logger.log('ID Token correctly decoded', decodedIdToken);
    
    return decodedIdToken;
  } catch (error) {
    functions.logger.error('Error while verifying Firebase ID token:', error);
    throw new Error();
  }
};
