import readline from 'readline';
import config from '../config/config.js';
import { getAvailableProvider, getResponse, ensureApiKeys } from '../utils/provider.js';
import { interactiveModelSelect } from '../utils/modelSelector.js';
import { displayTableSteps } from '../utils/display.js';

function printHelp() {
  console.log('');
  console.log('  \x1b[1m\x1b[36mQIAI Interactive Mode\x1b[0m');
  console.log('  ─────────────────────────────────────────────────');
  console.log('  \x1b[33m/help\x1b[0m                   Show this help');
  console.log('  \x1b[33m/clear\x1b[0m                  Clear terminal');
  console.log('  \x1b[33m/list-models\x1b[0m            Browse & select model');
  console.log('  \x1b[33m/provider <name>\x1b[0m        Switch provider (openai|gemini|openrouter)');
  console.log('  \x1b[33m/model <id>\x1b[0m             Switch model for this session');
  console.log('  \x1b[33m/status\x1b[0m                 Show current provider & model');
  console.log('  \x1b[33m/exit\x1b[0m                   Exit');
  console.log('  ─────────────────────────────────────────────────');
  console.log('  Type your question and press Enter.');
  console.log('');
}

export async function startInteractiveMode() {
  ensureApiKeys();

  let sessionProvider = null;
  let sessionModel = null;

  printHelp();

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true,
    prompt: '\x1b[32m>\x1b[0m ',
  });

  rl.on('close', () => {
    console.log('\nBye!');
    process.exit(0);
  });

  const prompt = () => rl.prompt();

  rl.on('line', async (input) => {
    rl.pause();
    input = input.trim();

    if (!input) {
      rl.resume();
      prompt();
      return;
    }

    if (input.startsWith('/')) {
      const [cmd, ...cmdArgs] = input.slice(1).split(/\s+/);

      switch (cmd.toLowerCase()) {
        case 'exit':
        case 'quit':
          rl.close();
          return;

        case 'help':
          printHelp();
          break;

        case 'clear':
          process.stdout.write('\x1bc');
          break;

        case 'status': {
          const p = sessionProvider || getAvailableProvider();
          const m = sessionModel || config.defaultModel || '(default)';
          console.log(`\n  Provider : \x1b[36m${p.toUpperCase()}\x1b[0m`);
          console.log(`  Model    : \x1b[36m${m}\x1b[0m\n`);
          break;
        }

        case 'provider': {
          const p = cmdArgs[0]?.toLowerCase();
          if (!p || !['openai', 'gemini', 'openrouter'].includes(p)) {
            console.log('  Usage: /provider openai|gemini|openrouter');
          } else {
            sessionProvider = p;
            console.log(`  Provider set to \x1b[36m${p.toUpperCase()}\x1b[0m for this session.`);
          }
          break;
        }

        case 'model': {
          const m = cmdArgs[0];
          if (!m) {
            console.log('  Usage: /model <model-id>');
          } else {
            sessionModel = m;
            console.log(`  Model set to \x1b[36m${m}\x1b[0m for this session.`);
          }
          break;
        }

        case 'list-models':
        case 'select-model': {
          const selected = await interactiveModelSelect(rl);
          if (selected) {
            sessionProvider = selected.provider;
            sessionModel = selected.modelId;
            console.log(`\n  Active: \x1b[36m${selected.provider.toUpperCase()}\x1b[0m / \x1b[36m${selected.modelId}\x1b[0m\n`);
          }
          break;
        }

        default:
          console.log(`  Unknown command: /${cmd}. Type /help.`);
      }

      rl.resume();
      prompt();
      return;
    }

    try {
      const provider = sessionProvider || getAvailableProvider();
      displayTableSteps(await getResponse(provider, input, sessionModel));
    } catch (err) {
      console.error(`\n  Error: ${err.message}`);
    }

    rl.resume();
    prompt();
  });

  prompt();
}
