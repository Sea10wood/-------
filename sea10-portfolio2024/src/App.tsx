import React, { useState, useEffect } from "react";
import Gallery from "./components/Gallery";
import "./App.css";
import Text from "./components/Text";

const App: React.FC = () => {
  const [showText, setShowText] = useState(true);
  const [hasTimeout, setHasTimeout] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowText(false);
      setHasTimeout(true);
    }, 55000);

    return () => clearTimeout(timer);
  }, []);

  const skipText = () => {
    setShowText(false);
    setHasTimeout(true);
  };

 

  return (
    <>
      {showText && (
        <>
          <Text />
          <div className="skip-button-container">
            <button onClick={skipText} className="skip-button">
              Skip
            </button>
          </div>
          
        </>
      )}
      {!showText && hasTimeout && <Gallery />}
    
    </>
  );
};

export default App;
