const convert = {
    toMinutes: (time) => {
        if (time === null)
            return 0;
        const [h, m] = time.split(":").map(Number);
        return h * 60 + m;
    },
    toTimeString: (minutes) => {
        const h = Math.floor(minutes / 60).toString().padStart(2, "0");
        const m = (minutes % 60).toString().padStart(2, "0");
        return `${h}:${m}:00`;
    }
};
export default convert;
