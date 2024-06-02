import React from "react";
import styles from "./HomePage.module.css";

const HomePage: React.FC = () => {
  return (
    <div className={styles.home}>
      <h1>Welcome to ChatWave</h1>
      <p>
        This is the home page. Here you can start new chats, view recent
        messages, and more.
      </p>
    </div>
  );
};

export default HomePage;
