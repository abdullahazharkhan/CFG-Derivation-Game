import { useEffect, useState } from "react";

const Timer = ({ setTimerState }: any) => {
    const [secondsLeft, setSecondsLeft] = useState(180);
    const [isLessThanFifteen, setIsLessThanFifteen] = useState(false);

    useEffect(() => {
        if (secondsLeft <= 15) {
            setIsLessThanFifteen(true);
        }

        if (secondsLeft <= 0) {
            setTimerState(false);
            return;
        }

        const interval = setInterval(() => {
            setSecondsLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [secondsLeft, setTimerState]);

    const formatTime = (secs: any) => {
        const mins = String(Math.floor(secs / 60)).padStart(2, '0');
        const secsRem = String(secs % 60).padStart(2, '0');
        return `${mins}:${secsRem}`;
    };

    return (
        <div className="flex flex-col justify-center">
            <p className="font-semibold text-md">You got</p>
            <h2 className={`font-extrabold text-5xl ${isLessThanFifteen ? "text-red-500/60" : "text-dCyan "}`}>{formatTime(secondsLeft)}</h2>
        </div>
    );
};

export default Timer;
