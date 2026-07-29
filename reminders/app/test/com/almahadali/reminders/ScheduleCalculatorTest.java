package com.almahadali.reminders;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import org.junit.Test;

import java.util.Calendar;

public class ScheduleCalculatorTest {
    @Test
    public void picksNextSlotInsideRange() {
        Calendar after = at(Calendar.MONDAY, 2026, Calendar.JULY, 27, 9, 10);
        long result = ScheduleCalculator.nextRangeOccurrence(
            after.getTimeInMillis(), 8 * 60, 12 * 60, 60, Reminder.EVERY_DAY_MASK
        );
        Calendar next = Calendar.getInstance();
        next.setTimeInMillis(result);
        assertEquals(10, next.get(Calendar.HOUR_OF_DAY));
        assertEquals(0, next.get(Calendar.MINUTE));
    }

    @Test
    public void supportsOvernightRange() {
        Calendar after = at(Calendar.MONDAY, 2026, Calendar.JULY, 27, 23, 15);
        long result = ScheduleCalculator.nextRangeOccurrence(
            after.getTimeInMillis(), 22 * 60, 2 * 60, 60, 1
        );
        Calendar next = Calendar.getInstance();
        next.setTimeInMillis(result);
        assertEquals(0, next.get(Calendar.HOUR_OF_DAY));
        assertEquals(Calendar.TUESDAY, next.get(Calendar.DAY_OF_WEEK));
    }

    @Test
    public void skipsUnselectedDays() {
        Calendar after = at(Calendar.MONDAY, 2026, Calendar.JULY, 27, 18, 0);
        long result = ScheduleCalculator.nextRangeOccurrence(
            after.getTimeInMillis(), 8 * 60, 17 * 60, 60, 1 << 2
        );
        Calendar next = Calendar.getInstance();
        next.setTimeInMillis(result);
        assertEquals(Calendar.WEDNESDAY, next.get(Calendar.DAY_OF_WEEK));
        assertTrue(result > after.getTimeInMillis());
    }

    @Test
    public void intervalRepeatsFromChosenStart() {
        long start = 1_000_000L;
        long result = ScheduleCalculator.nextIntervalOccurrence(start + 31 * 60_000L, start, 15);
        assertEquals(start + 45 * 60_000L, result);
    }

    @Test
    public void advancedRangeUsesDayOverride() {
        Calendar after = at(Calendar.MONDAY, 2026, Calendar.JULY, 27, 18, 0);
        int[] starts = {-1, 6 * 60, -1, -1, -1, -1, -1};
        int[] ends = {-1, 8 * 60, -1, -1, -1, -1, -1};
        long result = ScheduleCalculator.nextRangeOccurrenceAdvanced(
            after.getTimeInMillis(), 9 * 60, 17 * 60, 60,
            Reminder.EVERY_DAY_MASK, starts, ends
        );
        Calendar next = Calendar.getInstance();
        next.setTimeInMillis(result);
        assertEquals(Calendar.TUESDAY, next.get(Calendar.DAY_OF_WEEK));
        assertEquals(6, next.get(Calendar.HOUR_OF_DAY));
    }

    private Calendar at(int expectedDay, int year, int month, int day, int hour, int minute) {
        Calendar value = Calendar.getInstance();
        value.set(year, month, day, hour, minute, 0);
        value.set(Calendar.MILLISECOND, 0);
        assertEquals(expectedDay, value.get(Calendar.DAY_OF_WEEK));
        return value;
    }
}
