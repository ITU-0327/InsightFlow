import React from "react";
import { ChatBox } from "./Chatbox";
import { ragChatAction } from "../actions";

const Page: React.FC = () => {
  return <ChatBox onSend={ragChatAction} />;
};

export default Page;
