import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const BranchContext = createContext();

export const useBranch = () => useContext(BranchContext);

export function BranchProvider({ children }) {
  const { partner } = useAuth();
  const [selectedBranch, setSelectedBranch] = useState(null);

  useEffect(() => {
    if (partner?.branches?.length > 0 && !selectedBranch) {
      setSelectedBranch(partner.branches[0]);
    }
  }, [partner]);

  return (
    <BranchContext.Provider value={{ selectedBranch, setSelectedBranch, branches: partner?.branches || [] }}>
      {children}
    </BranchContext.Provider>
  );
}
