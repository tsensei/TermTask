import fs from 'fs/promises';
import os from 'os';
import p from 'picocolors';
const homeDir = os.homedir();
const dataPath = `${homeDir}/TermTaskData/data.json`;
export const validDataFileExists = async () => {
    try {
        const stats = await fs.stat(dataPath);
        if (!stats.isFile())
            return false;
        const fileContents = await fs.readFile(dataPath, 'utf-8');
        const data = JSON.parse(fileContents);
        return Array.isArray(data);
    }
    catch (error) {
        console.error(p.red('Error checking data file:'), error);
        return false;
    }
};
export const createDataFile = async () => {
    try {
        await fs.mkdir(`${homeDir}/TermTaskData`, { recursive: true });
        await fs.writeFile(dataPath, JSON.stringify([]));
    }
    catch (error) {
        console.error(p.red('Error creating data file:'), error);
    }
};
export const loadTasks = async () => {
    try {
        const data = await fs.readFile(dataPath, 'utf-8');
        return JSON.parse(data);
    }
    catch (error) {
        console.error(p.red('Error loading tasks:'), error);
        return [];
    }
};
export const saveTasks = async (tasks) => {
    try {
        await fs.writeFile(dataPath, JSON.stringify(tasks));
    }
    catch (error) {
        console.error(p.red('Error saving tasks:'), error);
    }
};
//# sourceMappingURL=data.js.map