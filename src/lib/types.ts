export enum MainInterfaceChoice {
	AddTask = 'addTask',
	ListTasks = 'listTasks',
	ExitApplication = 'exitApplication',
}

export interface Task {
	title: string;
	description?: string;
	done: boolean;
}
