const form = document.getElementById("login-form");
const loginPanel = document.getElementById("login-panel");
const loading = document.getElementById("login-loading");
const errorBox = document.getElementById("login-error");

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(form);

  // 通信中はフォームを隠してローディングを表示する
  loginPanel.hidden = true;
  loading.hidden = false;

  const res = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: formData.get("id"), password: formData.get("password") }),
  });
  const data = await res.json();
  loading.hidden = true;

  if (res.ok) {
    location.href = "/orders.html";
    return;
  }

  // エラー時はメッセージを表示してフォームを戻す
  showError(data.message);
  loginPanel.hidden = false;
});

function showError(message) {
  errorBox.textContent = message.trim();
  errorBox.hidden = false;
}
