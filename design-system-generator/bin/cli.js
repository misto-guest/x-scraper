#!/usr/bin/env node

/**
 * Design System Generator CLI
 * Entry point for the CLI tool
 */

const { program } = require('commander');
const inquirer = require('inquirer');
const path = require('path');
const chalk = require('chalk');
const { generateDesignSystem } = require('../src/generator');
const { getAvailableThemes } = require('../src/fonts');

const AVAILABLE_THEMES = getAvailableThemes();

// ASCII Art Banner
const banner = `
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   ███╗   ██╗███████╗██╗    ██╗      █████╗ ██████╗ ██╗   ║
║   ████╗  ██║██╔════╝██║    ██║     ██╔══██╗██╔══██╗██║   ║
║   ██╔██╗ ██║█████╗  ██║ █╗ ██║     ███████║██████╔╝██║   ║
║   ██║╚██╗██║██╔══╝  ██║███╗██║     ██╔══██║██╔═══╝ ██║   ║
║   ██║ ╚████║███████╗╚███╔███╔╝     ██║  ██║██║     ██║   ║
║   ╚═╝  ╚═══╝╚══════╝ ╚══╝╚══╝      ╚═╝  ╚═╝╚═╝     ╚═╝   ║
║                                                           ║
║                    G E N E R A T O R                      ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
`;

console.log(chalk.cyan(banner));

program
  .version('1.0.0')
  .description('Generate themed component libraries with Tailwind config, typography, colors, and base components');

// Interactive mode
program
  .command('interactive')
  .alias('i')
  .description('Launch interactive mode to create a custom theme')
  .action(async () => {
    console.log(chalk.yellow('\n🎨 Interactive Mode: Create Your Custom Design System\n'));
    
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'mode',
        message: 'What would you like to do?',
        choices: [
          { name: '🎨 Use a pre-built theme', value: 'preset' },
          { name: '✨ Create a custom theme', value: 'custom' }
        ]
      }
    ]);
    
    let themeKey;
    let outputPath;
    
    if (answers.mode === 'preset') {
      const presetAnswer = await inquirer.prompt([
        {
          type: 'list',
          name: 'theme',
          message: 'Select a pre-built theme:',
          choices: AVAILABLE_THEMES.map(t => ({
            name: t.charAt(0).toUpperCase() + t.slice(1).replace('-', ' '),
            value: t
          }))
        },
        {
          type: 'input',
          name: 'output',
          message: 'Output directory (optional):',
          default: '',
          filter: (input) => input || path.join(process.cwd(), 'outputs', `${answers.theme}-design-system`)
        }
      ]);
      
      themeKey = presetAnswer.theme;
      outputPath = presetAnswer.output;
      
    } else {
      const customAnswer = await inquirer.prompt([
        {
          type: 'input',
          name: 'themeName',
          message: 'Theme name:',
          validate: (input) => input.length > 0 || 'Theme name is required'
        },
        {
          type: 'input',
          name: 'primaryColor',
          message: 'Primary color (hex):',
          default: '#374151',
          validate: (input) => /^#[0-9A-Fa-f]{6}$/.test(input) || 'Invalid hex color (e.g., #374151)'
        },
        {
          type: 'input',
          name: 'accentColor',
          message: 'Accent color (hex):',
          default: '#3b82f6',
          validate: (input) => /^#[0-9A-Fa-f]{6}$/.test(input) || 'Invalid hex color (e.g., #3b82f6)'
        },
        {
          type: 'list',
          name: 'mood',
          message: 'Design mood:',
          choices: ['Professional', 'Playful', 'Elegant', 'Bold', 'Minimal', 'Experimental']
        },
        {
          type: 'input',
          name: 'output',
          message: 'Output directory:',
          default: (answers) => path.join(process.cwd(), 'outputs', `${answers.themeName.toLowerCase().replace(/\s+/g, '-')}-design-system`)
        }
      ]);
      
      // For now, map custom to closest preset
      // In a full implementation, you'd generate custom schemes
      const moodMap = {
        'Professional': 'refined-minimal',
        'Playful': 'playful',
        'Elegant': 'luxury',
        'Bold': 'brutalist',
        'Minimal': 'refined-minimal',
        'Experimental': 'retro-futuristic'
      };
      
      themeKey = moodMap[customAnswer.mood];
      outputPath = customAnswer.output;
      
      console.log(chalk.yellow(`\n⚠️  Custom themes use the "${themeKey}" base. Advanced customization coming soon!\n`));
    }
    
    try {
      await generateDesignSystem(themeKey, outputPath);
    } catch (error) {
      console.error(chalk.red('\n❌ Error generating design system:'), error.message);
      process.exit(1);
    }
  });

// Generate command with theme argument
program
  .command('generate [theme]')
  .alias('g')
  .description('Generate a design system for a specific theme')
  .option('-o, --output <path>', 'Output directory')
  .action(async (theme, options) => {
    if (!theme) {
      console.log(chalk.yellow('\n⚠️  No theme specified. Available themes:\n'));
      AVAILABLE_THEMES.forEach(t => {
        console.log(`  ${chalk.cyan(t.charAt(0).toUpperCase() + t.slice(1))}`);
      });
      console.log(chalk.yellow('\nUsage: design-system generate <theme>\n'));
      console.log(chalk.gray('Example: design-system generate brutalist'));
      console.log(chalk.gray('         design-system g editorial\n'));
      return;
    }
    
    // Validate theme
    const normalizedTheme = theme.toLowerCase().replace(/\s+/g, '-');
    if (!AVAILABLE_THEMES.includes(normalizedTheme)) {
      console.error(chalk.red(`\n❌ Unknown theme: "${theme}"`));
      console.log(chalk.yellow('\nAvailable themes:'));
      AVAILABLE_THEMES.forEach(t => console.log(chalk.gray(`  - ${t}`)));
      console.log();
      process.exit(1);
    }
    
    const outputPath = options.output || path.join(process.cwd(), 'outputs', `${normalizedTheme}-design-system`);
    
    try {
      await generateDesignSystem(normalizedTheme, outputPath);
    } catch (error) {
      console.error(chalk.red('\n❌ Error generating design system:'), error.message);
      process.exit(1);
    }
  });

// List themes command
program
  .command('list')
  .alias('ls')
  .description('List all available themes')
  .action(() => {
    console.log(chalk.cyan('\n📋 Available Themes:\n'));
    
    const themeDescriptions = {
      'brutalist': 'High contrast black and white with bold red accents',
      'editorial': 'Warm editorial tones with sophisticated gold accents',
      'luxury': 'Deep navy with luxurious gold accents',
      'playful': 'Vibrant purple and pink with sunny yellow accents',
      'retro-futuristic': 'Cyberpunk teal and purple with neon cyan',
      'industrial': 'Safety orange with warm neutrals on dark gray',
      'refined-minimal': 'Clean neutral grays with subtle indigo'
    };
    
    AVAILABLE_THEMES.forEach(theme => {
      const displayName = theme.charAt(0).toUpperCase() + theme.slice(1).replace('-', ' ');
      const description = themeDescriptions[theme] || '';
      console.log(`  ${chalk.cyan(displayName.padEnd(20))} ${chalk.gray(description)}`);
    });
    
    console.log(chalk.gray('\nUsage: design-system generate <theme>\n'));
  });

// Default to interactive if no command
program.action(() => {
  console.log(chalk.yellow('\n💡 Quick start:'));
  console.log(chalk.gray('  design-system interactive    - Interactive mode'));
  console.log(chalk.gray('  design-system generate <theme> - Generate specific theme'));
  console.log(chalk.gray('  design-system list            - List available themes\n'));
  
  // Show list
  program.commands.find(c => c.name() === 'list').action();
});

// Parse arguments
program.parse(process.argv);

// Show help if no arguments
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
