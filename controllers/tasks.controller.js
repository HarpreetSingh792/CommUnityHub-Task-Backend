import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();



export const addTask = async (req, res) => {
    try {
        const { title, description, columnId, assigneeId, createdById } = req.body;

        const task = await prisma.task.create({
            data: {
                title,
                description,
                columnId: parseInt(columnId), // If it's a string
                assigneeId,
                createdById,
            },
        });

        return res.status(201).json({
            success: true,
            task,
        });
    } catch (error) {
        console.log("Error while creating task ------------->", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};




export const delTask = async (req, res) => {
    try {
        const { id } = req.params;


        await prisma.task.delete({
            where: { id }
        });

        return res.status(200).json({
            success: true,
            message: "Task Deleted Successfully!",
        });
    } catch (error) {
        console.log("Error while deleting task ------------->", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};



export const getTask = async (req, res) => {
    try {
        const { id } = req.params;

        const task = await prisma.task.findUnique({
            where: { id }
        });

        return res.status(200).json({
            success: true,
            task
        });
    } catch (error) {
        console.log("Error while fetching task ------------->", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};


// change assignee

export const changeAssignee = async (req, res) => {
    try {
        const { id } = req.params;
        const { assigneeId } = req.body;

        if (!assigneeId) return res.status(404).json({
            success: false,
            message: "Assignee ID not found",
        });

        const task = await prisma.task.findUnique({ where: { id } });
        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found",
            });
        }
        await prisma.task.update({
            where: { id },
            data: {
                assigneeId
            }
        });

        return res.status(200).json({
            success: true,
            message: "Assignee Changed Successfully!"
        });
    } catch (error) {
        console.log("Error while changing assignee ------------->", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

// change task titel and detail status
export const changeTitleDescription = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description } = req.body;


        let data = {};

        if (title) data.title = title

        if (description) data.description = description;

        const task = await prisma.task.findUnique({ where: { id } });
        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found",
            });
        }

        await prisma.task.update({
            where: { id },
            data: data
        });

        return res.status(200).json({
            success: true,
            message: "Title Changed Successfully!"
        });
    } catch (error) {
        console.log("Error while changing Title ------------->", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};


export const changeDescriptione = async (req, res) => {
    try {
        const { id } = req.params;
        const { description } = req.body;

        if (!description) return res.status(404).json({
            success: false,
            message: "Description not found",
        });

        const task = await prisma.task.findUnique({ where: { id } });
        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found",
            });
        }

        await prisma.task.update({
            where: { id },
            data: {
                description
            }
        });

        return res.status(200).json({
            success: true,
            message: "Description Changed Successfully!"
        });
    } catch (error) {
        console.log("Error while changing  Description ------------->", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};



export const changeStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { columnId } = req.body;




        if (!columnId) return res.status(404).json({
            success: false,
            message: "Column ID not found",
        });


        const task = await prisma.task.findUnique({ where: { id } });
        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found",
            });
        }

        await prisma.task.update({
            where: { id },
            data: {
                columnId: parseInt(columnId)
            }
        });

        return res.status(200).json({
            success: true,
            message: "Status Changed Successfully!"
        });
    } catch (error) {
        console.log("Error while changing  Status ------------->", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};


export const getAllMembers = async (req, res) => {
    try {
        const { id } = req.params;

        const channel = await prisma.server.findMany({
            where: { id }, include: {
                members: {
                    include: {
                        profile: true
                    }
                }
            }
        });

        if (!channel) {
            return res.status(404).json({
                success: false,
                message: "Channel not found",
            });
        }


        return res.status(200).json({
            success: true,
            members: channel[0].members
        });
    } catch (error) {
        console.log("Error while fetching channel ------------->", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};


// export const filterTask = async (req, res) => {
//     try {
//       const { assigneeId, title } = req.query;
  
//       // Build filter object dynamically
//       const filter = {};
  
//       if (assigneeId) {
//         filter.assigneeId = assigneeId;
//       }
  
//       if (title && typeof title === 'string') {
//         // Case-insensitive filter (lowercase comparison)
//         filter.AND = [
//           {
//             title: {
//               contains: title,
//             },
//           },
//         ];
//       }
  
//       const [matchingTasks, matchingCount, totalCount] = await Promise.all([
//         prisma.task.findMany({
//           where: filter,
//           include: {
//             assignee: true,
//             createdBy: true,
//             column: true,
//           },
//           orderBy: {
//             createdAt: 'desc',
//           },
//         }),
//         prisma.task.count({ where: filter }),
//         prisma.task.count(),
//       ]);
  
//       return res.status(200).json({
//         success: true,
//         message: 'Filtered tasks retrieved successfully',
//         data: {
//           matchingCount,
//           totalCount,
//           matchingTasks,
//         },
//       });
//     } catch (error) {
//       console.error('Error while filtering tasks ------------->', error);
//       return res.status(500).json({
//         success: false,
//         message: 'Internal Server Error',
//       });
//     }
//   };
  

export const filterTask = async (req, res) => {
    try {
      const { assigneeId, title, channelId } = req.query;
  
      if (!channelId) {
        return res.status(400).json({ success: false, message: 'channelId is required' });
      }
  
      // Normalize title for case-insensitive comparison
      const titleLower = title?.toLowerCase();
  
      // Step 1: Get all columns for the given channel
      const columns = await prisma.column.findMany({
        where: { channelId },
        orderBy: { createdAt: 'asc' }, // Optional: sort by created time
      });
  
      // Step 2: For each column, get matching tasks
      const columnsWithFilteredTasks = await Promise.all(
        columns.map(async (column) => {
          const taskFilter = {
            columnId: column.id,
            ...(assigneeId && { assigneeId }),
            ...(titleLower && {
              title: {
                contains: titleLower,
                // remove mode: 'insensitive' due to your Prisma version
              },
            }),
          };
  
          const tasks = await prisma.task.findMany({
            where: taskFilter,
            include: {
              assignee: true,
              createdBy: true,
              column: true,
            },
            orderBy: {
              createdAt: 'desc',
            },
          });
  
          return {
            ...column,
            tasks,
          };
        })
      );
  
      return res.status(200).json(columnsWithFilteredTasks);
  
    } catch (error) {
      console.error('Error while filtering tasks by column ------------->', error);
      return res.status(500).json({
        success: false,
        message: 'Internal Server Error',
      });
    }
  };
  
