import React from "react";
import Header from "../components/layouts/Header";
import Footer from "../components/layouts/Footer";
import Banner from "../components/layouts/Banner";

import ChatWidget from "../components/chat/ChatWidget";

const UserLayout = ({ children }) => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />
      <Banner />

      <main className="flex-grow-1">
        {children}
      </main>

      <Footer />

{/* CHAT ICON */}
      <ChatWidget />

    </div>
  );
};


export default UserLayout;
