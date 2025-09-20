import { ChakraProvider, createSystem, defaultConfig, Box, Text } from "@chakra-ui/react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";
import { useCountUp } from "use-count-up";
import LandingPage from "./components/Landingpage";
import Intropage from "./components/Intropage";
import AvatarSelection from "./components/Avatarselection";
import UUIDScreen from "./components/UUIDScreen";
import SplitEditor from "./components/SplitEditor";
import LimitingScreen from "./components/LimitingScreen";

const system = createSystem(defaultConfig);

export default function App() {
  const [showLanding, setShowLanding] = useState(false);

  const { value } = useCountUp({
    isCounting: true,
    end: 100,
    duration: 5,
    easing: "easeOutCubic",
    onComplete: () => {
      setTimeout(() => setShowLanding(true), 500);
    }
  });

  if (!showLanding) {
    return (
      <ChakraProvider value={system}>
        <Box
          minH="100vh"
          display="flex"
          alignItems="center"
          justifyContent="center"
          bg="black"
          color="green.400"
          fontFamily="Satoshi, sans-serif"
        >
          <Text fontSize={{ base: "4xl", md: "6xl" }} fontWeight="700">
            {Math.floor(Number(value))}%
          </Text>
        </Box>
      </ChakraProvider>
    );
  }

  return (
    <ChakraProvider value={system}>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/intro" element={<Intropage />} />
          <Route path="/avatar" element={<AvatarSelection />} />
          <Route path="/uuid" element={<UUIDScreen />} />
          <Route path="/room/:roomId" element={<SplitEditor />} />
          <Route path="/limit" element={<LimitingScreen />} />
        </Routes>
      </Router>
    </ChakraProvider>
  );
}
