import React, { useState } from "react";
import { Box, Button, FormControl, FormLabel, Input, Heading, Text, VStack, Link, useToast } from "@chakra-ui/react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      toast({ title: "Login successful", status: "success", duration: 3000 });
      navigate("/dashboard");
    } catch (err) {
      toast({ title: "Login failed", description: err.response?.data?.message || "Something went wrong", status: "error", duration: 3000 });
    }
  };

  return (
    <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="gray.50">
      <VStack spacing={8} w="full" maxW="md" p={8} bg="white" boxShadow="lg" borderRadius="xl">
        <Heading color="blue.500">Welcome Back</Heading>
        <form style={{ width: "100%" }} onSubmit={handleSubmit}>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Email Address</FormLabel>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Password</FormLabel>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </FormControl>
            <Button type="submit" colorScheme="blue" w="full" size="lg">
              Sign In
            </Button>
          </VStack>
        </form>
        <Text>
          Don't have an account?{" "}
          <Link as={RouterLink} to="/register" color="blue.500">
            Register here
          </Link>
        </Text>
      </VStack>
    </Box>
  );
};

export default Login;
