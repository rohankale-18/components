import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import useMeasure from "react-use-measure";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/16/solid";
import { CalendarDaysIcon } from "@heroicons/react/20/solid";
import { formatDate } from "date-fns";

interface DatePickerProps {
    initialDate?: Date;
    onDateChange: (date: Date) => void;
    format?:
        | "dd-MM-yyyy"
        | "MM-dd-yyyy"
        | "yyyy-MM-dd"
        | "dd/MM/yyyy"
        | "MM/dd/yyyy"
        | "yyyy/MM/dd"
        | "dd-MM-yyyy HH:mm:ss"
        | "MM-dd-yyyy HH:mm:ss"
        | "yyyy-MM-dd HH:mm:ss"
        | "dd/MM/yyyy HH:mm:ss"
        | "MM/dd/yyyy HH:mm:ss"
        | "yyyy/MM/dd HH:mm:ss";
}

export const formatDateForBackend = (date: Date): string => {
    return date.toISOString().split("T")[0]; // Format as "YYYY-MM-DD"
};
const DatePicker: React.FC<DatePickerProps> = ({
    initialDate,
    onDateChange,
    format = "dd-MM-yyyy",
}) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const calendarRef = useRef<HTMLDivElement>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(
        initialDate || null // Start with null to allow placeholder visibility
    );
    const [currentMonth, setCurrentMonth] = useState(
        initialDate ? initialDate.getMonth() : new Date().getMonth()
    );
    const [currentYear, setCurrentYear] = useState(
        initialDate ? initialDate.getFullYear() : new Date().getFullYear()
    );
    const [showYearDropdown, setShowYearDropdown] = useState(false);
    const [showCalendar, setShowCalendar] = useState(false);
    const [position, setPosition] = useState<{
        bottom: boolean;
        right: boolean;
    }>({ bottom: false, right: false });
    const [directionTuple, setDirectionTuple] = useState([null, 1]);
    const [ref, bounds] = useMeasure();

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const startDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

    const handleDateClick = (day: number) => {
        const newDate = new Date(currentYear, currentMonth, day);
        setSelectedDate(newDate);
        onDateChange(newDate);
    };

    const handleMonthChange = (increment: number) => {
        if (directionTuple[1] !== increment) {
            setDirectionTuple([directionTuple[1], increment]);
        }
        let newMonth = currentMonth + increment;
        let newYear = currentYear;
        if (newMonth < 0) {
            newMonth = 11;
            newYear -= 1;
        } else if (newMonth > 11) {
            newMonth = 0;
            newYear += 1;
        }
        setCurrentMonth(newMonth);
        setCurrentYear(newYear);
    };

    const handleYearChange = (year: number) => {
        setCurrentYear(year);
        setShowYearDropdown(false);
    };

    const handleShowCalender = () => {
        setShowCalendar(!showCalendar);
    };

    const renderDays = () => {
        const days: JSX.Element[] = [];
        for (let i = 0; i < startDayOfWeek; i++) {
            days.push(<div key={`empty-${i}`} className="w-10 h-10"></div>);
        }
        for (let day = 1; day <= daysInMonth; day++) {
            let currentDate = selectedDate || new Date();
            const isSelected =
                currentDate.getDate() === day &&
                currentDate.getMonth() === currentMonth &&
                currentDate.getFullYear() === currentYear;

            days.push(
                <button
                    key={day}
                    className={`day-button w-10 h-10 rounded-full flex items-center justify-center ${
                        isSelected
                            ? "bg-blue-500 text-white"
                            : "hover:bg-gray-200 focus:bg-gray-200 dark:focus:bg-slate-800 dark:hover:bg-slate-800"
                    }`}
                    onClick={() => handleDateClick(day)}
                    aria-label={`Select ${
                        currentMonth + 1
                    }/${day}/${currentYear}`}
                    tabIndex={0} // Ensure buttons are focusable
                >
                    {day}
                </button>
            );
        }
        return days;
    };

    const renderYearDropdown = () => {
        const years: number[] = [];
        for (let year = 1900; year <= new Date().getFullYear(); year++) {
            years.push(year);
        }

        const handleKeyDown = (
            e: React.KeyboardEvent<HTMLButtonElement>,
            index: number
        ) => {
            if (e.key == "Enter" || e.key == " ") return;
            e.preventDefault();
            let newIndex = index;

            switch (e.key) {
                case "ArrowUp":
                    newIndex = index - 4; // Move up one row (4 columns)
                    break;
                case "ArrowDown":
                    newIndex = index + 4; // Move down one row (4 columns)
                    break;
                case "ArrowLeft":
                    newIndex = index - 1; // Move left one column
                    break;
                case "ArrowRight":
                    newIndex = index + 1; // Move right one column
                    break;
                default:
                    return;
            }

            // Ensure the new index is within bounds
            if (newIndex >= 0 && newIndex < years.length) {
                const buttons =
                    document.querySelectorAll<HTMLButtonElement>(
                        ".year-button"
                    );
                buttons[newIndex]?.focus();
            }
        };

        return (
            <div className="absolute inset-0 h-full grid grid-cols-4 gap-x-1 gap-y-2 bg-white dark:bg-slate-900 border shadow-lg p-4 overflow-y-auto z-10 rounded">
                {years.reverse().map((year, index) => (
                    <button
                        key={year}
                        className={`year-button block w-full text-center px-2 py-1 hover:bg-gray-200 dark:hover:bg-slate-800 rounded ${
                            year === currentYear
                                ? "bg-gray-300 dark:bg-slate-700"
                                : ""
                        }`}
                        onClick={() => handleYearChange(year)}
                        aria-label={`Select year ${year}`}
                        tabIndex={0}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                    >
                        {year}
                    </button>
                ))}
            </div>
        );
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        if (calendarRef.current === null) return;
        if (showCalendar) {
            if (e.key === "Escape") {
                // Close the calendar on Escape key
                setShowCalendar(false);
            } else if (e.key === "Tab") {
                // Trap focus within the calendar
                const focusableElements = Array.from(
                    calendarRef.current.querySelectorAll(
                        "button, input, [tabindex]:not([tabindex='-1'])"
                    )
                ) as HTMLElement[];
                const firstElement = focusableElements[0];
                const lastElement =
                    focusableElements[focusableElements.length - 1];

                if (e.shiftKey && document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                } else if (
                    !e.shiftKey &&
                    document.activeElement === lastElement
                ) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        }
    };

    useEffect(() => {
        // Add event listeners for keydown when calendar is open
        if (showCalendar) {
            document.addEventListener("keydown", handleKeyDown);
        } else {
            document.removeEventListener("keydown", handleKeyDown);
        }

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [showCalendar]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLElement) {
                const focusedElement = document.activeElement as HTMLElement;
                const dayButtons = Array.from(
                    document.querySelectorAll(".day-button")
                ) as HTMLElement[];
                const currentIndex = dayButtons.indexOf(focusedElement);

                if (currentIndex !== -1) {
                    const currentCol = currentIndex % 7; // Determine the current column

                    switch (e.key) {
                        case "ArrowLeft": {
                            // Navigate left (previous day)
                            if (currentIndex > 0) {
                                dayButtons[currentIndex - 1].focus();
                            }
                            // Prevent month change when on the first date
                            break;
                        }
                        case "ArrowRight": {
                            // Navigate right (next day)
                            if (currentIndex < dayButtons.length - 1) {
                                dayButtons[currentIndex + 1].focus();
                            }
                            // Prevent month change when on the last date
                            break;
                        }
                        case "ArrowUp": {
                            e.preventDefault();
                            // Navigate up within the same column
                            let previousIndex = currentIndex - 7;

                            if (previousIndex < 0) {
                                // Wrap to the last row in the same column
                                const lastRowIndex =
                                    dayButtons.length -
                                    1 -
                                    (dayButtons.length % 7) +
                                    currentCol;
                                if (lastRowIndex < dayButtons.length) {
                                    dayButtons[lastRowIndex + 1].focus();
                                }
                            } else {
                                dayButtons[previousIndex].focus();
                            }
                            break;
                        }
                        case "ArrowDown": {
                            e.preventDefault();
                            // Navigate down within the same column
                            let nextIndex = currentIndex + 7;

                            if (nextIndex >= dayButtons.length) {
                                // Wrap to the first row in the same column
                                const firstRowIndex = currentCol;
                                if (firstRowIndex < dayButtons.length) {
                                    dayButtons[firstRowIndex].focus();
                                }
                            } else {
                                dayButtons[nextIndex].focus();
                            }
                            break;
                        }
                    }
                }
            }
        };

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [currentMonth, currentYear]); // Ensure that month and year change when key event occurs

    useEffect(() => {
        setShowCalendar(false);
    }, [selectedDate]);

    useEffect(() => {
        if (inputRef.current && calendarRef.current) {
            const inputRect = inputRef.current.getBoundingClientRect();
            const calendarRect = calendarRef.current.getBoundingClientRect();
            let bottom = false;
            let right = false;
            // Check for bottom overflow
            const spaceBelow = window.innerHeight - inputRect.bottom;
            if (spaceBelow < 300) {
                bottom = true;
            }

            // Check for right overflow
            const spaceRight = window.innerWidth - inputRect.right;
            if (calendarRect.width > spaceRight) {
                right = true;
            }
            setPosition({ bottom, right });
        }
    }, [showCalendar]);

    const handleClickOutside = (event: MouseEvent) => {
        // If the click is outside the input or the calendar, close the calendar
        if (
            calendarRef.current &&
            !calendarRef.current.contains(event.target as Node) &&
            inputRef.current &&
            !inputRef.current.contains(event.target as Node)
        ) {
            setShowCalendar(false);
            setShowYearDropdown(false);
        }
    };

    useEffect(() => {
        // Add event listener for clicks outside
        document.addEventListener("mousedown", handleClickOutside);

        // Clean up event listener on component unmount
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);
    return (
        <div className="flex flex-col sm:relative">
            <div className="relative">
                {/* Input to display the selected date */}
                <input
                    ref={inputRef}
                    type="text"
                    readOnly
                    className="border dark:border-0 rounded-md p-2 w-64 cursor-pointer dark:bg-gray-900 dark:text-white ring-offset-4 dark:ring-white"
                    placeholder={`${format}`}
                    value={selectedDate ? formatDate(selectedDate, format) : ""}
                    onFocus={handleShowCalender} // Toggle calendar visibility
                    onClick={() => setShowCalendar(true)}
                    aria-label="Selected date"
                />
                <div className="absolute top-1/2 right-2 transform -translate-y-1/2 pointer-events-none">
                    <CalendarDaysIcon className="size-6 pointer-events-none dark:text-white" />
                </div>
            </div>
            {showCalendar && (
                <div className="fixed inset-0 bg-black/50 z-[9] sm:hidden" />
            )}
            <AnimatePresence>
                {/* Custom calendar */}
                {showCalendar && (
                    <motion.div
                        ref={calendarRef}
                        className={`fixed [@media(max-width:640px)]:inset-0 [@media(max-width:640px)]:top-1/4 sm:absolute mx-auto sm:mx-0 my-1 w-fit border rounded-md bg-white dark:bg-gray-900 dark:text-white shadow-lg z-10 flex flex-col justify-center overflow-hidden max-h-fit max-w-[100svw]
							${position.right ? "sm:right-0" : "sm:left-0"}
							${position.bottom ? "sm:bottom-full" : "sm:top-full"}
							`}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center p-4 bg-zinc-100 dark:bg-gray-950">
                            <button
                                onClick={() => handleMonthChange(-1)}
                                aria-label="Previous month"
                                className="aspect-square w-8 flex items-center justify-center bg-slate-200 dark:bg-slate-900 hover:bg-slate-300 hover:dark:bg-blue-950 active:bg-slate-200 active:dark:bg-slate-900 transition-colors duration-200 ease-in-out rounded-full"
                            >
                                <ChevronLeftIcon className="p-1 w-full h-full font-normal" />
                            </button>
                            <div className="text-lg font-semibold flex items-center">
                                <span>
                                    {new Date(
                                        currentYear,
                                        currentMonth
                                    ).toLocaleString("default", {
                                        month: "long",
                                    })}
                                </span>
                                <button
                                    onClick={() =>
                                        setShowYearDropdown(!showYearDropdown)
                                    }
                                    className="ml-2"
                                    aria-label={`Current year: ${currentYear}`}
                                >
                                    {currentYear}
                                </button>
                            </div>
                            {/* Year Dropdown */}
                            {showYearDropdown && renderYearDropdown()}
                            <button
                                onClick={() => handleMonthChange(1)}
                                aria-label="Next month"
                                className="aspect-square w-8 flex items-center justify-center bg-slate-200 dark:bg-slate-900 hover:bg-slate-300 hover:dark:bg-blue-950 active:bg-slate-200 active:dark:bg-slate-900 transition-colors duration-200 ease-in-out rounded-full"
                            >
                                <ChevronRightIcon className="p-1 w-full h-full font-normal" />
                            </button>
                        </div>

                        {/* Days */}
                        <div className="relative w-80 p-4">
                            <div
                                className="relative"
                                style={{ height: bounds.height }}
                            >
                                <AnimatePresence custom={directionTuple[1]}>
                                    <motion.div
                                        ref={ref}
                                        key={currentMonth} // Use currentMonth to trigger animation
                                        className="grid grid-cols-7 gap-2 p-1 absolute h-fit"
                                        variants={variants}
                                        initial="enter"
                                        animate="center"
                                        exit="exit"
                                        custom={directionTuple[1]}
                                        transition={{
                                            type: "spring",
                                            stiffness: 100,
                                            mass: 0.5,
                                            damping: 10,
                                        }}
                                    >
                                        {[
                                            "Sun",
                                            "Mon",
                                            "Tue",
                                            "Wed",
                                            "Thu",
                                            "Fri",
                                            "Sat",
                                        ].map((day) => (
                                            <div
                                                key={day}
                                                className="text-center font-semibold"
                                            >
                                                {day}
                                            </div>
                                        ))}
                                        {renderDays()}
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DatePicker;

let variants = {
    enter: (direction: number) => ({
        x: direction > 0 ? "100%" : "-100%",
        opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({
        x: direction > 0 ? "-100%" : "100%",
        opacity: 0,
    }),
};
