import { formatDate } from '@angular/common';
import { Inject, Injectable, LOCALE_ID } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DateHelperService {
    constructor(@Inject(LOCALE_ID) private locale: string) {}

    calculateSecondsUntilEndOfDay(time: number): number {
        var d = new Date(time);
        var h = d.getHours();
        var m = d.getMinutes();
        var s = d.getSeconds();
        return 24 * 60 * 60 - h * 60 * 60 - m * 60 - s;
    }

    calculateSecondsFromStartOfDay(time: number): number {
        var d = new Date(time);
        var h = d.getHours();
        var m = d.getMinutes();
        var s = d.getSeconds();
        return h * 60 * 60 + m * 60 + s;
    }

    calculateTimeDifferenceInSeconds(time2: number, time1: number): number {
        return (time2 - time1) / 1000;
    }

    isMultiDaySpan(startTime: number, endTime: number): boolean {
        return this.getDate(startTime) !== this.getDate(endTime);
    }

    getDate(time: number): string {
        return formatDate(time, 'dd/MM/yyyy', this.locale); 
    }

    convertSecondsToTime(seconds: number): string {
        const isNegative = seconds < 0;

        const hours = Math.floor(seconds / 3600);
        seconds %= 3600;
        const minutes = Math.floor(seconds / 60);
        seconds = seconds % 60;

        return `${isNegative ? '-' : ''}${Math.abs(hours).toString().padStart(2, '0')}:${Math.abs(minutes).toString().padStart(2, '0')}`;
    }

    setMidnightFor(date: Date): Date {
        return new Date(new Date(date).setHours(0,0,0,0))
    }
}
