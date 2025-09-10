import { useEffect, useState } from "react";
import { useUserStore } from "../store/userStore";
import { useNavigate } from "react-router-dom";
import { Box, Button, Text, Image } from "@chakra-ui/react";
import { Lock } from "lucide-react";
import DecryptedText from "./DecryptedText";

const UUIDScreen = () => {
  const { name, avatar } = useUserStore();
  const [roomId, setRoomId] = useState("");
  const [roomUrl, setRoomUrl] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  
  const generateRoomId = () => {
    return `room-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  };

  useEffect(() => {
    const id = generateRoomId();
    setRoomId(id);

    const url = `${window.location.origin}/room/${id}`;
    setRoomUrl(url);

    const date = new Date();
    setCreatedAt(date.toLocaleString());
  }, []);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(roomUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStart = () => {
    navigate(`/room/${roomId}`);
  };

  return (
    <Box
      minH="100vh"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      p={6}
      bg="#F7F6EF"
      fontFamily="Satoshi, sans-serif"
    >
      <Box mb={6}>
        <Lock size={48} color="#16a34a" />
      </Box>

      <Text fontSize="3xl" fontWeight="bold" mb={6}>
        Your Session is Ready 🚀
      </Text>

      <Box display="flex" flexDirection="column" alignItems="center" mb={8}>
        {avatar && (
          <Image
            src={avatar}
            alt="avatar"
            boxSize="100px"
            borderRadius="full"
            border="2px solid"
            borderColor="green.600"
            mb={4}
          />
        )}
        <Text fontSize="xl" fontWeight="600">
          {name || "Guest User"}
        </Text>
      </Box>

      <Box
        bg="white"
        border="1px solid"
        borderColor="gray.300"
        px={4}
        py={3}
        rounded="md"
        mb={2}
        fontSize="lg"
        fontWeight="500"
        position="relative"
        maxW="100%"
        overflowX="auto"
      >
        <DecryptedText
          text={roomUrl}
          speed={30}
          maxIterations={15}
          animateOn="view"
          className="text-green-700 font-mono"
          encryptedClassName="text-gray-400 font-mono"
        />
      </Box>

      {createdAt && (
        <Text fontSize="sm" color="gray.500" mb={4}>
          Created at: {createdAt}
        </Text>
      )}

      <Button
        colorScheme="green"
        variant="outline"
        mb={8}
        onClick={handleCopy}
      >
        {copied ? "Copied!" : "Copy Room Link"}
      </Button>

      <Button
        colorScheme="green"
        size="lg"
        onClick={handleStart}
      >
        Start Session
      </Button>
    </Box>
  );
};

export default UUIDScreen;
