import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/Register.css";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function handleRegister(e) {
    e.preventDefault();
    try {
      await axios.post("http://localhost:3000/auth/register", { name, email, password });
      toast.success("Usuário criado! Faça login.");
      setTimeout(() => navigate("/login"), 1000);
    } catch (err) {
      toast.error("Erro no cadastro");
    }
  }

  return (
    <div className="register-page">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="register-container">
        <h2>Cadastro</h2>
        <form onSubmit={handleRegister}>
          <input type="text" placeholder="Nome" value={name} onChange={e => setName(e.target.value)} />
          <input type="email" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} />
          <input type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} />
          <button type="submit">Registrar</button>
          <p>Já tem cadastro? <a href="/login">Faça Login</a></p>
        </form>
      </div>
    </div>
  );
}

export default Register;