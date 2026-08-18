import { useEffect, useState } from "react";
import { IGMapsApiStatus } from "./types";

export const useScript = (src: string) => {
    const [status, setStatus] = useState<IGMapsApiStatus>(src ? { status: "loading" } : { status: "idle" });
    useEffect(() => {
        if (!src) {
            setStatus({ status: "loading" });
            return;
        }

        let script: HTMLScriptElement | null = document.querySelector(`script[src="${src}"]`);
        if (!script) {
            const newScript = document.createElement("script");
            newScript.src = src;
            newScript.async = true;
            newScript.setAttribute("data-status", "loading");
            document.body.appendChild(newScript);

            const setAttributeFromEvent = (event: Event) => {
                newScript.setAttribute(
                    "data-status",
                    event.type === "load" ? "ready" : "error"
                );
            };
            newScript.addEventListener("load", setAttributeFromEvent);
            newScript.addEventListener("error", setAttributeFromEvent);
            script = newScript;
        } else {
            // this should fix reload issue by setting it as an object rather than a string hopefully
            const attr = script.getAttribute("data-status");
            if (attr === "ready") setStatus({ status: "ready" });
            else if (attr === "error") setStatus({ status: "error" });
            else setStatus({ status: "loading" });
        }

        const setStateFromEvent = (event: Event) => {
            setStatus(event.type === "load" ? { status: "ready" } : { status: "error" });
        };

        script.addEventListener("load", setStateFromEvent);
        script.addEventListener("error", setStateFromEvent);

        return () => {
            if (script) {
                script.removeEventListener("load", setStateFromEvent);
                script.removeEventListener("error", setStateFromEvent);
            }
        };
    }, [src]);
    return status;
};