import { useEffect, useState } from "react";
import { useUserStore } from "../store/userStore";
import { v4 as uuidv4 } from "uuid";
import { useNavigate } from "react-router-dom";
import { Box, Button, Text, Image } from "@chakra-ui/react";
import { Lock } from "lucide-react";
import DecryptedText from "./DecryptedText";

const UUIDScreen = () => {
  const { name, avatar } = useUserStore();
  const [uuid, setUuid] = useState("");
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setUuid(uuidv4()); 
  }, []);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(uuid);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); 
  };

  const handleStart = () => {
    navigate("/editor"); 
  };

  return (
    <Box
      minH="100vh"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      p={6}
      bg="gray.50"
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
        mb={4}
        fontSize="lg"
        fontWeight="500"
        position="relative"
      >
        <DecryptedText
          text={uuid}
          speed={30}
          maxIterations={15}
          animateOn="view"
          className="text-green-700 font-mono"
          encryptedClassName="text-gray-400 font-mono"
        />
      </Box>

      <Button
        colorScheme="green"
        variant="outline"
        mb={8}
        onClick={handleCopy}
        position="relative"
      >
        {copied ? "Copied!" : "Copy UUID"}
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
