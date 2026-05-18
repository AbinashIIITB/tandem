const express = require("express");
const Project = require("../models/Project");
const auth = require("../middleware/auth");
const { v4: uuidv4 } = require("uuid");
const router = express.Router();

// Get all projects for logged in user
router.get("/", auth, async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [
        { owner: req.user.id },
        { "collaborators.user": req.user.id }
      ]
    }).populate("owner", "username email");
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new project
router.post("/", auth, async (req, res) => {
  try {
    const { title } = req.body;
    const project = new Project({
      title,
      owner: req.user.id,
      shareToken: uuidv4(),
    });
    await project.save();
    const populatedProject = await Project.findById(project._id).populate("owner", "username email");
    res.status(201).json(populatedProject);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single project
router.get("/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("owner", "username email")
      .populate("collaborators.user", "username email");
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update project (title/content)
router.put("/:id", auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    // Check if user has edit permissions
    const isOwner = project.owner.toString() === req.user.id;
    const isEditor = project.collaborators.some(c => c.user.toString() === req.user.id && c.role === "editor");

    if (!isOwner && !isEditor) {
      return res.status(403).json({ message: "Not authorized to edit this project" });
    }

    if (req.body.title) project.title = req.body.title;
    if (req.body.content) project.content = req.body.content;
    
    await project.save();
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Share project with a user by email
router.post("/:id/share", auth, async (req, res) => {
  try {
    const { email, role } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "Only owners can share projects" });
    }

    const User = require("../models/User");
    const userToInvite = await User.findOne({ email });
    if (!userToInvite) return res.status(404).json({ message: "User not found" });

    // Check if already a collaborator
    if (project.collaborators.some(c => c.user.toString() === userToInvite._id.toString())) {
      return res.status(400).json({ message: "User already has access" });
    }

    project.collaborators.push({ user: userToInvite._id, role });
    await project.save();

    res.json({ message: "Collaborator added successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update collaborator role
router.put("/:id/collaborator", auth, async (req, res) => {
  try {
    const { userId, role } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "Only owners can change roles" });
    }

    const collab = project.collaborators.find(c => c.user.toString() === userId);
    if (!collab) return res.status(404).json({ message: "Collaborator not found" });

    collab.role = role;
    await project.save();

    res.json({ message: "Role updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update project visibility
router.put("/:id/visibility", auth, async (req, res) => {
  try {
    const { isPublic } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "Only owners can change visibility" });
    }

    project.isPublic = isPublic;
    await project.save();

    res.json({ message: "Visibility updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete project
router.delete("/:id", auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "Only owners can delete projects" });
    }

    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: "Project deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
