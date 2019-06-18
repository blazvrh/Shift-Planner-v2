
var data = { };

window.addEventListener('load', () => {
    if (imePoslovalnice !== "") {
        let currDate = new Date;

        let dayOfWeek = currDate.getDay();
        if (dayOfWeek == 0) dayOfWeek = 7;

        let currMondayDate = new Date(currDate);
        currMondayDate.setDate(currMondayDate.getDate() - dayOfWeek + 1);
        let nextMondayDate = new Date(currMondayDate);
        nextMondayDate.setDate(nextMondayDate.getDate() + 7);

        submitForm_get_weekData(currMondayDate, currMondayDate.getFullYear(), "currWeek");
        submitForm_get_weekData(nextMondayDate, nextMondayDate.getFullYear(), "nextWeek");
        
    }
});