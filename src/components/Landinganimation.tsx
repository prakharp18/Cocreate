import { useEffect, useState } from "react";
import CountUp from "use-count-up";

const StartupAnimation = ({ onFinish }: { onFinish: () => void }) => {
  const [done, setDone] = useState(false);

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
      <CountUp
        from={0}
        to={100}
        duration={2000}
        className="text-6xl font-bold text-white"
        onComplete={() => setDone(true)}
      />
    </div>
  );
};

export default StartupAnimation;
