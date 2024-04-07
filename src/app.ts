#!/usr/bin/env node

import * as c from "@clack/prompts";
import p from "picocolors";
import { exitApplication } from "./lib/helpers.js";
import boxen from "boxen";
import {
  createDataFile,
  loadTasks,
  saveTasks,
  validDataFileExists,
} from "./lib/data.js";
import { Task } from "./lib/types.js";

const MAX_TITLE_LENGTH = 30;
let tasks: Task[];

const addTask = async (value: Task) => {
  tasks.push(value);
  await saveTasks(tasks);
};

const checkPressedExitKey = (choice: string) => {
  if (c.isCancel(choice)) {
    exitApplication();
  }
};

// If data file exists, load. Else, create the data file
async function ensureDataFile() {
  if (!(await validDataFileExists())) {
    createDataFile();
  }
  tasks = await loadTasks();
}

const displayTaskActionMenu = async (taskIndex: number) => {
  console.clear();
  const task = tasks[taskIndex];

  console.log(p.bold(p.underline(`Task: ${task.title}`)));
  console.log(
    `\nDescription: ${task.description ? task.description : p.italic("None")}\n`
  );

  const taskActionChoice = (await c.select({
    message: "Select an action",
    options: [
      !task.done
        ? { label: "Mark Done", value: "markDone" }
        : { label: "Mark undone", value: "markUndone" },
      { label: "Delete", value: "delete" },
      { label: "Go Back", value: "goBack" },
      { label: "Quit", value: "exitApplication" },
    ],
  })) as string;

  switch (taskActionChoice) {
    case "markDone":
      tasks[taskIndex].done = true;
      await saveTasks(tasks);
      console.log(p.green("Task marked as done!"));
      break;
    case "markUndone":
      tasks[taskIndex].done = false;
      await saveTasks(tasks);
      console.log(p.green("Task marked as undone!"));
      break;
    case "delete":
      tasks.splice(taskIndex, 1);
      await saveTasks(tasks);
      console.log(p.yellow("Task deleted!"));
      break;
    case "goBack":
      return;
    case "exitApplication":
      exitApplication();
      break;
    default:
      console.log(p.red("Invalid choice!"));
  }

  checkPressedExitKey(taskActionChoice);
};

const displayTaskListMenu = async () => {
  while (true) {
    console.clear();

    const taskOptions = tasks.map((task, index) => {
      let truncatedTitle = task.title;
      if (task.title.length > MAX_TITLE_LENGTH) {
        truncatedTitle = task.title.substring(0, MAX_TITLE_LENGTH - 3) + "..."; // Subtract 3 for the ellipsis
      }

      return {
        label: task.done
          ? p.strikethrough(`${truncatedTitle}`)
          : `${truncatedTitle}`,
        value: index.toString(),
      };
    });

    taskOptions.push({ label: "Go Back", value: "goBack" });
    taskOptions.push({ label: "Quit", value: "exitApplication" });

    const selectedTaskChoice = (await c.select({
      message: "Select a task",
      options: taskOptions,
    })) as string;

    if (selectedTaskChoice === "goBack") {
      break;
    } else if (selectedTaskChoice === "exitApplication") {
      exitApplication();
    } else {
      await displayTaskActionMenu(Number(selectedTaskChoice));
      continue;
    }

    checkPressedExitKey(selectedTaskChoice);
  }
};

const displayMainMenu = async () => {
  while (true) {
    console.clear();

    console.log(
      boxen("Welcome to TermTask. Manage your tasks efficiently.", {
        textAlignment: "center",
        padding: 1,
        borderStyle: "double",
        borderColor: "cyan",
      })
    );

    const mainInterfaceChoice = (await c.select({
      message: "Select an action",
      options: [
        { label: "Add Task", value: "addTask" }, // Simplified values
        { label: "List Tasks", value: "listTasks" },
        { label: "Quit", value: "exitApplication" },
      ],
    })) as string;

    if (mainInterfaceChoice === "addTask") {
      const taskTitle: string = (await c.text({
        message: "Add a new ToDo :",
        validate(value) {
          if (value.length === 0) return `Title is required!`;
          else return;
        },
      })) as string;

      checkPressedExitKey(taskTitle);

      const taskDescription: string = (await c.text({
        message: "Add descriptive note :",
      })) as string;

      checkPressedExitKey(taskDescription);

      await addTask({
        title: taskTitle,
        description: taskDescription,
        done: false,
      });
    } else if (mainInterfaceChoice === "listTasks") {
      await displayTaskListMenu();
    } else if (mainInterfaceChoice === "exitApplication") {
      exitApplication();
    }

    checkPressedExitKey(mainInterfaceChoice);
  }
};

async function init() {
  await ensureDataFile();
  displayMainMenu();
}

init();
