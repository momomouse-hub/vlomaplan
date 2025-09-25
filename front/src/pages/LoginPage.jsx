import { useState } from "react";
import { login, logout } from "../api/sessions";
import { fetchIdentity } from "../api/identity";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const onLogin = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      await login(email, password);
      await fetchIdentity();
      setMsg("ログインしました");
    } catch (err) {
      const code = err?.data?.error || "unknown";
      const jp = { invalid_credentials: "メールまたはパスワードが違います" };
      setMsg(jp[code] || `ログインに失敗しました (${code})`);
    }
  };
  const onLogout = async () => {
    setMsg("");
    try {
      await logout();
      await fetchIdentity();
      setMsg("ログアウトしました");
    } catch (err) {
      setMsg("ログアウトに失敗しました");
    }
  };

  return (
    <div style={{ maxWidth: 420 }}>
      <h2>ログイン</h2>
      <form onSubmit={onLogin}>
        <label>メールアドレス</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} required />
        <label>パスワード</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">ログイン</button>
      </form>
      <hr />
      <button onClick={onLogout}>ログアウト</button>
      <p>{msg}</p>
    </div>
  );
}