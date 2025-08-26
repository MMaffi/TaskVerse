import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function handleRegister(e) {
    e.preventDefault();
    try {
      await axios.post("http://localhost:3000/auth/register", {
        name,
        email,
        password,
      });
      alert("Usuário criado! Faça login.");
      navigate("/login");
    } catch (err) {
      alert("Erro no cadastro");
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Cadastro</h2>
      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
        /><br />
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
        <button type="submit">Registrar</button>
      </form>
    </div>
  );
}

export default Register;