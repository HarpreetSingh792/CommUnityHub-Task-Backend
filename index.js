import express from "express"
import cors from "cors"
import morgan from "morgan"
import { config } from "dotenv"
import taskColumn from "./routes/taskColumn.route.js"
import tasks from "./routes/tasks.route.js"

export const app = express();

config({ path: ".env" });

const PORT = process.env.PORT || 8000;

app.use(morgan("dev"));

app.use(express.json({ limit: '4mb' }));

app.use(cors({}))



app.use("/taskColumn",taskColumn)
app.use("/tasks",tasks)

app.listen(PORT, (error) => {
  if (error) {
    console.log("ERROR WHILE RUNNING TASK SERVER ------->", error);
    process.exit(1);
  }

  console.log(`Server is running on port ${PORT}`);
});



// app.all("*", (req, res) => {
//     return res.status(404).json({
//         success: false,
//         message: "Not found"
//     })
// })