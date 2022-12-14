import Head from "next/head";
import { Suspense, useEffect, useRef, useState, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Loader, softShadows, Sky } from "@react-three/drei";
import { ClinicModel } from "../src/components/ClinicModel";
import { Ground } from "../src/components/Ground";
import Character from "../src/components/Character";
import {Doctor} from "../src/components/Doctor";
import styles from "../styles/Home.module.css";
import * as THREE from "three";
import { useCallContext } from "../src/providers/CallProvider";

softShadows();

const Video = () => {
  const{remoteStream, showRemote} = useCallContext();
  const [myStream, setMyStream] = useState(null);
  const remoteStreamRef = useRef(null);


  useEffect(() => {
    const getMediaDevices = async () => {
      const mediaConstraints = {audio: true, video: true };
      const mediaStream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
      setMyStream(mediaStream);
    };
      getMediaDevices();
  }, []);
  
  useEffect(() => {
    if (remoteStreamRef && remoteStreamRef.current) {
      if (myStream) {
      remoteStreamRef.current.srcObject = myStream;
    }
  }
  }, [remoteStreamRef, myStream]);
  /*
  useEffect(() => {
    if (remoteStreamRef && remoteStreamRef.current) {
      if (remoteStream) {
        if (localStream.getVideoTracks().length > 0) {
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
  }, [remoteStream]);*/

  return(
  <div style={{position: 'absolute', zIndex: 2, top: 20, left: 20,}}>
 
<video
                ref={remoteStreamRef}
                autoPlay
                loop
                playsInline
                id="remoteStreama"
                style={{
                  objectFit: 'contain',
                  minWidth: '50%',
                  maxHeight: '200px',
                  justifyContent: 'center',
                  background: '#000',
                  marginBottom: '5vh',
                }}
              ></video> 
  </div>)
}
export default function Home() {
  const fov = 60;
  const aspect = 1920 / 1080;
  const near = 2.0;
  const far = 1000.0;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(25, 1220, 25);

  return (
    <div className={styles.container}>
      <Head>
        <title>Life Verse</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Suspense fallback={null}>
        <main className={styles.main}>
          <Canvas style={{height: '100%', width: "100%"}} camera={camera}>
            <gridHelper />
            <axesHelper />
            <OrbitControls />
            <ClinicModel />
            <Ground />
            <perspectiveCamera {...camera} />
            <Doctor />
            <Character camera={camera} />

            <ambientLight intensity={1} />
            <Sky distance={450000} sunPosition={[5, 1, 8]} inclination={0} azimuth={0.25} />
          </Canvas>
        </main>
        <Video />
      </Suspense>
      <Loader dataInterpolation={(p) => `Loading ${p.toFixed(2)}%`} initialState={(active) => active} />
    </div>
  );
}
