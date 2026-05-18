import React, { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  VStack,
  HStack,
  Text,
  useToast,
  Divider,
  Switch,
  IconButton,
} from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";
import api from "../api";

const ProjectSettingsModal = ({ isOpen, onClose, project, onUpdate }) => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("viewer");
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleAddCollaborator = async () => {
    setLoading(true);
    try {
      await api.post(`/api/projects/${project._id}/share`, { email, role });
      toast({ title: "Collaborator added", status: "success" });
      setEmail("");
      onUpdate();
    } catch (err) {
      toast({ title: "Error adding collaborator", status: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      await api.put(`/api/projects/${project._id}/collaborator`, { userId, role: newRole });
      toast({ title: "Role updated", status: "success" });
      onUpdate();
    } catch (err) {
      toast({ title: "Error updating role", status: "error" });
    }
  };

  const handleToggleVisibility = async (e) => {
    try {
      const isPublic = e.target.checked;
      await api.put(`/api/projects/${project._id}/visibility`, { isPublic });
      toast({ title: `Project is now ${isPublic ? "public" : "private"}`, status: "success" });
      onUpdate();
    } catch (err) {
      toast({ title: "Error updating visibility", status: "error" });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent borderRadius="xl">
        <ModalHeader>Project Settings</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={6} align="stretch">
            {/* Visibility Setting */}
            <FormControl display="flex" alignItems="center" justify="space-between">
              <VStack align="start" spacing={0}>
                <FormLabel mb="0">Public Access</FormLabel>
                <Text fontSize="xs" color="gray.500">Anyone with the link can view</Text>
              </VStack>
              <Switch isChecked={project?.isPublic} onChange={handleToggleVisibility} />
            </FormControl>

            <Divider />

            {/* Add Collaborator */}
            <VStack align="stretch" spacing={3}>
              <FormControl>
                <FormLabel fontSize="sm">Add Collaborator</FormLabel>
                <HStack>
                  <Input
                    placeholder="user@example.com"
                    size="sm"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Select size="sm" w="150px" value={role} onChange={(e) => setRole(e.target.value)}>
                    <option value="editor">Editor</option>
                    <option value="viewer">Viewer</option>
                  </Select>
                </HStack>
              </FormControl>
              <Button size="sm" colorScheme="blue" onClick={handleAddCollaborator} isLoading={loading}>
                Invite
              </Button>
            </VStack>

            <Divider />

            {/* Manage Collaborators */}
            <VStack align="stretch" spacing={3}>
              <Text fontWeight="bold" fontSize="sm">Manage Access</Text>
              {project?.collaborators?.map((c) => (
                <HStack key={c.user._id} justify="space-between">
                  <VStack align="start" spacing={0}>
                    <Text fontSize="sm" fontWeight="medium">{c.user.username}</Text>
                    <Text fontSize="xs" color="gray.500">{c.user.email}</Text>
                  </VStack>
                  <Select
                    size="xs"
                    w="100px"
                    value={c.role}
                    onChange={(e) => handleUpdateRole(c.user._id, e.target.value)}
                  >
                    <option value="editor">Editor</option>
                    <option value="viewer">Viewer</option>
                  </Select>
                </HStack>
              ))}
            </VStack>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={onClose}>Done</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ProjectSettingsModal;
