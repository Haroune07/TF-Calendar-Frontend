import { createContext, useContext, useState } from "react";

type UserDTO = {
  id: number;
  email: string;
  nomComplet: string;
  omnivoxDA?: string;
  calendrierId?: number;
};

type AuthContextType = {
  user: UserDTO | null;
  login: (userData: UserDTO) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<UserDTO | null>(null);
  const login = (userData: UserDTO) => setUser(userData);
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};
