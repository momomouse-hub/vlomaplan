import { useState } from "react";
import { register } from "../api/registrations";
import { fetchIdentity } from "../api/identity";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [msg, setMsg] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      await register(email, password, password2);
      await fetchIdentity();
      setMsg("登録が完了しました。");
    } catch (err) {
      const code = err?.data?.error || "unknown";
      const jp = {
        already_registered: "すでに登録済みです",
        password_confirmation_mismatch: "パスワード（確認）が一致しません",
        weak_password: "パスワードは8文字以上にしてください",
        email_unavailable: "このメールアドレスは使用できません",
        invalid_parameters: "入力内容を確認してください",
      };
      setMsg(jp[code] || `登録に失敗しました (${code})`);
    }
  };
  return (
    <form onSubmit={onSubmit} style={{ maxWidth: 420 }}>
      <h2>アカウント作成</h2>
      <label htmlFor="reg-email">メールアドレス</label>
      <input id="reg-email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <label htmlFor="reg-password">パスワード</label>
      <input id="reg-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      <label htmlFor="reg-password2">パスワード（確認）</label>
      <input id="reg-password2" type="password" value={password2} onChange={(e) => setPassword2(e.target.value)} required />
      <button type="submit">登録</button>
      <p>{msg}</p>
    </form>
  );
}