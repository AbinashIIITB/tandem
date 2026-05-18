import React, { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Box } from "@chakra-ui/react";
import socket from "../socket";

const TiptapEditor = ({ docId, readOnly }) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: "<p>Loading document...</p>",
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      if (!readOnly) {
        const json = editor.getJSON();
        socket.emit("sendChanges", json);
      }
    },
  });

  useEffect(() => {
    if (editor) {
      editor.setEditable(!readOnly);
    }
  }, [readOnly, editor]);

  useEffect(() => {
    if (!editor) return;

    socket.on("loadDocument", (content) => {
      if (content && Object.keys(content).length > 0) {
        editor.commands.setContent(content);
      } else {
        editor.commands.setContent("<p>Start typing here...</p>");
      }
    });

    socket.on("receiveChanges", (newContent) => {
      // Prevent infinite loop by checking if content is different
      if (JSON.stringify(newContent) !== JSON.stringify(editor.getJSON())) {
        editor.commands.setContent(newContent, false); // false means don't emit update
      }
    });

    return () => {
      socket.off("loadDocument");
      socket.off("receiveChanges");
    };
  }, [editor]);

  if (!editor) {
    return <div>Loading editor...</div>;
  }

  return (
    <Box bg="white" p={4} borderRadius="md" boxShadow="md" minH="500px" overflowY="auto" border="1px solid #e2e8f0">
      <EditorContent editor={editor} />
    </Box>
  );
};

export default TiptapEditor;
