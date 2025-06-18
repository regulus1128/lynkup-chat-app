import express from 'express'
import { protectRoute } from '../middlewares/auth.middleware.js';
import { addGroupMembers, createGroup, deleteGroup, editGroupDetails, getGroupById, getGroupMessages, getUserGroups, leaveGroup, sendGroupMessage } from '../controllers/group.controller.js';

const groupRouter = express.Router();

groupRouter.post("/create", protectRoute, createGroup);
groupRouter.post("/:groupId/add", protectRoute, addGroupMembers);
// groupRouter.post("/:groupId/remove-member", protectRoute, removeGroupMember);
groupRouter.post("/:groupId/leave", protectRoute, leaveGroup);
groupRouter.get("/groups", protectRoute, getUserGroups);
groupRouter.get("/group/:groupId", protectRoute, getGroupById);
groupRouter.get("/messages/:groupId", protectRoute, getGroupMessages);
groupRouter.post("/send-group/:groupId", protectRoute, sendGroupMessage);
groupRouter.put("/edit-group/:groupId", protectRoute, editGroupDetails);
groupRouter.delete("/group/:groupId", protectRoute, deleteGroup);

export default groupRouter;