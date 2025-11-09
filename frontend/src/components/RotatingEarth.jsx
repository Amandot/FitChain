import React from 'react';
import { motion } from 'framer-motion';
import './RotatingEarth.css';

const RotatingEarth = ({ isTracking }) => {
    return (
        <div className="earth-container">
            <div className="earth-scene">
                <motion.div
                    className="earth"
                    animate={{
                        rotateY: isTracking ? 360 : 180
                    }}
                    transition={{
                        duration: isTracking ? 20 : 30,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                >
                    {/* Earth surface with realistic continents */}
                    <div className="earth-surface">
                        <div className="continent continent-1"></div>
                        <div className="continent continent-2"></div>
                        <div className="continent continent-3"></div>
                        <div className="continent continent-4"></div>
                        <div className="continent continent-5"></div>
                        <div className="continent continent-6"></div>

                        {/* Ocean depth effects */}
                        <div className="ocean-effects"></div>

                        {/* Ice caps */}
                        <div className="ice-cap north-pole"></div>
                        <div className="ice-cap south-pole"></div>

                        {/* Day/night terminator */}
                        <div className="day-night-terminator"></div>
                    </div>

                    {/* Cloud layer */}
                    <div className="cloud-layer"></div>

                    {/* Atmosphere glow */}
                    <div className="atmosphere"></div>

                    {/* 3D lighting */}
                    <div className="earth-lighting"></div>

                    {/* Tracking points */}
                    {isTracking && (
                        <>
                            <motion.div
                                className="tracking-point point-1"
                                animate={{
                                    scale: [1, 1.5, 1],
                                    opacity: [0.8, 1, 0.8]
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    delay: 0
                                }}
                            />
                            <motion.div
                                className="tracking-point point-2"
                                animate={{
                                    scale: [1, 1.5, 1],
                                    opacity: [0.8, 1, 0.8]
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    delay: 0.7
                                }}
                            />
                            <motion.div
                                className="tracking-point point-3"
                                animate={{
                                    scale: [1, 1.5, 1],
                                    opacity: [0.8, 1, 0.8]
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    delay: 1.4
                                }}
                            />
                        </>
                    )}
                </motion.div>

                {/* Orbital rings */}
                <div className="orbital-ring ring-1"></div>
                <div className="orbital-ring ring-2"></div>

                {/* Stars background */}
                <div className="stars">
                    {[...Array(50)].map((_, i) => (
                        <div
                            key={i}
                            className="star"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 3}s`
                            }}
                        />
                    ))}
                </div>
            </div>


        </div>
    );
};

export default RotatingEarth;