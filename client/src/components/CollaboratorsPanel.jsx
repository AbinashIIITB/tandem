import React, { useEffect, useState } from "react";
import socket from "../socket";

const CollaboratorsPanel = ({ docId, username }) => {
  const [collaborators, setCollaborators] = useState([]);

  useEffect(() => {
    socket.emit("joinRoom", { docId, username });

    socket.on("collaboratorsUpdate", (users) => {
      setCollaborators(users);
    });

    return () => {
      socket.emit("leaveRoom", { docId });
      socket.off("collaboratorsUpdate");
    };
  }, [docId, username]);

  return (
    <aside className="p-4 border-l bg-white shadow-md w-64 h-full overflow-y-auto">
      <h3 className="font-semibold text-lg mb-2">Live Collaborators</h3>
      <ul className="space-y-1">
        {collaborators.map((user) => (
          <li key={user.id} className="text-sm text-gray-800">
            🟢 {user.username}
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default CollaboratorsPanel;
