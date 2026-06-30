import { useEffect, useState } from "react";
import { ProfileDiagnostic, emptyDiagnostic } from "@/types/profileDiagnostic";

const STORAGE_KEY = "consultorio-diagnostico-perfil";

export function useProfileDiagnostic() {
  const [diagnostic, setDiagnostic] = useState<ProfileDiagnostic>(emptyDiagnostic());

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setDiagnostic({ ...emptyDiagnostic(), ...JSON.parse(raw) });
    } catch {
      // ignora dado corrompido
    }
  }, []);

  const save = (next: ProfileDiagnostic) => {
    const withTimestamp = { ...next, updatedAt: new Date().toISOString() };
    setDiagnostic(withTimestamp);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(withTimestamp));
  };

  return { diagnostic, setDiagnostic, save };
}
