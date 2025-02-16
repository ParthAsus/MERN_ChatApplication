import { useEffect } from "react"

const useOutsideAndEscapeHandlerHook = (refName, statename, setStateName) => {
  useEffect(() => {
    if(!statename) return;
    const handleOutsideClick = (event) => {
      if(refName.current && !refName.current.contains(event.target)) {
        setTimeout(() => {
          setStateName(false);
        }, 100)
      }
    };

    const handleEscapeClick = (event) => {
      if(refName.current && event.key === 'Escape'){
        setStateName(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keypress", handleEscapeClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keypress", handleEscapeClick);
    }
  }, [statename])
}

export default useOutsideAndEscapeHandlerHook;
