import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:3000/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      if (res.data.user?.name) localStorage.setItem("userName", res.data.user.name);

      toast.success("Login efetuado com sucesso!");
      setTimeout(() => navigate("/"), 1000); // aguarda 1s para o toast aparecer
    } catch (err) {
      toast.error("Erro no login");
    }
  }

  return (
    <div className="login-page">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="login-container">
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <input type="email" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} />
          <input type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} />
          <button type="submit">Entrar</button>
        </form>
        <p>Não tem cadastro? <a href="/register">Cadastre-se</a></p>
      </div>
    </div>
  );
}

export default Login;