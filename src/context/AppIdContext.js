import { createContext, useContext, useState } from "react";

const AppIdContext = createContext(null);

export const AppIdProvider = ({ children }) => {
  const [appId, setAppId] = useState(null);
  const [userName, setUserName] = useState(null);
  const [userPhoto, setUserPhoto] = useState(null);
  const [total_voters, setTotalVoters] = useState(null);

  // NEW: Add language state here (default to 'en')
  const [language, setLanguage] = useState('en');

  // --> ADD THESE TWO LINES SO IT WORKS <--
  const [userId, setUserId] = useState(0);

  // 👇 ADDED: JWT Token and User Type
  const [jwtToken, setJwtToken] = useState(null);
  const [userType, setUserType] = useState(null);

  return (
    <AppIdContext.Provider
      value={{
        appId, setAppId,
        userName, setUserName,
        userPhoto, setUserPhoto,
        language, setLanguage,
        userId, setUserId,
        total_voters, setTotalVoters,
        // 👇 ADDED to Provider values
        jwtToken, setJwtToken,
        userType, setUserType
      }}
    >
      {children}
    </AppIdContext.Provider>
  );
};

export const useAppId = () => useContext(AppIdContext);