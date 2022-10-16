import React, { createContext, useState, useEffect, useRef, useCallback } from 'react';
import { ROOM_INFO } from '../constants';

const CallContext = createContext({
  remoteStream: null,
  localStream: null,
});


export const CallProvider = ({ children, engageDigitalPkg}) => {
  const [showRemote, setShowRemote] = useState(false);
  const [engageDigital, setEngageDigitalClient] = useState();
  const [remoteStream, _setRemoteStream] = useState(null);
  const remoteStreamRefApp = useRef(remoteStream);
  const [localStream, _setLocalStream] = useState(null);
  const [session, setSession] = useState(null);
  const [info, setInfo] = useState(null);
  const [callButtonStatus, setcallButtonStatus] = useState(false);
  const localStreamRefApp = useRef(localStream);
  const remoteStreamRef = useRef(null);
  const localStreamRef = useRef(null);
  const [mySip, setSIP] = useState();
  let engageDigitalSession;

  useEffect(( ) => {
      if(info === 'Connected to Engage Digital') {
          console.log('joining room with id: ', ROOM_INFO.id);
          joinRoom();
      }
  }, [info]);

  function joinRoom() {
      try {
        if (engageDigital) {
          engageDigital.joinRoom(`conf:${ROOM_INFO.id}`, {
            mediaConstraints: {
              audio: true,
              video: true,
            },
            joinWithVideoMuted: false,
          });
          console.log('join room called');
        }
      } catch (error) {
        updateStatus('Call: Provide valid phone number');
        console.log('Error in make call : ' + error);
      }
    }
  
 useEffect(() => {

  function onNewEngageSession(session) {
      console.log('Got newRTCSession event direction is %s', session.getDirection());
  
      engageDigitalSession = session;
      setSession(session);
  
      /**
       * Can play some media file indicates call is ringing state
       */
      engageDigitalSession.addEventHandler('ringing', () => {
        updateStatus('Call: Ringing');
      });
  
      engageDigitalSession.addEventHandler('connecting', () => {
        updateStatus('Call: connecting');
      });
      /**
       * Call is connected, can use this event to update the status of call in UI
       */
      engageDigitalSession.addEventHandler('connected', () => {
        updateStatus('Call: Connected');
      });
  
      /**
       * Call is disconnected by the client, can use this event to update the status of call in UI
       */
      engageDigitalSession.addEventHandler('disconnected', () => {
        updateStatus('Call: DisConnected');
  
        setSession(null);
      });
  
      /**
       * Call is disconnected by the remote user, can use this event to update the status of call in UI
       */
      engageDigitalSession.addEventHandler('peerdisconnected', () => {
        updateStatus('Call: Remote party disconnected');
  
        setSession(null);
      });
  
      /**
       * Call is failed
       */
      engageDigitalSession.addEventHandler('failed', () => {
        //Close the dialog if its an incoming call and user has not accepted the call.
        //var $confirm = $("#incomingCallDialog");
        //$confirm.modal("hide");
        setSession(null);
        updateStatus('Call: Failed');
      });
  
      /**
       * On this event attach your local stream to the local video element
       */
      engageDigitalSession.addEventHandler('localstream', ({ stream }) => {
        updateStatus('Call: Got Local video');
        if (localStreamRefApp.current) {
          setLocalStreamHandler(stream);
        } else {
          setLocalStream(stream);
        }
      });
  
      engageDigitalSession.addEventHandler('localvideoadded', ({ stream }) => {});
  
      engageDigitalSession.addEventHandler('localvideoremoved', ({ stream }) => {});
  
      /**
       * On this event attach remote party's stream to the remote video element
       */
      engageDigitalSession.addEventHandler('remotestream', ({ stream }) => {
        updateStatus('Call: Got Remote video');
        const remoteStreamRef = document.getElementById('remoteStream');
        if (remoteStreamRef) {
          if (remoteStreamRef.srcObject !== null) {
            if (stream.getVideoTracks().length > 0) {
              stream.getVideoTracks()[0].enabled = false;
            }
            remoteStreamRef.onloadedmetadata = function () {
              const tracks = stream.getVideoTracks();
  
              for (let i = 0; i < tracks.length; ++i) {
                tracks[i].enabled = true;
              }
            };
  
            remoteStreamRef.srcObject = null;
            remoteStreamRef.srcObject = stream;
          } else {
            setRemoteStream(stream);
          }
        } else {
          setRemoteStream(stream);
        }
      });
  
      engageDigitalSession.addEventHandler('remotevideoadded', ({ stream }) => {
        console.log('Got remotevideoadded event');
      });
  
      engageDigitalSession.addEventHandler('remotevideoremoved', ({ stream }) => {
        console.log('Got remotevideoremoved event');
      });
  
      /**
       * Its an Incoming call, need to invoke acceptCall API on EngageDigitalSession.
       */
      if (engageDigitalSession.getDirection() === 'incoming') {
        handleIncomingCall();
      }
    }

  function registerForEngageDigitalClientEvents() {
      if(engageDigital) {
      /**
       * The Ready event is emitted when the SDK is initialized successfully and is ready
       * for operation. Once this event is received connect() API can be invoked.
       */
       engageDigital.addEventHandler('ready', () => {
          engageDigital.connect();
      });
  
      engageDigital.addEventHandler('connecting', () => {
        updateStatus('Connecting to Engage Digital...');
      });
  
      /*
       * This event is being called when connectivity is established for the first time.
       */
      engageDigital.addEventHandler('connected', () => {
        updateStatus('Connected to Engage Digital');
        console.log('Your Sip Identity : ' + engageDigital.getUri().toString());
        setSIP(engageDigital.getUri().toString())
      });
  
      /*
       * This event is emitted when the Connection with the engage domain is lost
       */
      engageDigital.addEventHandler('disconnected', () => {
        updateStatus('Disconnected from Engage Digital');
      });
  
      /*
       * This event is emitted when the sdk tries to re-connect when the already established connection is lost
       */
      engageDigital.addEventHandler('reconnecting', () => {
        updateStatus('Re-connecting to Engage Digital');
      });
  
      /**
       * Fired when the connection is re-established
       */
       engageDigital.addEventHandler('reconnected', () => {
        updateStatus('Re-connected to Engage Digital');
      });
  
      engageDigital.addEventHandler('failed', (error) => {
        updateStatus(JSON.stringify(error));
      });
  
      engageDigital.addEventHandler('errorinfo', ({ errorMessage }) => {
        updateStatus(errorMessage);
      });
  
      /**
       * For an incoming/outgoing call this event will be triggered.
       * This event will carry an instance of EngageDigitalSession, on that call related events can be registered.
       * If the new session is for an incoming call EngageDigitalSession's acceptCall() API can be invoked to accept the call.
       */
       engageDigital.addEventHandler('newRTCSession', onNewEngageSession);
  }
    }
    registerForEngageDigitalClientEvents();
 }, [engageDigital]);

  useEffect(() => {
      if(engageDigitalPkg) {
        const client =  new engageDigitalPkg.EngageDigitalClient('aa', 'rtc.engagedigital.ai');
        console.log('got client', client);
        setEngageDigitalClient(client);
      }
  
    }, [engageDigitalPkg]);

function disconnectCall() {
  if (session) {
    session.disconnectCall();
    setSession(null);
  }
}

function setLocalStreamHandler(stream) {
  const localStreamRef = document.getElementById('localStream');
  if (localStreamRef) {
    localStreamRef.srcObject = null;
    localStreamRef.srcObject = stream;
  } else {
    setLocalStream(stream);
  }
}

function setLocalStream(data) {
  localStreamRefApp.current = data;
  _setLocalStream(data);
}

function setRemoteStream(data) {
  remoteStreamRefApp.current = data;
  _setRemoteStream(data);
}

function updateStatus(status) {
  console.log(status);
  setInfo(status);
}

function handleIncomingCall() {
  updateStatus('Incoming call....');
}

/*
useEffect(() => {
  if (localStreamRef && localStreamRef.current) {
    localStreamRef.current.srcObject = null;
    localStreamRef.current.srcObject = localStream;
  }
}, [localStream]);*/

useEffect(() => {
  if (remoteStreamRef && remoteStreamRef.current) {
    if (remoteStream) {
      if (remoteStream.getVideoTracks().length > 0) {
        console.log('remoteStream.getVideoTracks()', remoteStream.getVideoTracks());
        remoteStream.getVideoTracks()[0].enabled = false;
      }
      remoteStreamRef.current.onloadedmetadata = function () {
        const tracks = remoteStream.getVideoTracks();

        for (let i = 0; i < tracks.length; ++i) {
          tracks[i].enabled = true;
        }
      };
    }
    remoteStreamRef.current.srcObject = null;
    remoteStreamRef.current.srcObject = remoteStream;
  }
}, [remoteStream]); 

useEffect(() => {
  setTimeout(() => {
    setShowRemote(true);
  }, [60000])
}, [])


  return (
    <CallContext.Provider
      value={{
        remoteStream,
        localStream,
        showRemote,
        setShowRemote
      }}
    >
      {children}
    </CallContext.Provider>
  );
};

export function useCallContext() {
  const context = React.useContext(CallContext);
  if (context === undefined) {
    throw new Error('useCallContext must be used within Call Provider');
  }
  return context;
}
