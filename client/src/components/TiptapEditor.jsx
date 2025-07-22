// src/components/TiptapEditor.jsx

import React, { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Box } from "@chakra-ui/react";

const TiptapEditor = () => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: "<p>Hello from TipTap! You can start typing here...</p>",
  });

  useEffect(() => {
    console.log("✅ Tiptap Editor mounted");
  }, []);

  if (!editor) {
    return <div>Loading editor...</div>;
  }

  return (
    <Box
      bg="white"
      p={4}
      borderRadius="md"
      boxShadow="md"
      minH="300px"
      overflowY="auto"
    >
      <EditorContent editor={editor} />
    </Box>
  );
};

export default TiptapEditor;
