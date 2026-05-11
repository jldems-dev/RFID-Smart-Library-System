/* "use client";

import { useState, useEffect } from "react";
import KioskWelcome from "@/components/kiosk/welcome-screen";
import KioskStudentId from "@/components/kiosk/student-id-screen";
import KioskScan from "@/components/kiosk/scan-screen";
import KioskConfirmation from "@/components/kiosk/confirmation-screen";
import BookSearchScreen from "@/components/kiosk/book-search-screen";
import BorrowScreen from "@/components/kiosk/borrow-screen";
import ReturnScreen from "@/components/kiosk/return-screen";

type KioskScreen =
  | "welcome"
  | "student-id"
  | "scan"
  | "confirmation"
  | "search"
  | "borrow"
  | "return";

// Student data interface
interface StudentData {
  id: string;
  name: string;
  maxBooks: number;
  currentBorrows: number;
}

interface KioskState {
  screen: KioskScreen;
  student: StudentData | null;
  action: "borrow" | "return" | "search" | null;
  scannedBooks: string[];
  confirmationType: "success" | "error";
  confirmationMessage: string;
}

export default function KioskPage() {
  const [state, setState] = useState<KioskState>({
    screen: "welcome",
    student: null,
    action: null,
    scannedBooks: [],
    confirmationType: "success",
    confirmationMessage: "",
  });

  // Auto-reset on confirmation
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (state.screen === "confirmation") {
      timer = setTimeout(() => {
        resetToWelcome();
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [state.screen]);

  // Inactivity timeout - reset to welcome screen after 2 minutes
  useEffect(() => {
    let inactivityTimer: NodeJS.Timeout;

    const resetInactivityTimer = () => {
      clearTimeout(inactivityTimer);
      if (state.screen !== "welcome" && state.screen !== "confirmation") {
        inactivityTimer = setTimeout(() => {
          console.log(
            "[v0] Inactivity timeout triggered, returning to welcome screen",
          );
          resetToWelcome();
        }, 120000); // 2 minutes
      }
    };

    const handleActivity = () => {
      resetInactivityTimer();
    };

    resetInactivityTimer();

    window.addEventListener("touchstart", handleActivity);
    window.addEventListener("click", handleActivity);
    window.addEventListener("keypress", handleActivity);

    return () => {
      clearTimeout(inactivityTimer);
      window.removeEventListener("touchstart", handleActivity);
      window.removeEventListener("click", handleActivity);
      window.removeEventListener("keypress", handleActivity);
    };
  }, [state.screen]);

  const resetToWelcome = () => {
    setState({
      screen: "welcome",
      student: null,
      action: null,
      scannedBooks: [],
      confirmationType: "success",
      confirmationMessage: "",
    });
  };

  // Updated to receive full student data
  const handleStudentScanned = (studentData: StudentData) => {
    setState((prev) => ({
      ...prev,
      student: studentData,
      screen: "student-id",
    }));
  };

  const handleActionSelected = (action: "borrow" | "return" | "search") => {
    if (action === "search") {
      setState((prev) => ({
        ...prev,
        screen: "search",
      }));
    } else if (action === "borrow") {
      setState((prev) => ({
        ...prev,
        screen: "borrow",
        action: "borrow",
        scannedBooks: [],
      }));
    } else if (action === "return") {
      setState((prev) => ({
        ...prev,
        screen: "return",
        action: "return",
        scannedBooks: [],
      }));
    }
  };

  const handleBookScanned = (bookId: string) => {
    setState((prev) => ({
      ...prev,
      scannedBooks: [...prev.scannedBooks, bookId],
    }));
  };

  const handleComplete = (success: boolean, message: string) => {
    setState((prev) => ({
      ...prev,
      screen: "confirmation",
      confirmationType: success ? "success" : "error",
      confirmationMessage: message,
    }));
  };

  const handleBackFromSearch = () => {
    setState((prev) => ({
      ...prev,
      screen: "student-id",
    }));
  };

  const handleBorrowComplete = (
    success: boolean,
    message: string,
    scannedBooks: string[],
  ) => {
    setState((prev) => ({
      ...prev,
      screen: "confirmation",
      confirmationType: success ? "success" : "error",
      confirmationMessage: message,
      scannedBooks,
    }));
  };

  const handleReturnComplete = (
    success: boolean,
    message: string,
    scannedBooks: string[],
  ) => {
    setState((prev) => ({
      ...prev,
      screen: "confirmation",
      confirmationType: success ? "success" : "error",
      confirmationMessage: message,
      scannedBooks,
    }));
  };

  const handleBackFromBorrow = () => {
    setState((prev) => ({
      ...prev,
      screen: "student-id",
      scannedBooks: [],
    }));
  };

  const handleBackFromReturn = () => {
    setState((prev) => ({
      ...prev,
      screen: "student-id",
      scannedBooks: [],
    }));
  };

  const renderScreen = () => {
    switch (state.screen) {
      case "welcome":
        return <KioskWelcome onCardScanned={handleStudentScanned} />;
      case "student-id":
        return (
          <KioskStudentId
            student={state.student!}
            onContinue={handleActionSelected}
          />
        );
      case "borrow":
        return (
          <BorrowScreen
            student={state.student!}
            onBack={handleBackFromBorrow}
            onComplete={handleBorrowComplete}
          />
        );
      case "return":
        return (
          <ReturnScreen
            student={state.student!}
            onBack={handleBackFromReturn}
            onComplete={handleReturnComplete}
          />
        );
      case "search":
        return <BookSearchScreen onBack={handleBackFromSearch} />;
      case "scan":
        return (
          <KioskScan
            action={state.action as "borrow" | "return" | null}
            scannedBooks={state.scannedBooks}
            onBookScanned={handleBookScanned}
            onComplete={handleComplete}
          />
        );
      case "confirmation":
        return (
          <KioskConfirmation
            success={state.confirmationType === "success"}
            message={state.confirmationMessage}
            bookCount={state.scannedBooks.length}
          />
        );
      default:
        return <KioskWelcome onCardScanned={handleStudentScanned} />;
    }
  };

  return (
    <div className="w-screen h-screen bg-secondary overflow-hidden">
      {renderScreen()}
    </div>
  );
}
 */

"use client";

import { useState, useEffect } from "react";
import KioskWelcome from "@/components/kiosk/welcome-screen";
import KioskStudentId from "@/components/kiosk/student-id-screen";
import KioskScan from "@/components/kiosk/scan-screen";
import KioskConfirmation from "@/components/kiosk/confirmation-screen";
import BookSearchScreen from "@/components/kiosk/book-search-screen";
import BorrowScreen from "@/components/kiosk/borrow-screen";
import ReturnScreen from "@/components/kiosk/return-screen";

type KioskScreen =
  | "welcome"
  | "student-id"
  | "scan"
  | "confirmation"
  | "search"
  | "borrow"
  | "return";

// Student data interface
interface StudentData {
  id: string;
  name: string;
  maxBooks: number;
  currentBorrows: number;
}

interface KioskState {
  screen: KioskScreen;
  student: StudentData | null;
  action: "borrow" | "return" | "search" | null;
  scannedBooks: string[];
  confirmationType: "success" | "error";
  confirmationMessage: string;
}

export default function KioskPage() {
  const [state, setState] = useState<KioskState>({
    screen: "welcome",
    student: null,
    action: null,
    scannedBooks: [],
    confirmationType: "success",
    confirmationMessage: "",
  });

  // Kiosk mode lockdown - prevent all browser interactions
  useEffect(() => {
    // Request fullscreen
    const enterFullscreen = async () => {
      try {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
          await elem.requestFullscreen();
        }
        // @ts-ignore
        if (window.navigator.keyboard?.lock) {
          // @ts-ignore
          await window.navigator.keyboard.lock(["Escape", "F11"]);
        }
      } catch (e) {
        // Ignore fullscreen errors
      }
    };

    // Block context menu (right-click)
    const blockContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // Block all keyboard shortcuts except what's needed for RFID input
    const blockKeys = (e: KeyboardEvent) => {
      // Allow normal typing in inputs
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === "INPUT" || target.tagName === "TEXTAREA";

      // Block browser shortcuts
      if (e.ctrlKey || e.metaKey || e.altKey) {
        const blocked = [
          "r",
          "R",
          "t",
          "T",
          "n",
          "N",
          "w",
          "W",
          "l",
          "L",
          "j",
          "J",
        ];
        if (blocked.includes(e.key) || e.key === "F5" || e.key === "F12") {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      }

      // Block function keys (except F1-F4 for potential accessibility)
      if (["F5", "F6", "F7", "F8", "F9", "F10", "F11", "F12"].includes(e.key)) {
        e.preventDefault();
      }

      // Block Escape unless in input
      if (e.key === "Escape" && !isInput) {
        e.preventDefault();
      }

      // Block Alt+Tab detection (as much as possible)
      if (e.altKey && e.key === "Tab") {
        e.preventDefault();
      }
    };

    // Block zoom gestures
    /* const blockZoom = (e: Event) => {
      // @ts-ignore
      if (e.scale && e.scale !== 1) {
        e.preventDefault();
      }
    }; */

    // Block wheel zoom
    /*  const blockWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
      }
    }; */

    // Prevent leaving page
    const blockBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };

    // Keep window focused
    const keepFocus = () => {
      window.focus();
    };

    // Apply all blockers
    document.addEventListener("contextmenu", blockContextMenu, true);
    document.addEventListener("keydown", blockKeys, true);
    /*  document.addEventListener("gesturestart", blockZoom, true);
    document.addEventListener("gesturechange", blockZoom, true);
    document.addEventListener("gestureend", blockZoom, true); */
    /*  document.addEventListener("wheel", blockWheel, {
      passive: false,
      capture: true,
    }); */
    window.addEventListener("beforeunload", blockBeforeUnload);
    window.addEventListener("blur", keepFocus);

    // Enter fullscreen on first interaction
    const handleFirstInteraction = () => {
      enterFullscreen();
      document.removeEventListener("click", handleFirstInteraction);
      document.removeEventListener("touchstart", handleFirstInteraction);
    };

    document.addEventListener("click", handleFirstInteraction);
    document.addEventListener("touchstart", handleFirstInteraction);

    // Keep fullscreen
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        enterFullscreen();
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    // Cleanup
    return () => {
      document.removeEventListener("contextmenu", blockContextMenu, true);
      document.removeEventListener("keydown", blockKeys, true);
      /*  document.removeEventListener("gesturestart", blockZoom, true);
      document.removeEventListener("gesturechange", blockZoom, true);
      document.removeEventListener("gestureend", blockZoom, true); */
      // document.removeEventListener("wheel", blockWheel, true);
      window.removeEventListener("beforeunload", blockBeforeUnload);
      window.removeEventListener("blur", keepFocus);
      document.removeEventListener("click", handleFirstInteraction);
      document.removeEventListener("touchstart", handleFirstInteraction);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Auto-reset on confirmation
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (state.screen === "confirmation") {
      timer = setTimeout(() => {
        resetToWelcome();
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [state.screen]);

  // Inactivity timeout - reset to welcome screen after 2 minutes
  useEffect(() => {
    let inactivityTimer: NodeJS.Timeout;

    const resetInactivityTimer = () => {
      clearTimeout(inactivityTimer);
      if (state.screen !== "welcome" && state.screen !== "confirmation") {
        inactivityTimer = setTimeout(() => {
          console.log(
            "[v0] Inactivity timeout triggered, returning to welcome screen",
          );
          resetToWelcome();
        }, 120000); // 2 minutes
      }
    };

    const handleActivity = () => {
      resetInactivityTimer();
    };

    resetInactivityTimer();

    window.addEventListener("touchstart", handleActivity);
    window.addEventListener("click", handleActivity);
    window.addEventListener("keypress", handleActivity);

    return () => {
      clearTimeout(inactivityTimer);
      window.removeEventListener("touchstart", handleActivity);
      window.removeEventListener("click", handleActivity);
      window.removeEventListener("keypress", handleActivity);
    };
  }, [state.screen]);

  const resetToWelcome = () => {
    setState({
      screen: "welcome",
      student: null,
      action: null,
      scannedBooks: [],
      confirmationType: "success",
      confirmationMessage: "",
    });
  };

  // Updated to receive full student data
  const handleStudentScanned = (studentData: StudentData) => {
    setState((prev) => ({
      ...prev,
      student: studentData,
      screen: "student-id",
    }));
  };

  const handleActionSelected = (action: "borrow" | "return" | "search") => {
    if (action === "search") {
      setState((prev) => ({
        ...prev,
        screen: "search",
      }));
    } else if (action === "borrow") {
      setState((prev) => ({
        ...prev,
        screen: "borrow",
        action: "borrow",
        scannedBooks: [],
      }));
    } else if (action === "return") {
      setState((prev) => ({
        ...prev,
        screen: "return",
        action: "return",
        scannedBooks: [],
      }));
    }
  };

  const handleBookScanned = (bookId: string) => {
    setState((prev) => ({
      ...prev,
      scannedBooks: [...prev.scannedBooks, bookId],
    }));
  };

  const handleComplete = (success: boolean, message: string) => {
    setState((prev) => ({
      ...prev,
      screen: "confirmation",
      confirmationType: success ? "success" : "error",
      confirmationMessage: message,
    }));
  };

  const handleBackFromSearch = () => {
    setState((prev) => ({
      ...prev,
      screen: "student-id",
    }));
  };

  const handleBorrowComplete = (
    success: boolean,
    message: string,
    scannedBooks: string[],
  ) => {
    setState((prev) => ({
      ...prev,
      screen: "confirmation",
      confirmationType: success ? "success" : "error",
      confirmationMessage: message,
      scannedBooks,
    }));
  };

  const handleReturnComplete = (
    success: boolean,
    message: string,
    scannedBooks: string[],
  ) => {
    setState((prev) => ({
      ...prev,
      screen: "confirmation",
      confirmationType: success ? "success" : "error",
      confirmationMessage: message,
      scannedBooks,
    }));
  };

  const handleBackFromBorrow = () => {
    setState((prev) => ({
      ...prev,
      screen: "student-id",
      scannedBooks: [],
    }));
  };

  const handleBackFromReturn = () => {
    setState((prev) => ({
      ...prev,
      screen: "student-id",
      scannedBooks: [],
    }));
  };

  const renderScreen = () => {
    switch (state.screen) {
      case "welcome":
        return <KioskWelcome onCardScanned={handleStudentScanned} />;
      case "student-id":
        return (
          <KioskStudentId
            student={state.student!}
            onContinue={handleActionSelected}
          />
        );
      case "borrow":
        return (
          <BorrowScreen
            student={state.student!}
            onBack={handleBackFromBorrow}
            onComplete={handleBorrowComplete}
          />
        );
      case "return":
        return (
          <ReturnScreen
            student={state.student!}
            onBack={handleBackFromReturn}
            onComplete={handleReturnComplete}
          />
        );
      case "search":
        return <BookSearchScreen onBack={handleBackFromSearch} />;
      case "scan":
        return (
          <KioskScan
            action={state.action as "borrow" | "return" | null}
            scannedBooks={state.scannedBooks}
            onBookScanned={handleBookScanned}
            onComplete={handleComplete}
          />
        );
      case "confirmation":
        return (
          <KioskConfirmation
            success={state.confirmationType === "success"}
            message={state.confirmationMessage}
            bookCount={state.scannedBooks.length}
          />
        );
      default:
        return <KioskWelcome onCardScanned={handleStudentScanned} />;
    }
  };

  return (
    <div className="w-screen h-screen bg-secondary overflow-hidden select-none touch-none">
      {renderScreen()}
    </div>
  );
}
