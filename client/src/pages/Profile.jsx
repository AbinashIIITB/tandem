import React, { useState } from "react";
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  Avatar,
  useToast,
  Flex,
  IconButton,
  Text,
  Divider,
} from "@chakra-ui/react";
import { ArrowBackIcon, EditIcon, CheckIcon, CloseIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../api";

const Profile = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || "",
    email: user?.email || "",
    avatar: user?.avatar || "",
  });

  const handleUpdate = async () => {
    try {
      const res = await api.put("/api/auth/me", formData);
      setUser(res.data);
      setIsEditing(false);
      toast({ title: "Profile updated", status: "success" });
    } catch (err) {
      toast({ title: "Failed to update profile", status: "error" });
    }
  };

  return (
    <Box minH="100vh" bg="gray.50">
      <Flex bg="white" p={4} borderBottom="1px solid #e2e8f0" align="center">
        <IconButton
          icon={<ArrowBackIcon />}
          onClick={() => navigate("/dashboard")}
          aria-label="Back to dashboard"
          variant="ghost"
          mr={4}
        />
        <Heading size="md">User Profile</Heading>
      </Flex>

      <Container maxW="container.md" py={12}>
        <VStack spacing={8} bg="white" p={8} borderRadius="2xl" boxShadow="xl" align="stretch">
          <Flex direction="column" align="center" mb={4}>
            <Avatar size="2xl" name={user?.username} src={formData.avatar} mb={4} />
            <Heading size="lg">{user?.username}</Heading>
            <Text color="gray.500">{user?.email}</Text>
          </Flex>

          <Divider />

          <VStack spacing={6} align="stretch">
            <Flex justify="space-between" align="center">
              <Heading size="sm">Account Details</Heading>
              {!isEditing ? (
                <Button leftIcon={<EditIcon />} size="sm" onClick={() => setIsEditing(true)}>
                  Edit Profile
                </Button>
              ) : (
                <HStack>
                  <IconButton icon={<CloseIcon />} size="sm" onClick={() => setIsEditing(false)} colorScheme="red" variant="ghost" />
                  <IconButton icon={<CheckIcon />} size="sm" onClick={handleUpdate} colorScheme="green" />
                </HStack>
              )}
            </Flex>

            <FormControl isReadOnly={!isEditing}>
              <FormLabel fontSize="sm" color="gray.600">Username</FormLabel>
              <Input
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                variant={isEditing ? "outline" : "filled"}
              />
            </FormControl>

            <FormControl isReadOnly={!isEditing}>
              <FormLabel fontSize="sm" color="gray.600">Email Address</FormLabel>
              <Input
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                variant={isEditing ? "outline" : "filled"}
              />
            </FormControl>

            <FormControl isReadOnly={!isEditing}>
              <FormLabel fontSize="sm" color="gray.600">Avatar URL</FormLabel>
              <Input
                placeholder="https://example.com/avatar.png"
                value={formData.avatar}
                onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                variant={isEditing ? "outline" : "filled"}
              />
            </FormControl>
          </VStack>
        </VStack>
      </Container>
    </Box>
  );
};

export default Profile;
