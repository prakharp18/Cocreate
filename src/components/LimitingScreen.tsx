import React from "react";
import { Box, Button, Text, VStack } from "@chakra-ui/react";
import { Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface LimitingScreenProps {
  roomId?: string;
  onRetry?: () => void;
}

const LimitingScreen: React.FC<LimitingScreenProps> = ({ roomId, onRetry }) => {
  const navigate = useNavigate();

  const handleCreateNew = () => {
    navigate("/uuid"); 
  };

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    }
  };

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="#F7F6EF"
      fontFamily="Satoshi, sans-serif"
      p={6}
    >
      <VStack gap={6} textAlign="center">
        <Users size={60} color="#f56565" />
        <Text fontSize="2xl" fontWeight="bold">
          😅 Oops! This room is full (4/4).
        </Text>
        {roomId && (
          <Text fontSize="sm" color="gray.500">
            Room "{roomId}" has reached maximum capacity
          </Text>
        )}
        <Text fontSize="md" color="gray.600">
          Start a new room or wait for someone to leave.
        </Text>
        <VStack gap={3}>
          <Button colorScheme="green" size="lg" onClick={handleCreateNew}>
            Create New Room
          </Button>
          {onRetry && (
            <Button colorScheme="blue" variant="outline" size="lg" onClick={handleRetry}>
              Try Again
            </Button>
          )}
        </VStack>
      </VStack>
    </Box>
  );
};

export default LimitingScreen;
