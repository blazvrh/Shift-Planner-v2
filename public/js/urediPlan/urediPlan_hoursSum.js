
// sešteje in prikaže seštevek ur
function sumAndShow_sestevekUr (weekData) {
    let totalWeekMinutes = 0;
    let totalDayMinutes = { 1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0 }

    let names = Object.keys(weekData);
    // za vsako ime
    names.forEach(function(name) {
        // za vsak dan
        for (let dayIndex = 1; dayIndex < 8; dayIndex++) {
            let dayData = weekData[name][dayIndex];
            // za vsako celico v tem dnevu s tem imenom
            for (let cellIndex = 0; cellIndex < dayData.length; cellIndex++) {
                // če je posebni oddelek preskoči - ni časov
                
                if (isSpecialOddelek(dayData[cellIndex]) == true) continue;

                let startTime = dayData[cellIndex].startTime;
                let endTime = dayData[cellIndex].endTime;

                let workingTime = get_timeDifference_inMinutes_betweenTwoTimes(startTime, endTime);
                
                totalDayMinutes[dayIndex] += workingTime;
            }
        }
    });

    for (let dayNum = 1; dayNum < 8; dayNum++) {
        document.getElementById("hours" + dayNum.toString()).innerHTML = parseInt(totalDayMinutes[dayNum] / 60);
        totalWeekMinutes += totalDayMinutes [dayNum];
    }
    
    document.getElementById("hoursTotal").innerHTML = parseInt(totalWeekMinutes / 60);
}