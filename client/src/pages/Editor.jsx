import React, { useEffect, useState } from "react";
import {
  Box,
  Flex,
  IconButton,
  Heading,
  Avatar,
  Text,
  VStack,
  Button,
} from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { useNavigate, useParams } from "react-router-dom";
import socket from "../socket";
import TiptapEditor from "../components/TiptapEditor"; // ✅ Fixed

const Editor = () => {
  const navigate = useNavigate();
  const { docId = "demo-doc" } = useParams();
  const [collaborators, setCollaborators] = useState([]);
  const [username, setUsername] = useState("");

  console.log("✅ Editor component mounted");

  useEffect(() => {
    const inputName = prompt("Enter your name:", "Abinash") || "Guest";
    setUsername(inputName);

    socket.emit("joinRoom", { docId, username: inputName });

    socket.on("collaboratorsUpdate", (users) => {
      setCollaborators(users);
    });

    return () => {
      socket.emit("leaveRoom", { docId });
      socket.off("collaboratorsUpdate");
      socket.disconnect();
    };
  }, [docId]);

  useEffect(() => {
    const interval = setInterval(() => {
      console.log("Autosaving content...");
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Flex h="100vh" overflow="hidden" bg="yellow.50">
      {/* Sidebar */}
      <Box
        w="250px"
        bg="gray.50"
        p={4}
        borderRight="1px solid #e2e8f0"
        overflowY="auto"
      >
        <Heading as="h3" size="md" mb={4}>
          Collaborators
        </Heading>
        <VStack align="start" spacing={4}>
          {collaborators.map((user) => (
            <Flex align="center" gap={3} key={user.id}>
              <Avatar name={user.username} src={user.avatar || ""} size="sm" />
              <Text fontSize="sm">{user.username}</Text>
            </Flex>
          ))}
        </VStack>
      </Box>

      {/* Editor Area */}
      <Flex direction="column" flex="1" p={6} bg="white">
        <Flex justify="space-between" align="center" mb={4}>
          <Flex align="center" gap={3}>
            <IconButton
              icon={<ArrowBackIcon />}
              onClick={() => navigate("/")}
              aria-label="Go back"
            />
            <Heading as="h2" size="lg" color="blue.500">
              Document Editor Page Mounted 🚀
            </Heading>
          </Flex>
          <Flex gap={3} align="center">
            <Text fontSize="sm" color="gray.600">
              You: <strong>{username}</strong>
            </Text>
            <Button colorScheme="green">Save</Button>
            <Button colorScheme="blue">Share</Button>
          </Flex>
        </Flex>

        {/* TipTap Rich Text Editor */}
        <TiptapEditor />
      </Flex>
    </Flex>
  );
};

export default Editor;
