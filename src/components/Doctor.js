import { useLoader } from "@react-three/fiber";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";

export const Doctor = () => {
      const defaultPosition = {x: 120.63724154811673, y: 0, z: 
            -126.77728564460158}
      const character = useLoader(FBXLoader, "./character/doctor.fbx");
      character.scale.setScalar(0.1);
      character.position.x  = defaultPosition.x;
      character.position.z = defaultPosition.z;
      character.rotation.y = 180;
      return(
       <primitive object={character}/>)
} 