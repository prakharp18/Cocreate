import { ChakraProvider, createSystem, defaultConfig, Box, Text } from "@chakra-ui/react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
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
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  
  const { value } = useCountUp({
    isCounting: true,
    end: 100,
    duration: 5,
    easing: "easeOutCubic",
  });

  useEffect(() => {
    const preloadAssets = async () => {
      const imagesToPreload = [
        '/geminicreated.png',
        '/logo.png',
      ];

      const imagePromises = imagesToPreload.map((src) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = resolve;
          img.onerror = reject;
          img.src = src;
        });
      });

      const fontPromises = [
        new FontFace('Satoshi', "url('https://fonts.cdnfonts.com/s/10566/Satoshi-Regular.woff2')").load(),
        new FontFace('Satoshi', "url('https://fonts.cdnfonts.com/s/10566/Satoshi-Bold.woff2')", { weight: '700' }).load(),
      ];

      try {
        await Promise.allSettled(imagePromises);
        
        const loadedFonts = await Promise.allSettled(fontPromises);
        loadedFonts.forEach((result) => {
          if (result.status === 'fulfilled') {
            document.fonts.add(result.value);
          }
        });

        setAssetsLoaded(true);
      } catch {
        console.log('Some assets failed to preload, continuing anyway');
        setAssetsLoaded(true);
      }
    };

    preloadAssets();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (assetsLoaded) {
        setShowLanding(true);
      }
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [assetsLoaded]);

  useEffect(() => {
    if (assetsLoaded && value >= 100) {
      const delayTimer = setTimeout(() => setShowLanding(true), 500);
      return () => clearTimeout(delayTimer);
    }
  }, [assetsLoaded, value]);

  if (!showLanding) {
    return (
      <ChakraProvider value={system}>
        <Box
          minH="100vh"
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          bg="black"
          color="green.400"
          fontFamily="Satoshi, sans-serif"
          gap={4}
        >
          <Text fontSize={{ base: "4xl", md: "6xl" }} fontWeight="700">
            {Math.floor(value)}
            <Text as="span">%</Text>
          </Text>
          <Box
            width="200px"
            height="2px"
            bg="gray.800"
            borderRadius="full"
            overflow="hidden"
          >
            <Box
              width={`${value}%`}
              height="100%"
              bg="green.400"
              transition="width 0.1s ease"
            />
          </Box>
          <Text fontSize="sm" opacity={0.7}>
            {assetsLoaded ? 'Assets loaded' : 'Loading assets...'}
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
          <Route path="/room-full" element={<LimitingScreen />} />
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </Router>
    </ChakraProvider>
  );
}
