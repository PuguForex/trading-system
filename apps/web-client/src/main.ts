const rawUrl = import.meta.env.VITE_API_URL;

if (!rawUrl) {
  throw new Error("VITE_API_URL is not defined");
}

const API_URL = rawUrl.replace(/\/$/, "");

console.log("API URL:", API_URL);

async function loadTrades() {
  const app = document.querySelector<HTMLDivElement>('#app');

  if (!app) {
    console.error("App root not found");
    return;
  }

  try {
    const res = await fetch(`${API_URL}/trades`);

    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }

    const data = await res.json();

    app.innerHTML = `
      <h1>Trades</h1>
      <pre>${JSON.stringify(data, null, 2)}</pre>
    `;
  } catch (err) {
    app.innerHTML = `<p style="color:red;">Error loading trades</p>`;
    console.error("Fetch error:", err);
  }
}

loadTrades();