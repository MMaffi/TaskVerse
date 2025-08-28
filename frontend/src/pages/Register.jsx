import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import "../styles/Register.css";

const API_URL = process.env.REACT_APP_API_URL;

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function handleRegister(e) {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/auth/register`, { name, email, password });
      toast.success("✅ Usuário criado com sucesso! Faça login.");
      setTimeout(() => navigate("/login"), 1000);
    } catch (err) {
      toast.error("❌ Erro no cadastro. Verifique os dados.");
    }
  }

  return (
    <div className="register-page">
      <div className="register-container">
        <h2>Cadastro</h2>
        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
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
          <button type="submit">Registrar</button>
          <p>
            Já tem cadastro? <Link to="/login">Faça Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Register;