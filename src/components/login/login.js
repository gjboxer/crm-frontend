import React from "react";
import { useState } from "react";
import loginImg from "../../login.jpg";
import "./style.css"

const Login = ({handleLogin, email, password, setEmail, setPassword}) => {
  const [passwordShown, setPasswordShown] = useState(false);

  const togglePassword = () => {
    setPasswordShown(!passwordShown);
  };
  return (
    <div className="base-container">
      <div className="header">Login</div>
      <div className="content">
        <div className="image">
          <img src={loginImg} alt="bg" />
        </div>
        <div className="form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              name="email"
              placeholder="email"
              onChange={({ target }) => setEmail(target.value)}
              value={email}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type={passwordShown ? "text" : "password"}
              name="password"
              placeholder="password"
              value={password}
              onChange={({ target }) => setPassword(target.value)}
            />
            <i onClick={togglePassword} class="fa fa-eye teal-color"></i>
          </div>
        </div>
      </div>
      <div className="footerl">
        <button type="button" className="btn" onClick={handleLogin}>
          Login
        </button>
      </div>
    </div>
  );
};

export default Login;