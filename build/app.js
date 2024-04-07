#!/usr/bin/env node
import * as c from "@clack/prompts";
import chalk from "chalk";
import { exitApplication } from "./lib/helpers.js";
import boxen from "boxen";
import { createDataFile, loadTasks, saveTasks, validDataFileExists, } from "./lib/data.js";
const MAX_TITLE_LENGTH = 30;
let tasks;
const addTask = async (value) => {
    tasks.push(value);
    await saveTasks(tasks);
};
const checkPressedExitKey = (choice) => {
    if (c.isCancel(choice)) {
        exitApplication();
    }
};
async function ensureDataFile() {
    if (!(await validDataFileExists())) {
        createDataFile();
    }
    tasks = await loadTasks();
}
const displayTaskActionMenu = async (taskIndex) => {
    console.clear();
    const task = tasks[taskIndex];
    const statusLabel = task.done ? chalk.green("DONE") : chalk.yellow("PENDING");
    console.log(chalk.bold(chalk.underline(`Task (${statusLabel}): ${task.title}`)));
    console.log(`\nDescription: ${task.description ? task.description : chalk.italic("None")}\n`);
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
    }));
    switch (taskActionChoice) {
        case "markDone":
            tasks[taskIndex].done = true;
            await saveTasks(tasks);
            console.log(chalk.green("Task marked as done!"));
            break;
        case "markUndone":
            tasks[taskIndex].done = false;
            await saveTasks(tasks);
            console.log(chalk.green("Task marked as undone!"));
            break;
        case "delete":
            tasks.splice(taskIndex, 1);
            await saveTasks(tasks);
            console.log(chalk.yellow("Task deleted!"));
            break;
        case "goBack":
            return;
        case "exitApplication":
            exitApplication();
            break;
        default:
            console.log(chalk.red("Invalid choice!"));
    }
    checkPressedExitKey(taskActionChoice);
};
const displayTaskListMenu = async () => {
    while (true) {
        console.clear();
        const taskOptions = tasks.map((task, index) => {
            const statusLabel = task.done
                ? chalk.green("DONE")
                : chalk.yellow("PENDING");
            let truncatedTitle = task.title;
            if (task.title.length > MAX_TITLE_LENGTH) {
                truncatedTitle = task.title.substring(0, MAX_TITLE_LENGTH - 3) + "...";
            }
            return {
                label: `${statusLabel} - ${truncatedTitle}`,
                value: index.toString(),
            };
        });
        taskOptions.push({ label: "Go Back", value: "goBack" });
        taskOptions.push({ label: "Quit", value: "exitApplication" });
        const selectedTaskChoice = (await c.select({
            message: "Select a task",
            options: taskOptions,
        }));
        if (selectedTaskChoice === "goBack") {
            break;
        }
        else if (selectedTaskChoice === "exitApplication") {
            exitApplication();
        }
        else {
            await displayTaskActionMenu(Number(selectedTaskChoice));
            continue;
        }
        checkPressedExitKey(selectedTaskChoice);
    }
};
const displayMainMenu = async () => {
    while (true) {
        console.clear();
        console.log(boxen("Welcome to TermTask. Manage your tasks efficiently.", {
            textAlignment: "center",
            padding: 1,
            borderStyle: "double",
            borderColor: "cyan",
        }));
        const mainInterfaceChoice = (await c.select({
            message: "Select an action",
            options: [
                { label: "Add Task", value: "addTask" },
                { label: "List Tasks", value: "listTasks" },
                { label: "Quit", value: "exitApplication" },
            ],
        }));
        if (mainInterfaceChoice === "addTask") {
            const taskTitle = (await c.text({
                message: "Add a new ToDo :",
                validate(value) {
                    if (value.length === 0)
                        return `Title is required!`;
                    else
                        return;
                },
            }));
            checkPressedExitKey(taskTitle);
            const taskDescription = (await c.text({
                message: "Add descriptive note :",
            }));
            checkPressedExitKey(taskDescription);
            await addTask({
                title: taskTitle,
                description: taskDescription,
                done: false,
            });
        }
        else if (mainInterfaceChoice === "listTasks") {
            await displayTaskListMenu();
        }
        else if (mainInterfaceChoice === "exitApplication") {
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
//# sourceMappingURL=app.js.map