import { deleteSetting, setSetting } from "@/db/settings";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type OnboardingValue = {
  done: boolean;
  finish: (focusAreas: string[]) => Promise<void>;
  replay: () => Promise<void>;
};

const OnboardingContext = createContext<OnboardingValue | null>(null);

export function OnboardingProvider({
  initialDone,
  children,
}: {
  initialDone: boolean;
  children: ReactNode;
}) {
  const [done, setDone] = useState(initialDone);

  const finish = useCallback(async (focusAreas: string[]) => {
    try {
      await setSetting("focus_areas", JSON.stringify(focusAreas));
      await setSetting("onboarding_done", "1");
    } catch (e) {
      console.error("Failed to save onboarding state", e);
    }
    setDone(true); // never leave the user stuck in onboarding
  }, []);

  const replay = useCallback(async () => {
    try {
      await deleteSetting("onboarding_done");
    } catch (e) {
      console.error("Failed to reset onboarding", e);
    }
    setDone(false);
  }, []);

  const value = useMemo(
    () => ({ done, finish, replay }),
    [done, finish, replay],
  );

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx)
    throw new Error("useOnboarding must be used inside OnboardingProvider");
  return ctx;
}
