import React, { useState } from "react";
import { Box, Button, FormControl, FormLabel, Input, Heading, Text, VStack, Link, useToast } from "@chakra-ui/react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(username, email, password);
      toast({ title: "Account created", status: "success", duration: 3000 });
      navigate("/dashboard");
    } catch (err) {
      toast({ title: "Registration failed", description: err.response?.data?.message || "Something went wrong", status: "error", duration: 3000 });
    }
  };

  return (
    <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="gray.50">
      <VStack spacing={8} w="full" maxW="md" p={8} bg="white" boxShadow="lg" borderRadius="xl">
        <Heading color="blue.500">Create Account</Heading>
        <form style={{ width: "100%" }} onSubmit={handleSubmit}>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Username</FormLabel>
              <Input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Email Address</FormLabel>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Password</FormLabel>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </FormControl>
            <Button type="submit" colorScheme="blue" w="full" size="lg">
              Sign Up
            </Button>
          </VStack>
        </form>
        <Text>
          Already have an account?{" "}
          <Link as={RouterLink} to="/login" color="blue.500">
            Login here
          </Link>
        </Text>
      </VStack>
    </Box>
  );
};

export default Register;
