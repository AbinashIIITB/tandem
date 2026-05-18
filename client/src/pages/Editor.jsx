import React, { useEffect, useState } from "react";
import { Box, Flex, IconButton, Heading, Avatar, Text, VStack, Button, Badge, useToast, Menu, MenuButton, MenuList, MenuItem, MenuDivider } from "@chakra-ui/react";
import { ArrowBackIcon, LinkIcon, EditIcon } from "@chakra-ui/icons";
import { useNavigate, useParams } from "react-router-dom";
import socket from "../socket";
import TiptapEditor from "../components/TiptapEditor";
import ProjectSettingsModal from "../components/ProjectSettingsModal";
import { useAuth } from "../contexts/AuthContext";
import api from "../api";

const Editor = () => {
  const navigate = useNavigate();
  const { docId } = useParams();
  const { user } = useAuth();
  const [collaborators, setCollaborators] = useState([]);
  const [project, setProject] = useState(null);
  const [userRole, setUserRole] = useState("viewer");
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetchProject();
  }, [docId]);

  const fetchProject = async () => {
    try {
      const res = await api.get(`/api/projects/${docId}`);
      setProject(res.data);
      
      const recent = JSON.parse(localStorage.getItem("recentProjects") || "[]");
      const updatedRecent = [
        { id: res.data._id, title: res.data.title, updatedAt: res.data.updatedAt },
        ...recent.filter(p => p.id !== res.data._id)
      ].slice(0, 5);
      localStorage.setItem("recentProjects", JSON.stringify(updatedRecent));

      if (user && res.data.owner._id.toString() === user.id.toString()) {
        setUserRole("owner");
      } else {
        const collab = res.data.collaborators.find(c => c.user.toString() === user?.id?.toString());
        setUserRole(collab?.role || "viewer");
      }
    } catch (err) {
      toast({ title: "Error loading project", status: "error" });
    }
  };

  useEffect(() => {
    if (!docId) return;
    const token = localStorage.getItem("token");
    socket.emit("joinRoom", { docId, token });
    socket.on("collaboratorsUpdate", (users) => setCollaborators(users));
    socket.on("error", (msg) => toast({ title: msg, status: "error" }));

    return () => {
      socket.emit("leaveRoom", { docId });
      socket.off("collaboratorsUpdate");
      socket.off("error");
    };
  }, [docId, user]);

  const handleShareClick = () => {
    if (userRole === "owner") {
      setIsSettingsModalOpen(true);
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({ title: "Link copied to clipboard", status: "success" });
    }
  };

  return (
    <Flex h="100vh" overflow="hidden" bg="gray.50">
      <Box w="250px" bg="white" p={4} borderRight="1px solid #e2e8f0" overflowY="auto">
        <Heading as="h3" size="sm" mb={6} color="gray.500" textTransform="uppercase">Collaborators</Heading>
        <VStack align="start" spacing={4}>
          {collaborators.map((u) => (
            <Flex align="center" gap={3} key={u.id}>
              <Avatar name={u.username} size="sm" />
              <VStack align="start" spacing={0}>
                <Text fontSize="sm" fontWeight="bold">{u.username}</Text>
                <Badge fontSize="xs" colorScheme={u.role === "owner" ? "blue" : "green"}>{u.role}</Badge>
              </VStack>
            </Flex>
          ))}
        </VStack>
      </Box>

      <Flex direction="column" flex="1" p={6}>
        <Flex justify="space-between" align="center" mb={6}>
          <Flex align="center" gap={4}>
            <IconButton icon={<ArrowBackIcon />} onClick={() => navigate("/dashboard")} aria-label="Go back" variant="ghost" />
            <VStack align="start" spacing={0}>
              <Heading as="h2" size="md">{project?.title || "Loading..."}</Heading>
              <Text fontSize="xs" color="gray.500">Role: {userRole.toUpperCase()}</Text>
            </VStack>
          </Flex>
          <Flex gap={3} align="center">
            <Button leftIcon={<LinkIcon />} size="sm" variant="outline" onClick={handleShareClick}>Share</Button>
            {userRole !== "viewer" && <Button colorScheme="blue" size="sm">Save</Button>}
            <Menu>
              <MenuButton as={Button} variant="ghost" p={0} borderRadius="full">
                <Avatar size="sm" name={user?.username} src={user?.avatar} />
              </MenuButton>
              <MenuList borderRadius="xl" boxShadow="xl" border="none" p={2}>
                <Box px={4} py={2}>
                  <Text fontWeight="bold">{user?.username}</Text>
                  <Text fontSize="xs" color="gray.500">{user?.email}</Text>
                </Box>
                <MenuDivider />
                <MenuItem borderRadius="lg" icon={<EditIcon />} onClick={() => navigate("/profile")}>Profile Settings</MenuItem>
                <MenuItem borderRadius="lg" color="red.500" onClick={() => navigate("/dashboard")}>Exit to Dashboard</MenuItem>
              </MenuList>
            </Menu>
          </Flex>
        </Flex>

        <Box flex="1" bg="white" borderRadius="xl" boxShadow="sm" overflow="hidden">
          <TiptapEditor docId={docId} readOnly={userRole === "viewer"} />
        </Box>
      </Flex>

      <ProjectSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        project={project}
        onUpdate={fetchProject}
      />
    </Flex>
  );
};

export default Editor;
