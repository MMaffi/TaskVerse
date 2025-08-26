import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:3000/auth/login", {
        email,
        password,
      });
      localStorage.setItem("token", res.data.token);
      navigate("/");
    } catch (err) {
      alert("Erro no login");
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        /><br />
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        /><br />
        <button type="submit">Entrar</button>
      </form>
      <button onClick={() => navigate("/register")}>Registrar</button>
    </div>
  );
}

export default Login;