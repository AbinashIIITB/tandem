import React, { useEffect, useState } from "react";
import { Box, Button, Heading, Text, SimpleGrid, Flex, IconButton, useToast, Container, Badge, VStack, Avatar, Menu, MenuButton, MenuList, MenuItem, MenuDivider } from "@chakra-ui/react";
import { AddIcon, DeleteIcon, ExternalLinkIcon, SettingsIcon, EditIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../contexts/AuthContext";
import ProjectSettingsModal from "../components/ProjectSettingsModal";

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [recentProjects, setRecentProjects] = useState([]);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [selectedProject, setSelectedProject] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    fetchProjects();
    const recent = JSON.parse(localStorage.getItem("recentProjects") || "[]");
    setRecentProjects(recent);
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await api.get("/api/projects");
      setProjects(res.data);
    } catch (err) {
      toast({ title: "Error fetching projects", status: "error" });
    }
  };

  const createProject = async () => {
    try {
      const res = await api.post("/api/projects", { title: "New Document" });
      setProjects([...projects, res.data]);
      navigate(`/editor/${res.data._id}`);
    } catch (err) {
      toast({ title: "Error creating project", status: "error" });
    }
  };

  const deleteProject = async (id) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    try {
      await api.delete(`/api/projects/${id}`);
      setProjects(projects.filter((p) => p._id !== id));
      toast({ title: "Project deleted", status: "success" });
    } catch (err) {
      toast({ title: "Error deleting project", status: "error" });
    }
  };

  const openSettings = (project) => {
    setSelectedProject(project);
    setIsSettingsOpen(true);
  };

  return (
    <Box minH="100vh" bg="gray.50">
      <Flex bg="white" p={4} borderBottom="1px solid #e2e8f0" justify="space-between" align="center">
        <Heading size="md" color="blue.500">Tandem Dashboard</Heading>
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
            <MenuItem borderRadius="lg" icon={<EditIcon />} onClick={() => navigate("/profile")}>
              Profile Settings
            </MenuItem>
            <MenuItem borderRadius="lg" color="red.500" onClick={logout}>
              Logout
            </MenuItem>
          </MenuList>
        </Menu>
      </Flex>

      <Container maxW="container.xl" py={8}>
        {recentProjects.length > 0 && (
          <Box mb={10}>
            <Heading size="md" mb={4} color="gray.700">Recent Projects</Heading>
            <SimpleGrid columns={{ base: 1, md: 3, lg: 5 }} spacing={4}>
              {recentProjects.map((p) => (
                <Box
                  key={p.id}
                  p={4}
                  bg="white"
                  borderRadius="lg"
                  boxShadow="sm"
                  cursor="pointer"
                  _hover={{ transform: "translateY(-2px)", boxShadow: "md" }}
                  transition="all 0.2s"
                  onClick={() => navigate(`/editor/${p.id}`)}
                >
                  <Text fontWeight="bold" fontSize="sm" noOfLines={1}>{p.title}</Text>
                  <Text fontSize="xs" color="gray.500">
                    {new Date(p.updatedAt).toLocaleDateString()}
                  </Text>
                </Box>
              ))}
            </SimpleGrid>
          </Box>
        )}

        <Flex justify="space-between" align="center" mb={8}>
          <VStack align="start" spacing={1}>
            <Heading size="lg">My Projects</Heading>
            <Text color="gray.600">You have {projects.length} active documents</Text>
          </VStack>
          <Button leftIcon={<AddIcon />} colorScheme="blue" onClick={createProject}>
            New Project
          </Button>
        </Flex>

        {projects.length === 0 ? (
          <Box textAlign="center" py={20} bg="white" borderRadius="xl" border="2px dashed #e2e8f0">
            <Text color="gray.500">No projects found. Create your first document!</Text>
          </Box>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {projects.map((project) => (
              <Box key={project._id} p={6} bg="white" borderRadius="xl" boxShadow="sm" _hover={{ boxShadow: "md" }} transition="all 0.2s">
                <Flex justify="space-between" align="start" mb={4}>
                  <VStack align="start" spacing={1}>
                    <Heading size="sm">{project.title}</Heading>
                    <Text fontSize="xs" color="gray.500">
                      Modified: {new Date(project.updatedAt).toLocaleDateString()}
                    </Text>
                  </VStack>
                  <Badge colorScheme={project.owner._id.toString() === user?.id?.toString() ? "blue" : "green"}>
                    {project.owner._id.toString() === user?.id?.toString() ? "Owner" : "Collaborator"}
                  </Badge>
                </Flex>
                <Flex gap={2}>
                  <Button flex="1" size="sm" leftIcon={<ExternalLinkIcon />} colorScheme="blue" variant="outline" onClick={() => navigate(`/editor/${project._id}`)}>
                    Open
                  </Button>
                  {project.owner._id.toString() === user?.id?.toString() && (
                    <>
                      <IconButton
                        size="sm"
                        aria-label="Project Settings"
                        icon={<SettingsIcon />}
                        variant="ghost"
                        onClick={() => openSettings(project)}
                      />
                      <IconButton
                        size="sm"
                        aria-label="Delete project"
                        icon={<DeleteIcon />}
                        colorScheme="red"
                        variant="ghost"
                        onClick={() => deleteProject(project._id)}
                      />
                    </>
                  )}
                </Flex>
              </Box>
            ))}
          </SimpleGrid>
        )}
      </Container>
      
      {selectedProject && (
        <ProjectSettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          project={selectedProject}
          onUpdate={fetchProjects}
        />
      )}
    </Box>
  );
};

export default Dashboard;
