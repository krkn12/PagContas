import React, { useState } from "react";
import { PersonFill, ArrowClockwise } from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Login({ onLogin }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [showRecoveryForm, setShowRecoveryForm] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoveryMessage, setRecoveryMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = "Email é obrigatório";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email inválido";
    if (!formData.password) newErrors.password = "Senha é obrigatória";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRememberMeChange = (e) => {
    setRememberMe(e.target.checked);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await api.post("/users/login", {
        email: formData.email,
        password: formData.password,
      });

      const {
        token,
        id,
        name,
        email,
        saldoReais,
        wbtcBalance,
        pontos,
        walletAddress,
        isAdmin,
      } = response.data;

      if (rememberMe) {
        localStorage.setItem("token", token);
      } else {
        sessionStorage.setItem("token", token);
      }

      const loggedUser = {
        id,
        name,
        email,
        saldoReais: saldoReais || 0,
        wbtcBalance: wbtcBalance || 0,
        pontos: pontos || 0,
        walletAddress: walletAddress || "0xSeuEnderecoAqui",
        isAdmin: isAdmin || false,
      };
      localStorage.setItem("currentUser", JSON.stringify(loggedUser));

      setSuccessMessage("Login realizado com sucesso! Redirecionando...");
      if (onLogin) {
        onLogin(loggedUser);
      }

      setTimeout(() => {
        setSuccessMessage("");
        const redirectTo = isAdmin ? "/admin" : "/user";
        navigate(redirectTo, { replace: true });
      }, 1000);
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      setErrors({
        auth:
          error.response?.data?.error ||
          "Erro ao fazer login. Verifique sua conexão ou credenciais.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  const handleRecoveryEmailChange = (e) => {
    setRecoveryEmail(e.target.value);
  };

  const handleRecoverySubmit = async (e) => {
    e.preventDefault();
    if (!recoveryEmail) {
      setRecoveryMessage({
        type: "error",
        text: "Por favor, informe seu email",
      });
      return;
    }
    if (!/\S+@\S+\.\S+/.test(recoveryEmail)) {
      setRecoveryMessage({ type: "error", text: "Email inválido" });
      return;
    }

    setRecoveryMessage({
      type: "success",
      text: "Instruções de recuperação enviadas para seu email. Verifique sua caixa de entrada.",
    });
    setTimeout(() => {
      setRecoveryEmail("");
      setRecoveryMessage("");
      setShowRecoveryForm(false);
    }, 3000);
  };

  const toggleRecoveryForm = (e) => {
    e.preventDefault();
    setShowRecoveryForm(!showRecoveryForm);
    setRecoveryMessage("");
  };

  return (
    <>
      {showRecoveryForm ? (
        <div className="password-recovery-form">
          <h5 className="mb-3">Recuperação de Senha</h5>
          {recoveryMessage && (
            <div
              className={`alert alert-${
                recoveryMessage.type === "success" ? "success" : "danger"
              } mb-3`}
              role="alert"
            >
              {recoveryMessage.text}
            </div>
          )}
          <form onSubmit={handleRecoverySubmit}>
            <div className="mb-3">
              <label htmlFor="recoveryEmail" className="form-label">
                Email
              </label>
              <input
                type="email"
                className="form-control"
                id="recoveryEmail"
                placeholder="Seu email cadastrado"
                value={recoveryEmail}
                onChange={handleRecoveryEmailChange}
              />
              <div className="form-text">
                Enviaremos instruções para recuperar sua senha.
              </div>
            </div>
            <div className="d-grid gap-2">
              <button type="submit" className="btn btn-warning">
                <ArrowClockwise /> Recuperar Senha
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={toggleRecoveryForm}
              >
                Voltar ao Login
              </button>
            </div>
          </form>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {successMessage && (
            <div className="alert alert-success mb-3" role="alert">
              {successMessage}
            </div>
          )}
          {errors.auth && (
            <div className="alert alert-danger mb-3" role="alert">
              {errors.auth}
            </div>
          )}
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              type="email"
              className={`form-control ${errors.email ? "is-invalid" : ""}`}
              id="email"
              placeholder="Seu email"
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && (
              <div className="invalid-feedback">{errors.email}</div>
            )}
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              Senha
            </label>
            <input
              type="password"
              className={`form-control ${errors.password ? "is-invalid" : ""}`}
              id="password"
              placeholder="Sua senha"
              value={formData.password}
              onChange={handleChange}
            />
            {errors.password && (
              <div className="invalid-feedback">{errors.password}</div>
            )}
          </div>
          <div className="mb-3 text-end">
            <a
              href="#"
              className="text-decoration-none"
              onClick={toggleRecoveryForm}
            >
              Esqueceu sua senha?
            </a>
          </div>
          <button
            type="submit"
            className="btn btn-warning w-100"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Processando...
              </>
            ) : (
              <>
                <PersonFill /> Entrar
              </>
            )}
          </button>
        </form>
      )}
    </>
  );
}

export default Login;
