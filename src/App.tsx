import { ChakraProvider, createSystem, defaultConfig, Box, Text } from "@chakra-ui/react";
import LandingPage from "./components/Landingpage";
import Intropage from "./components/Intropage";
import AvatarSelection from "./components/Avatarselection";
// Uncomment this when I'll create the UUIDScreen component
// import UUIDScreen from "./components/UUIDScreen";
import { useState, useEffect } from "react";
import { CountUp } from "use-count-up";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

const system = createSystem(defaultConfig);

export default function App() {
  const [showLanding, setShowLanding] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowLanding(true), 5000);
    return () => clearTimeout(timer);
  }, []);

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
            <CountUp
              isCounting
              end={100}
              duration={5}
              easing="easeOutCubic"
              suffix="%"
            />
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
          <Route path="/uuid" element={
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <h1>UUID Screen - Coming Soon</h1>
              <p>This screen will be implemented next.</p>
            </div>
          } />
        </Routes>
      </Router>
    </ChakraProvider>
  );
}
