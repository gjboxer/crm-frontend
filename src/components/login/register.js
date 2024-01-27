import React from "react";
import { useState } from "react";
import "./style.css"
import {Button} from "antd";
import {EyeInvisibleOutlined, EyeOutlined} from "@ant-design/icons";

const Register = ({handleRegister, username, name, email, password, setUsername, setName, setEmail, setPassword}) => {
  const [passwordShown, setPasswordShown] = useState(false);

  const togglePassword = () => {
    setPasswordShown(!passwordShown);
  };

  return (
    <div className="base-container">
      <div className="header">Register</div>
      <div className="content">
        <div className="form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              name="username"
              placeholder="username"
              onChange={({ target }) => setUsername(target.value)}
              value={username}
            />
          </div>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              name="name"
              placeholder="name"
              onChange={({ target }) => setName(target.value)}
              value={name}
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="text"
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
            {/*<Button onClick={togglePassword} style={{}}>*/}
            {/*  {passwordShown ? <EyeInvisibleOutlined /> : <EyeOutlined />}*/}
            {/*</Button>*/}
          </div>
        </div>
      </div>
      <div className="footerl">
        <button type="button" className="btn" onClick={handleRegister}>
          Register
        </button>
      </div>
    </div>
  );
};
export default Register;