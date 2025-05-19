import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();


export const addColumn = async (req, res) => {
    try {

        const { data } = req.body;

        const taskColumns = await prisma.taskColumn.createMany({
            data
        })

        console.log(taskColumns);


        return res.status(201).json({
            success: true,
            taskColumns
        })

    } catch (error) {
        console.log("Error while creating task columns --------------> ", error)

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}




export const delColumn = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.taskColumn.delete({
            where: {
                id: parseInt(id)
            }
        })


        return res.status(200).json({
            success: true,
            message: "Deleted Suceesfully!"
        })
    } catch (error) {
        console.log("Error while deleted task columns --------------> ", error)

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}



export const changeName = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        await prisma.taskColumn.update({
            where: {
                id: parseInt(id)
            },
            data: {
                name
            }
        })
        return res.status(200).json({
            success: true,
            message: "Updated Suceesfully!"
        })
    } catch (error) {
        console.log("Error while updated task columns --------------> ", error)

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}

export const getTaskColumnData = async (req, res) => {
    try {
        const { id } = req.params;
        const taskColData = await prisma.taskColumn.findMany({
            where: {
                channelId: id
            }, orderBy: {
                id: "asc"
            },
            include: {
                tasks: {
                    include: {
                        assignee: true,
                        createdBy: true,
                    },
                },
            },
        })
        return res.status(200).json({
            success: true,
            data: taskColData
        })
    } catch (error) {
        console.log("Error while fetching task column data--------------> ", error)

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}



export const getAllColumns = async (req, res) => {
    try {
      const { id } = req.params;

      let column=[];
  
      const data = await prisma.taskColumn.findMany({
        where: {
          channelId: id
        }
      });
  

      data.map(ele=>{
        if(!column.includes(ele.name)) column.push({
            name:ele.name,
            id:ele.id
        })
      })
      return res.status(200).json({
        success: true,
        column
      });
    } catch (error) {
      console.log("Error while fetching all column names: ", error);
      return res.status(500).json({
        success: false,
        message: "Internal Server Error"
      });
    }
  };
  

export const filterTask = async (req, res) => {
  try {
    const { assigneeId, title, channelId } = req.query;

    if (!channelId) {
      return res.status(400).json({ success: false, message: 'channelId is required' });
    }

    const titleLower = title?.toLowerCase();

    const columns = await prisma.taskColumn.findMany({
      where: { channelId },
      orderBy: { id: 'asc' }, 
    });

    const columnsWithFilteredTasks = await Promise.all(
      columns.map(async (column) => {
        const taskFilter = {
          columnId: column.id,
          ...(assigneeId && { assigneeId }),
          ...(titleLower && {
            title: {
              contains: titleLower,
              // mode: 'insensitive' — only include if your Prisma version supports it
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



export const calculateProgress = async (req, res) => {
    try {
      const { channelId } = req.query;
  
      if (!channelId) {
        return res.status(400).json({ success: false, message: 'channelId is required' });
      }
  
      // Step 1: Get all task columns sorted by id
      const columns = await prisma.taskColumn.findMany({
        where: { channelId },
        orderBy: { id: 'asc' },
      });
  
      if (columns.length < 2) {
        return res.status(400).json({ success: false, message: 'Not enough columns to calculate progress' });
      }
  
      // Step 2: Identify second last and last column
      const secondLastColumn = columns[columns.length - 2];
      const lastColumn = columns[columns.length - 1];
  
      // Step 3: Get tasks from both columns
      const [secondLastTasks, lastTasks] = await Promise.all([
        prisma.task.findMany({ where: { columnId: secondLastColumn.id } }),
        prisma.task.findMany({ where: { columnId: lastColumn.id } }),
      ]);
  
      const totalTasks = await prisma.task.count({
        where: {
          column: {
            channelId: channelId, // Ensure this is a String, which it is
          },
        },
      });
  
      if (totalTasks === 0) {
        return res.status(200).json({ progress: 0 });
      }
  
      // Step 4: Calculate score
      const totalPoints = (secondLastTasks.length * 5) + (lastTasks.length * 10);
      const maxPossiblePoints = totalTasks * 10;
      const progress = (totalPoints / maxPossiblePoints) * 100;
  
      return res.status(200).json({ progress: parseFloat(progress.toFixed(2)) });
  
    } catch (error) {
      console.error('Error calculating progress ------------->', error);
      return res.status(500).json({
        success: false,
        message: 'Internal Server Error',
      });
    }
  };
  

  export const getServerProgress = async (req, res) => {
    try {
      const { serverId } = req.query;
  
      if (!serverId) {
        return res.status(400).json({ success: false, message: 'serverId is required' });
      }
  
      // Step 1: Get all TODO channels for this server
      const todoChannels = await prisma.channel.findMany({
        where: {
          serverId,
          type: 'TODO',
        },
      });
  
      let totalProgress = 0;
      let channelCount = 0;
  
      for (const channel of todoChannels) {
        const columns = await prisma.taskColumn.findMany({
          where: { channelId: channel.id },
          orderBy: { id: 'asc' },
        });
  
        if (columns.length < 2) continue;
  
        const secondLast = columns[columns.length - 2];
        const last = columns[columns.length - 1];
  
        const [secondLastTasks, lastTasks] = await Promise.all([
          prisma.task.findMany({ where: { columnId: secondLast.id } }),
          prisma.task.findMany({ where: { columnId: last.id } }),
        ]);
  
        const totalTasks = await prisma.task.count({
          where: { column: { channelId: channel.id } },
        });
  
        if (totalTasks === 0) continue;
  
        const earnedPoints = (secondLastTasks.length * 5) + (lastTasks.length * 10);
        const maxPoints = totalTasks * 10;
  
        const channelProgress = (earnedPoints / maxPoints) * 100;
        totalProgress += channelProgress;
        channelCount += 1;
      }
  
      const overallProgress = channelCount === 0 ? 0 : totalProgress / channelCount;
  
      return res.status(200).json({
        success: true,
        serverId,
        overallProgress: parseFloat(overallProgress.toFixed(2)),
      });
  
    } catch (error) {
      console.error('Error calculating server progress ------------->', error);
      return res.status(500).json({
        success: false,
        message: 'Internal Server Error',
      });
    }
  };
  