import { motion } from "framer-motion";

export const LoadingPulse = () => {
  return (
    <div className="space-y-4w-3/4 p-1">
      <motion.div
        initial={{ opacity: 0.5 }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        className="flex flex-col gap-4 justify-start items-start"   
      >
        <div className="h-4 w-3/4 rounded-full bg-gray-700/50" />
        <div className="h-4 w-1/2 rounded-full bg-gray-700/50" />
        <div className="h-4 w-5/6 rounded-full bg-gray-700/50" />
        <div className="h-4 w-2/3 rounded-full bg-gray-700/50" />
        <div className="h-4 w-3/4 rounded-full bg-gray-700/50" />
        <div className="space-y-3">
          <div className="h-4 w-full rounded-full bg-gray-700/50" />
          <div className="h-4 w-full rounded-full bg-gray-700/50" />
          <div className="h-4 w-4/5 rounded-full bg-gray-700/50" />
        </div>
      </motion.div>
    </div>
  );
};