import axios from "axios";
import React, { useEffect, useState } from "react";
import "./App.css";
import { Login, Register } from "./components/login/index";
import {message} from "antd";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";

const App = () => {
  const [isLogginActive, setIsLogginActive] = useState(true);
  const [rightClass, setRightClass] = useState("");
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setRightClass("right");
    const logedInUser = window.localStorage.getItem("user");
    if (logedInUser) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = async () => {
  const data = {
    "email": email,
    'password': password,
  };
  try {
    const response = await axios.post('http://127.0.0.1:8000/account/login', data);
    if(response?.data?.user?.Token) {
      window.localStorage.setItem("user", JSON.stringify(response.data.user));
      setIsAuthenticated(true);
    }
    message.success("Login successful")
  } catch (error) {
    message.error("Failed to login")
  }
};

  const handleRegister = async () => {
    const data = {
      "username": username,
      "name": name,
      "email": email,
      'password': password,
    };
    try {
      const response = await axios.post('http://127.0.0.1:8000/account/sign-up', data);
      if(response?.data?.user?.Token) {
        window.localStorage.setItem("user", JSON.stringify(response.data.user));
        setIsAuthenticated(true);
      }
      message.success("Login successful")
      } catch (error) {
      message.error("Failed to login")
  }

  };

  const changeState = () => {
    isLogginActive ? setRightClass("left") : setRightClass("right");
    setIsLogginActive(!isLogginActive);
  };
  const current = isLogginActive ? "Register" : "Login";
  const currentActive = isLogginActive ? "login" : "register";

  if (!isAuthenticated) {
    return (
      <div className="App">
        <div className="login">
          <div className="container">
            {isLogginActive && (
              <Login handleLogin={handleLogin}
                     email={email} setEmail={setEmail}
                     password={password} setPassword={setPassword}/>
            )}
            {!isLogginActive && (
              <Register handleRegister={handleRegister}
                        username={username} setUsername={setUsername}
                        name={name} setName={setName}
                        email={email} setEmail={setEmail}
                        password={password} setPassword={setPassword}/>
            )}
          </div>
          <RightSide
            className={rightClass}
            current={current}
            currentActive={currentActive}
            onClick={changeState}
          />
        </div>
      </div>
    );
  }

  return (
      <div className="App2">
        <Router>
          <Routes>
            <Route exact path="/" element={<Home/>}/>
          </Routes>
        </Router>
      </div>
  );
};

const RightSide = (props) => {
  return (
    <div className={`right-side ${props.className}`} onClick={props.onClick}>
      <div className="inner-container">
        <div className="text">{props.current}</div>
      </div>
    </div>
  );
};

export default App;