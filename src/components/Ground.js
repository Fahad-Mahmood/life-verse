export function Ground() {
    return(
        <mesh rotation-x={Math.PI * -0.5} receiveShadow>
            <planeGeometry args={[1500,1500]} />
            <meshStandardMaterial color='green'/>
        </mesh>
    )
}