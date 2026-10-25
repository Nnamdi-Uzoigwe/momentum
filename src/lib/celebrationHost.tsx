import { CelebrationOverlay } from "@/components/CelebrationOverlay";
import { Toast } from "@/components/Toast";
import type { CelebrationData, ToastInput } from "@/lib/celebrations";
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from "react";

type Value = {
  showToast: (toast: ToastInput) => void;
  showCelebration: (data: CelebrationData) => void;
};

const CelebrationContext = createContext<Value | null>(null);

export function CelebrationProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<(ToastInput & { id: number }) | null>(
    null,
  );
  const [celebration, setCelebration] = useState<CelebrationData | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nextId = useRef(1);

  const showToast = useCallback((input: ToastInput) => {
    if (timer.current) clearTimeout(timer.current);
    setToast({ ...input, id: nextId.current++ });
    timer.current = setTimeout(() => setToast(null), 2800);
  }, []);

  const showCelebration = useCallback((data: CelebrationData) => {
    setToast(null);
    setCelebration(data);
  }, []);

  const closeCelebration = useCallback(() => setCelebration(null), []);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const value = useMemo(
    () => ({ showToast, showCelebration }),
    [showToast, showCelebration],
  );

  return (
    <CelebrationContext.Provider value={value}>
      {children}
      {toast ? (
        <Toast
          key={toast.id}
          message={toast.message}
          icon={toast.icon}
          big={toast.big}
        />
      ) : null}
      {celebration ? (
        <CelebrationOverlay data={celebration} onClose={closeCelebration} />
      ) : null}
    </CelebrationContext.Provider>
  );
}

export function useCelebration() {
  const ctx = useContext(CelebrationContext);
  if (!ctx) {
    throw new Error("useCelebration must be used inside CelebrationProvider");
  }
  return ctx;
}
