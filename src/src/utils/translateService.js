export async function translateText(text, targetLanguage) {
  const body = new URLSearchParams({ text, target_language: targetLanguage });
  const response = await fetch("http://localhost:8001/translate", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const data = await response.json();
  return data.text;
}
