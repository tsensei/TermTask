import * as c from '@clack/prompts';

export const exitApplication = () => {
	c.outro('Bye Bye!');
	process.exit(0);
};
