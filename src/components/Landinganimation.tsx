import { useEffect, useState } from "react";
import { useCountUp } from "use-count-up";

const StartupAnimation = ({ onFinish }: { onFinish: () => void }) => {
  const [done, setDone] = useState(false);
  
  const { value } = useCountUp({
    isCounting: true,
    end: 100,
    duration: 2,
    onComplete: () => setDone(true),
  });

  useEffect(() => {
    if (done) {
      const timer = setTimeout(() => {
        onFinish();
      }, 500); // small delay before switching to landing
      return () => clearTimeout(timer);
    }
  }, [done, onFinish]);

  return (
    <div className="flex items-center justify-center h-screen w-screen bg-black">
      <div className="text-6xl font-bold text-white">
        {value}
      </div>
    </div>
  );
};

export default StartupAnimation;
