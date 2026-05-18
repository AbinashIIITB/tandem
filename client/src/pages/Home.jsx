import React, { useEffect } from "react";
import { Box, Button, Heading, Text, VStack, HStack } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user]);

  return (
    <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="white">
      <VStack spacing={8} textAlign="center" maxW="lg" p={4}>
        <Heading size="3xl" color="blue.600" fontWeight="extrabold">
          Tandem
        </Heading>
        <Text fontSize="xl" color="gray.600">
          The ultimate real-time collaborative workspace for teams that want to move fast.
        </Text>
        <HStack spacing={4}>
          <Button colorScheme="blue" size="lg" px={10} onClick={() => navigate("/register")}>
            Get Started for Free
          </Button>
          <Button variant="ghost" colorScheme="blue" size="lg" onClick={() => navigate("/login")}>
            Sign In
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
}

export default Home;
