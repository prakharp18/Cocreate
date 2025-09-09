import { ChakraProvider, createSystem, defaultConfig } from "@chakra-ui/react";
import LandingPage from "./components/Landingpage";


const system = createSystem(defaultConfig);

export default function App() {
  return (
    <ChakraProvider value={system}>
      <LandingPage />
    </ChakraProvider>
  );
}
