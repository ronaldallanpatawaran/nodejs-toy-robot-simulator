import Table from './core/Table';
import inquirer from 'inquirer';
import { RobotCommand, RobotRotation } from './types/robot';
import robotFactory from './core/Robot/factory';

inquirer.registerPrompt('suggest', require('inquirer-prompt-suggest'));

const table = new Table({
  dimensions: { x: 5, y: 5 },
  isSafeMode: true,
});

const robot = robotFactory();

const initialQuestion = [
  {
    type: 'suggest',
    name: 'command',
    message: 'Please place your robot on the table:',
    suggestions: ['PLACE 0,0,NORTH'],
    validate: function (input: string) {
      if (input.split(' ')[0] !== 'PLACE' || input.split(' ').length !== 2) {
        return 'Please enter a valid command. The first command should be PLACE command. e.g. PLACE 0,0,NORTH';
      }
      table.addRobot(robot).at(input.split(' ')[1]);
      return true;
    },
  },
];

const validCommands = ['PLACE', 'MOVE', 'LEFT', 'RIGHT', 'REPORT'];
const subsequentQuestions = [
  {
    type: 'suggest',
    name: 'command',
    message: 'Please enter your next command:',
    suggestions: validCommands,
    validate: function (input: string) {
      const userCommand = input.split(' ')[0];
      if (!validCommands.includes(userCommand)) {
        return `Please enter a valid command (${validCommands.join(', ')})`;
      }

      try {
        switch (userCommand) {
          case RobotCommand.PLACE:
            table.place(table.getRobot()).at(input.split(' ')[1]);
            break;
          case RobotCommand.MOVE:
            table.getRobot().move();
            break;
          case RobotCommand.LEFT:
            table.getRobot().rotate(RobotRotation.LEFT);
            break;
          case RobotCommand.RIGHT:
            table.getRobot().rotate(RobotRotation.RIGHT);
            break;
          case RobotCommand.REPORT:
            console.log(`\nCurrent position: ${table.getRobot().report()}`);
            break;
        }
      } catch (error: any) {
        return error.message;
      }

      return true;
    },
  },
  {
    type: 'confirm',
    name: 'askAgain',
    message: 'Do you want to continue again?',
    default: true,
  },
];

const initialPrompt = () => {
  inquirer.prompt(initialQuestion).then(() => {
    subsequentPrompts();
  });
};

const subsequentPrompts = () => {
  inquirer.prompt(subsequentQuestions).then((response) => {
    if (response.askAgain) {
      subsequentPrompts();
    }
  });
};

console.info('Toy Robot Simulator\n');
console.info('Example of valid commannds that you could enter:\nPLACE 2,3,W\nLEFT\nRIGHT\nMOVE\nREPORT\n');

initialPrompt();
