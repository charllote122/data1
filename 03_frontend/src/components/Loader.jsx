import React from 'react';
import { motion } from 'framer-motion';

const Loader = ({ size = 'md', fullPage = false }) => {
    const sizes = {
        sm: 'w-4 h-4 border-2',
        md: 'w-8 h-8 border-3',
        lg: 'w-12 h-12 border-4',
        xl: 'w-16 h-16 border-4',
    };

    const spinnerVariants = {
        animate: {
            rotate: 360,
            transition: {
                duration: 1,
                repeat: Infinity,
                ease: "linear"
            }
        }
    };

    const LoaderContent = () => (
        <div className="flex flex-col items-center justify-center">
            <motion.div
                variants={spinnerVariants}
                animate="animate"
                className={`${sizes[size]} border-t-primary-600 border-primary-200 rounded-full`}
            />
            <p className="mt-3 text-sm text-gray-500">Loading...</p>
        </div>
    );

    if (fullPage) {
        return (
            <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
                <LoaderContent />
            </div>
        );
    }

    return <LoaderContent />;
};

export default Loader;