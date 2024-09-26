import { useState } from "react";

const useInputHandlers = () => {
  const [inputValue, setInputValue] = useState("");

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleKeyPress = (event, sendMessage) => {
    if (event.key === "Enter") {
      sendMessage();
    }
  };

  return { inputValue, setInputValue, handleInputChange, handleKeyPress };
};

export default useInputHandlers;
