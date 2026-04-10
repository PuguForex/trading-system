const API_URL = import.meta.env.VITE_API_URL;

async function loadTrades() {
  try {
    const res = await fetch(`${API_URL}/trades`);
    const data = await res.json();

    const app = document.querySelector<HTMLDivElement>('#app')!;
    app.innerHTML = `
      <h1>Trades</h1>
      <pre>${JSON.stringify(data, null, 2)}</pre>
    `;
  } catch (err) {
    console.error(err);
  }
}

loadTrades();