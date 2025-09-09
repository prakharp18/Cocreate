import React from "react";
import { Box, Container, Heading, Text, Image, Button } from "@chakra-ui/react";
import { ChevronRight } from "lucide-react";

const LandingPage = () => {
  return (
    <Box
      bg="transparent" 
      minH="100vh"
      display="flex"
      flexDirection="column"
      position="relative"
      fontFamily="Satoshi, sans-serif"
      overflow="hidden"
    >
      {/* Background */}
      <Image
        src="/geminicreated.png"
        alt="background illustration"
        position="absolute"
        inset={0}
        w="100%"
        h="100%"
        objectFit="cover"
        zIndex={0} /* place image behind content but above page background */
      />

      {/* Top branding */}
      <Box textAlign="center" py={6} zIndex={2}>
        <Heading as="h1" fontSize="2xl" fontWeight="700" color="green.800" letterSpacing="tight">
          CoCreate.
        </Heading>
      </Box>

      {/* Main content */}
      <Container
        maxW="5xl"
        zIndex={2}
        px={8}
        pt={20}
        pb={12}
      >
        <Box display="flex" flexDirection="column" gap={6} textAlign="center" alignItems="center">
          <Heading as="h2" fontWeight="700" fontSize={{ base: "4xl", md: "5xl", lg: "6xl" }} color="green.800" lineHeight="shorter" maxW="4xl">
            Collaborate in Real-Time Anywhere.
          </Heading>

          <Text fontSize={{ base: "lg", md: "xl" }} color="gray.700" maxW="3xl" lineHeight="tall" fontWeight="400" mx="auto">
            Code together, sketch ideas, and chat live — all in one shared
            workspace. No installs, no hassle, just a room key.
          </Text>

          {/* Start Button - smaller and positioned below */}
          <Box mt={4}>
            <Button
              bg="transparent"
              border="2px solid"
              borderColor="green.700"
              color="green.700"
              px={4}
              py={3}
              fontSize="md"
              fontWeight="600"
              borderRadius="md"
              _hover={{
                bg: "green.800",
                color: "green.100",
                transform: "translateY(-1px)",
                boxShadow: "md"
              }}
              transition="all 0.2s ease-in-out"
              display="flex"
              alignItems="center"
              gap={2}
              size="md"
            >
              Start
              <ChevronRight size={18} />
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default LandingPage;
