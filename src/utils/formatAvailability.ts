export const formatAvailability = (doc: any) => {
  const days = doc.availableDays;
  const weeks = doc.availableWeeks;

  if (!days || days.length === 0) {
    return doc.description || "Available Everyday";
  }

  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const weekNames = ["", "1st", "2nd", "3rd", "4th", "5th"];

  const selectedDayNames = days.map((d: number) => dayNames[d]);
  let daysStr = "";
  if (selectedDayNames.length === 1) daysStr = selectedDayNames[0];
  else if (selectedDayNames.length === 2) daysStr = selectedDayNames.join(" and ");
  else daysStr = selectedDayNames.slice(0, -1).join(", ") + " and " + selectedDayNames[selectedDayNames.length - 1];

  if (!weeks || weeks.length === 0 || weeks.length === 5) {
    return daysStr;
  }

  const sortedWeeks = [...weeks].sort((a,b) => a - b);
  const selectedWeekNames = sortedWeeks.map((w: number) => weekNames[w]);
  let weeksStr = "";
  if (selectedWeekNames.length === 1) weeksStr = selectedWeekNames[0];
  else if (selectedWeekNames.length === 2) weeksStr = selectedWeekNames.join(" and ");
  else weeksStr = selectedWeekNames.slice(0, -1).join(", ") + " and " + selectedWeekNames[selectedWeekNames.length - 1];

  return `${weeksStr} ${daysStr}`;
};
