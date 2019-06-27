
// sešteje in prikaže seštevek ur
function sumAndShow_sestevekUr (weekData) {
    var totalWeekMinutes = 0;
    var totalDayMinutes = { 1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0 }

    var names = Object.keys(weekData);
    // za vsako ime
    names.forEach(name => {
        // za vsak dan
        for (var dayIndex = 1; dayIndex < 8; dayIndex++) {
            var dayData = weekData[name][dayIndex];
            // za vsako celico v tem dnevu s tem imenom
            for (var cellIndex = 0; cellIndex < dayData.length; cellIndex++) {
                // če je posebni oddelek preskoči - ni časov
                
                if (isSpecialOddelek(dayData[cellIndex]) == true) continue;

                var startTime = dayData[cellIndex].startTime;
                var endTime = dayData[cellIndex].endTime;

                var workingTime = get_timeDifference_inMinutes_betweenTwoTimes(startTime, endTime);

                totalDayMinutes[dayIndex] += workingTime;
            }
        }
    });

    for (var dayNum = 1; dayNum < 8; dayNum++) {
        document.getElementById("hours" + dayNum.toString()).innerHTML = Number.parseInt(totalDayMinutes[dayNum] / 60);
        totalWeekMinutes += totalDayMinutes [dayNum];
    }
    
    document.getElementById("hoursTotal").innerHTML = Number.parseInt(totalWeekMinutes / 60);
}