import { useState } from "react";
import "./App.css";
import DatePicker, { formatDateForBackend } from "./components/DatePicker/DatePicker";
import Navbar from "./components/Navbar/Navbar";

function App() {
	const [date, setDate] = useState<Date>();
	console.log(date);
	console.log('formatted date', formatDateForBackend(date || new Date()));

    return (
        <>
            <Navbar />
			<div className="flex flex-col items-center justify-start pt-[20vh] brdr h-[100svh] dark:bg-zinc-950">

			<DatePicker format="dd/MM/yyyy" initialDate={date} onDateChange={setDate} />
			</div>
        </>
    );
}

export default App;
