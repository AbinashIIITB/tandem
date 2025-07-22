// client/src/pages/Home.jsx
import { Box, Button, Heading, Text, VStack } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  return (
    <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="gray.50">
      <VStack spacing={6}>
        <Heading size="2xl" color="teal.500">Tandem Docs</Heading>
        <Text fontSize="xl" color="gray.600">Collaborate on documents in real-time</Text>
        <Button colorScheme="teal" size="lg" onClick={() => navigate('/editor')}>
          Start Editing
        </Button>
      </VStack>
    </Box>
  );
}

export default Home;
