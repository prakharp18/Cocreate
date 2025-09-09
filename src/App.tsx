import { ChakraProvider, createSystem, defaultConfig, Box, Text } from "@chakra-ui/react";
import LandingPage from "./components/Landingpage";
import { useState, useEffect } from "react";
import { CountUp } from "use-count-up";

const system = createSystem(defaultConfig);

export default function App() {
  const [showLanding, setShowLanding] = useState(false);

  useEffect(() => {
    // show landing after animation ends (5s here for smoother feel)
    const timer = setTimeout(() => setShowLanding(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ChakraProvider value={system}>
      {showLanding ? (
        <LandingPage />
      ) : (
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
      )}
    </ChakraProvider>
  );
}
