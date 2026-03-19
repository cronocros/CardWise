const { ensureState, renderTerminal } = require('./dashboard-lib');

const watch = process.argv.includes('--watch');
const intervalMs = Number(process.env.DASHBOARD_TICK_MS || 2000);

function clearScreen() {
  process.stdout.write('\u001b[2J\u001b[H');
}

function tick() {
  clearScreen();
  process.stdout.write(renderTerminal(ensureState()));
  process.stdout.write('\n');
}

tick();

if (watch) {
  setInterval(tick, intervalMs);
}
