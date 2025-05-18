import express from "express"
import { addTask, changeAssignee, changeDescriptione, changeStatus, changeTitleDescription, delTask, filterTask, getAllMembers, getTask } from "../controllers/tasks.controller.js";


const router = express.Router();


router.post("/add", addTask)
router.get("/filter",filterTask)
router
    .get("/:id", getTask)
    .delete("/:id", delTask)
    .patch("/:id/assignee", changeAssignee)
    .patch("/:id/change", changeTitleDescription)
    .patch("/:id/description", changeDescriptione)
    .patch("/:id/status", changeStatus);




// temporary here generally for members route
router.get("/:id/members/all",getAllMembers)  //server Id

export default router;