const sqlTimeCases = [
    {
        desc: "Return true if time is valid",
        input: "00:00:00",
        expected: true,
    },
    {
        desc: "Return true if time is valid",
        input: "23:59:59",
        expected: true,
    },
    {
        desc: "Return true if time is valid",
        input: "12:34:56",
        expected: true,
    },
    {
        desc: "Return false if time format is invalid",
        input: "0:0:0",
        expected: false,
    },
    {
        desc: "Return false if time format is invalid",
        input: "12:34",
        expected: false,
    },
    {
        desc: "Return false if minutes is more than 59",
        input: "12:60:00",
        expected: false,
    },
    {
        desc: "Return false if seconds is more than 59",
        input: "12:00:60",
        expected: false,
    },
    {
        desc: "Return false if date is empty",
        input: "",
        expected: false,
    },
    {
        desc: "Return false if date is null",
        input: null,
        expected: false,
    },
];
export default sqlTimeCases;
