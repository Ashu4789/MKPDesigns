import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, useGLTF } from '@react-three/drei';

function Model({ url }) {
    const { scene } = useGLTF(url);
    return <primitive object={scene} />;
}

const ThreeDViewer = ({ modelUrl, height = '400px' }) => {
    if (!modelUrl) return null;

    return (
        <div className="w-full bg-gray-100 rounded-lg overflow-hidden" style={{ height }}>
            <Canvas shadows dpr={[1, 2]} camera={{ fov: 50 }}>
                <Suspense fallback={null}>
                    <Stage environment="city" intensity={0.6}>
                        <Model url={modelUrl} />
                    </Stage>
                </Suspense>
                <OrbitControls autoRotate />
            </Canvas>
        </div>
    );
};

export default ThreeDViewer;
