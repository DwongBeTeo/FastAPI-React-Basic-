// src/hooks/useCountdown.js
import { useState, useEffect } from 'react';

const useCountdown = (storageKey) => {
    const [timeLeft, setTimeLeft] = useState(0);
    const [isLocked, setIsLocked] = useState(false);

    // Hàm bắt đầu đếm ngược
    const startCountdown = (seconds) => {
        const unlockTime = Date.now() + seconds * 1000;
        localStorage.setItem(storageKey, unlockTime.toString());
        setTimeLeft(seconds);
        setIsLocked(true);
    };

    // Hàm format thời gian hiển thị (ví dụ: 04:59)
    const formattedTime = () => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        // Kiểm tra xem trong localStorage có đang bị khóa không khi load lại trang
        const storedUnlockTime = localStorage.getItem(storageKey);
        if (storedUnlockTime) {
            const unlockTimeMs = parseInt(storedUnlockTime, 10);
            const remainingMs = unlockTimeMs - Date.now();

            if (remainingMs > 0) {
                setTimeLeft(Math.ceil(remainingMs / 1000));
                setIsLocked(true);
            } else {
                localStorage.removeItem(storageKey);
                setIsLocked(false);
            }
        }
    }, [storageKey]);

    useEffect(() => {
        let timer;
        if (isLocked && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        localStorage.removeItem(storageKey);
                        setIsLocked(false);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (timer) clearInterval(timer);
        };
    }, [isLocked, timeLeft, storageKey]);

    return { isLocked, timeLeft, formattedTime, startCountdown };
};

export default useCountdown;