import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import "../styles/Login.css";

const API_URL = process.env.REACT_APP_API_URL;

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  async function handleLogin(e) {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });

      login(res.data.user, res.data.token);

      toast.success("Login efetuado com sucesso!");
      navigate("/", { replace: true });
    } catch (err) {
      if (err.response) {
        // O servidor respondeu com um status fora do range 2xx
        if (err.response.status === 401 || err.response.status === 403) {
          toast.error("Credenciais incorretas. Verifique seu e-mail e senha.");
        } else {
          toast.error(`Erro no login: ${err.response.data.message || "Tente novamente."}`);
        }
      } else if (err.request) {
        // Nenhuma resposta do servidor
        toast.error("Servidor não respondeu. Tente novamente mais tarde.");
      } else {
        toast.error("Ocorreu um erro. Tente novamente.");
      }
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit">Entrar</button>
        </form>
        <p>
          Não tem cadastro? <Link to="/register">Cadastre-se</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;