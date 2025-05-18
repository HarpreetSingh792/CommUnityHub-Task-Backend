import express from "express"
import { addColumn, calculateProgress, changeName, delColumn, filterTask, getAllColumns, getServerProgress, getTaskColumnData } from "../controllers/taskColumn.controller.js";


const router = express.Router();


router.post("/add",addColumn)
router.get("/filter",filterTask)
router.get("/channel/progress",calculateProgress);
router.get("/overall/progress",getServerProgress);



router.get("/:id/columns/all",getAllColumns)

router.route("/:id").get(getTaskColumnData).delete(delColumn).patch(changeName)





export default router;