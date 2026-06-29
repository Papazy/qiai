import Table from 'cli-table3';

export function displayTableSteps(dataObject) {
  if (!dataObject) {
    console.log('Error: No response received from AI provider');
    return;
  }

  const { steps } = dataObject;

  if (!steps || !Array.isArray(steps) || steps.length === 0) {
    console.log('Error: Invalid response format — ensure your question is about terminal commands');
    return;
  }

  const headers = Object.keys(steps[0]);
  const table = new Table({
    head: headers.map(h => h.toUpperCase()),
    style: { head: ['cyan'] }
  });

  steps.forEach(step => {
    table.push(headers.map(header => {
      const value = step[header];
      if (header === 'danger_level') return `Level ${parseInt(value)}`;
      return typeof value === 'string' ? value : String(value);
    }));
  });

  console.log(table.toString());

  if (dataObject.usage) {
    const { input, output, total } = dataObject.usage;
    console.log(`  \x1b[90mTokens: ${input} in / ${output} out / ${total} total\x1b[0m`);
  }
}
