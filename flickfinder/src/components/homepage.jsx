import { useState, useEffect } from "react";
import PopularContent from './popularContent';

export default function HomePage() {
    const [showTrending, setShowTrending] = useState(false);
    const [showPopular, setShowPopular] = useState(false);
    const [showTopRated, setShowTopRated] = useState(false);

    useEffect(() => {
        const timer1 = setTimeout(() => setShowTrending(true), 0);
        const timer2 = setTimeout(() => setShowPopular(true), 250);
        const timer3 = setTimeout(() => setShowTopRated(true), 500);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);
        };
    }, []);

    return (
        <>
            {showTrending && <PopularContent type="trending" />}
            {showPopular && <PopularContent type="popular" />}
            {showTopRated && <PopularContent type="top-rated" />}
        </>
    );
}
